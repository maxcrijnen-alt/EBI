import { prisma } from "@/lib/db";
import { gradeOpenAnswer, RubricGrade } from "@/lib/ai";
import { updateExamReadiness, updateMasteryAfterAttempt } from "@/lib/scoring";

export type PracticeMode = "adaptive" | "diagnostic" | "mistakes" | "mock";

export function publicQuestion(question: Awaited<ReturnType<typeof findQuestionById>>) {
  if (!question) return null;

  return {
    id: question.id,
    topic: question.topic.title,
    topicSlug: question.topic.slug,
    subtopic: question.subtopic?.title ?? null,
    sourceType: question.sourceType,
    questionType: question.questionType,
    difficulty: question.difficulty,
    prompt: question.prompt,
    formulaTags: question.formulaTags,
    options: question.options
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((option) => ({
        id: option.id,
        label: option.label,
        text: option.text,
      })),
  };
}

export async function findQuestionById(id: string) {
  return prisma.question.findUnique({
    where: { id },
    include: {
      topic: true,
      subtopic: true,
      options: true,
      rubrics: true,
    },
  });
}

async function recentDiagnosticDifficulty(userId: string) {
  const recent = await prisma.attempt.findMany({
    where: { userId, mode: "DIAGNOSTIC" },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  if (recent.length < 3) return 2;
  const accuracy = recent.filter((attempt) => attempt.isCorrect).length / recent.length;
  if (accuracy > 0.75) return 4;
  if (accuracy < 0.35) return 1;
  return 3;
}

export async function pickNextQuestion(userId: string, mode: PracticeMode, topicSlug?: string | null) {
  const attempted = await prisma.attempt.findMany({
    where: { userId, mode: mode.toUpperCase() },
    select: { questionId: true },
  });
  const attemptedIds = attempted.map((attempt) => attempt.questionId);

  if (mode === "mistakes") {
    const mistake = await prisma.mistake.findFirst({
      where: { userId, fixedLater: false },
      orderBy: [{ reviewed: "asc" }, { createdAt: "asc" }],
      include: { question: { include: { topic: true, subtopic: true, options: true, rubrics: true } } },
    });
    return mistake?.question ?? null;
  }

  if (mode === "diagnostic") {
    const difficulty = await recentDiagnosticDifficulty(userId);
    return prisma.question.findFirst({
      where: {
        id: { notIn: attemptedIds },
        difficulty: { lte: difficulty + 1, gte: Math.max(1, difficulty - 1) },
        reviewStatus: "APPROVED",
      },
      orderBy: [{ difficulty: "asc" }, { topic: { orderIndex: "asc" } }],
      include: { topic: true, subtopic: true, options: true, rubrics: true },
    });
  }

  if (mode === "mock") {
    const phaseIndex = attempted.length % 24;
    const wantsMc = phaseIndex < 20;
    return prisma.question.findFirst({
      where: {
        id: { notIn: attemptedIds },
        reviewStatus: "APPROVED",
        ...(wantsMc ? { options: { some: {} } } : { options: { none: {} } }),
      },
      orderBy: [{ difficulty: "asc" }, { topic: { orderIndex: "asc" } }],
      include: { topic: true, subtopic: true, options: true, rubrics: true },
    });
  }

  const weakMastery = await prisma.userMastery.findFirst({
    where: {
      userId,
      subtopicId: null,
      ...(topicSlug ? { topic: { slug: topicSlug } } : {}),
    },
    orderBy: [{ mastery: "asc" }, { mistakeCount: "desc" }],
    include: { topic: true },
  });

  const targetTopicSlug = topicSlug ?? weakMastery?.topic.slug;
  const targetDifficulty = weakMastery
    ? Math.max(1, Math.min(6, Math.ceil(weakMastery.mastery / 18) + 1))
    : 2;

  const question =
    (await prisma.question.findFirst({
      where: {
        id: { notIn: attemptedIds },
        reviewStatus: "APPROVED",
        ...(targetTopicSlug ? { topic: { slug: targetTopicSlug } } : {}),
        difficulty: { lte: targetDifficulty + 1 },
      },
      orderBy: [{ difficulty: "asc" }, { createdAt: "asc" }],
      include: { topic: true, subtopic: true, options: true, rubrics: true },
    })) ??
    (await prisma.question.findFirst({
      where: {
        reviewStatus: "APPROVED",
        ...(targetTopicSlug ? { topic: { slug: targetTopicSlug } } : {}),
      },
      orderBy: [{ difficulty: "asc" }, { createdAt: "asc" }],
      include: { topic: true, subtopic: true, options: true, rubrics: true },
    }));

  return question;
}

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function classifyMistake(questionType: string, answerText: string, formulaTags?: string | null) {
  if (questionType.includes("WHICH_NOT") || questionType.includes("STATEMENT")) return "MC trap";
  if (questionType === "GRAPH") return "Graph interpretation error";
  if (questionType === "NUMERICAL" && /\d/.test(answerText)) return "Calculation slip";
  if (questionType === "NUMERICAL" && formulaTags) return "Formula error";
  if (questionType === "OPEN_ENDED" && answerText.length < 120) return "Incomplete open-ended explanation";
  if (formulaTags && !containsFormulaHint(answerText, formulaTags)) return "Formula error";
  return "Concept error";
}

function containsFormulaHint(answerText: string, formulaTags: string) {
  const lower = answerText.toLowerCase();
  return formulaTags
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .some((tag) => lower.includes(tag));
}

function answerMatches(expected: string, answer: string) {
  const cleanExpected = normalize(expected);
  const cleanAnswer = normalize(answer);
  if (!cleanAnswer) return false;
  if (cleanExpected === cleanAnswer) return true;

  const expectedNumbers: string[] = cleanExpected.match(/-?\d+(\.\d+)?/g) ?? [];
  if (expectedNumbers.length > 0) {
    const answerNumbers: string[] = cleanAnswer.match(/-?\d+(\.\d+)?/g) ?? [];
    const matched = expectedNumbers.filter((number) => answerNumbers.includes(number)).length;
    return matched >= Math.max(1, Math.ceil(expectedNumbers.length * 0.6));
  }

  const keywords = cleanExpected
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 4);
  return keywords.length > 0 && keywords.filter((word) => cleanAnswer.includes(word)).length >= 2;
}

export async function submitAttempt(params: {
  userId: string;
  questionId: string;
  answerText: string;
  selectedOptionId?: string | null;
  mode: PracticeMode;
  mockSessionId?: string | null;
  timeSpentSeconds?: number;
}) {
  const question = await findQuestionById(params.questionId);
  if (!question) {
    throw new Error("Question not found");
  }

  let isCorrect = false;
  let score = 0;
  let maxScore = 1;
  let feedback = "";
  let mistakeType: string | null = null;
  let selectedLabel = params.answerText;
  let rubricGrade: RubricGrade | null = null;

  if (question.options.length > 0) {
    const selected = params.selectedOptionId
      ? question.options.find((option) => option.id === params.selectedOptionId)
      : question.options.find((option) => option.label === params.answerText);
    isCorrect = Boolean(selected?.isCorrect);
    selectedLabel = selected?.label ?? params.answerText;
    score = isCorrect ? 1 : 0;
    feedback = selected
      ? `${selected.isCorrect ? "Correct." : "Not quite."} ${selected.rationale}`
      : "No option was selected.";
  } else if (
    ["OPEN_ENDED", "DERIVATION", "EXPLAIN_INTUITION", "COMPARE_OUTCOMES", "FIND_THE_MISTAKE"].includes(
      question.questionType,
    )
  ) {
    rubricGrade = await gradeOpenAnswer(question, params.answerText, params.userId);
    maxScore = rubricGrade.maxScore;
    score = rubricGrade.totalScore;
    isCorrect = rubricGrade.totalScore / rubricGrade.maxScore >= 0.72;
    feedback = rubricGrade.feedback;
  } else {
    isCorrect = answerMatches(question.correctAnswer, params.answerText);
    score = isCorrect ? 1 : 0;
    feedback = isCorrect
      ? "Correct. The answer matches the expected result."
      : "Not quite. Compare your setup with the model solution.";
  }

  if (!isCorrect) {
    mistakeType = classifyMistake(question.questionType, params.answerText, question.formulaTags);
  }

  const attempt = await prisma.attempt.create({
    data: {
      userId: params.userId,
      questionId: params.questionId,
      mockSessionId: params.mockSessionId ?? undefined,
      answerText: selectedLabel || params.answerText,
      selectedOptionId: params.selectedOptionId ?? undefined,
      isCorrect,
      score,
      maxScore,
      mode: params.mode.toUpperCase(),
      feedback,
      mistakeType,
      timeSpentSeconds: params.timeSpentSeconds ?? 0,
    },
  });

  if (rubricGrade && question.rubrics[0]) {
    await prisma.rubricScore.create({
      data: {
        userId: params.userId,
        rubricId: question.rubrics[0].id,
        attemptId: attempt.id,
        totalScore: rubricGrade.totalScore,
        maxScore: rubricGrade.maxScore,
        feedback: rubricGrade.feedback,
        correctParts: rubricGrade.correctParts,
        missingParts: rubricGrade.missingParts,
        modelAnswer: rubricGrade.modelAnswer,
        rewrittenAnswer: rubricGrade.rewrittenAnswer,
        dimensionsJson: JSON.stringify(rubricGrade.dimensions),
      },
    });
  }

  let mistakeCreated = false;

  if (!isCorrect) {
    await prisma.mistake.create({
      data: {
        userId: params.userId,
        questionId: question.id,
        attemptId: attempt.id,
        topicId: question.topicId,
        subtopicId: question.subtopicId ?? undefined,
        questionSnapshot: question.prompt,
        userAnswer: selectedLabel || params.answerText,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        difficulty: question.difficulty,
        mistakeType: mistakeType ?? "Concept error",
        formula: question.formulaTags ?? undefined,
      },
    });

    await prisma.flashcard.create({
      data: {
        userId: params.userId,
        topicId: question.topicId,
        subtopicId: question.subtopicId ?? undefined,
        category: "Mistakes made by the student",
        front: `Fix this mistake: ${question.prompt}`,
        back: question.explanation,
        trap: `Mistake type: ${mistakeType ?? "Concept error"}`,
        sourceType: "MISTAKE_GENERATED",
        formulaTags: question.formulaTags ?? undefined,
      },
    });

    mistakeCreated = true;
  }

  await updateMasteryAfterAttempt({
    userId: params.userId,
    topicId: question.topicId,
    subtopicId: question.subtopicId,
    isCorrect,
    score,
    maxScore,
    difficulty: question.difficulty,
    mistakeCreated,
  });

  if (params.mode === "diagnostic") {
    const diagnosticAttempts = await prisma.attempt.findMany({
      where: { userId: params.userId, mode: "DIAGNOSTIC" },
    });
    const diagnosticScore =
      diagnosticAttempts.length > 0
        ? Math.round(
            (diagnosticAttempts.reduce((sum, item) => sum + item.score / Math.max(item.maxScore, 1), 0) /
              diagnosticAttempts.length) *
              100,
          )
        : 0;

    await prisma.user.update({
      where: { id: params.userId },
      data: {
        diagnosticScore,
        diagnosticCompleted: diagnosticAttempts.length >= 10,
      },
    });
  }

  const readiness = await updateExamReadiness(params.userId);

  return {
    attemptId: attempt.id,
    isCorrect,
    score,
    maxScore,
    feedback,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    mistakeType,
    rubricDimensions: rubricGrade?.dimensions ?? null,
    readiness,
  };
}
