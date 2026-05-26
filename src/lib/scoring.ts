import { prisma } from "@/lib/db";

export function masteryStatus(score: number) {
  if (score <= 0) return "NOT_STARTED";
  if (score < 40) return "WEAK";
  if (score < 65) return "DEVELOPING";
  if (score < 82) return "EXAM_READY";
  return "MASTERED";
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export async function ensureMasteryRecords(userId: string) {
  const topics = await prisma.topic.findMany({
    select: { id: true, subtopics: { select: { id: true } } },
  });

  for (const topic of topics) {
    const existingTopic = await prisma.userMastery.findFirst({
      where: { userId, topicId: topic.id, subtopicId: null },
    });

    if (!existingTopic) {
      await prisma.userMastery.create({
        data: { userId, topicId: topic.id },
      });
    }

    for (const subtopic of topic.subtopics) {
      const existingSubtopic = await prisma.userMastery.findFirst({
        where: { userId, topicId: topic.id, subtopicId: subtopic.id },
      });

      if (!existingSubtopic) {
        await prisma.userMastery.create({
          data: { userId, topicId: topic.id, subtopicId: subtopic.id },
        });
      }
    }
  }
}

async function updateOneMastery(params: {
  userId: string;
  topicId: string;
  subtopicId?: string | null;
  isCorrect: boolean;
  score: number;
  maxScore: number;
  difficulty: number;
  mistakeCreated: boolean;
}) {
  const existing =
    (await prisma.userMastery.findFirst({
      where: {
        userId: params.userId,
        topicId: params.topicId,
        subtopicId: params.subtopicId ?? null,
      },
    })) ??
    (await prisma.userMastery.create({
      data: {
        userId: params.userId,
        topicId: params.topicId,
        subtopicId: params.subtopicId ?? undefined,
      },
    }));

  const attempts = existing.attempts + 1;
  const correct = existing.correct + (params.isCorrect ? 1 : 0);
  const accuracy = (correct / attempts) * 100;
  const partial = params.maxScore > 0 ? (params.score / params.maxScore) * 100 : 0;
  const difficultyBonus = (params.difficulty / 6) * 100;
  const recentSignal = params.isCorrect ? Math.max(partial, 62) : Math.min(partial, 45);
  const mastery = clamp(
    existing.mastery * 0.62 + accuracy * 0.18 + recentSignal * 0.12 + difficultyBonus * 0.08,
  );

  const mistakeCount = existing.mistakeCount + (params.mistakeCreated ? 1 : 0);

  await prisma.userMastery.update({
    where: { id: existing.id },
    data: {
      attempts,
      correct,
      accuracy,
      mastery,
      status: masteryStatus(mastery),
      difficultyReached: Math.max(existing.difficultyReached, params.difficulty),
      mistakeCount,
      lastPracticedAt: new Date(),
    },
  });
}

export async function updateMasteryAfterAttempt(params: {
  userId: string;
  topicId: string;
  subtopicId?: string | null;
  isCorrect: boolean;
  score: number;
  maxScore: number;
  difficulty: number;
  mistakeCreated: boolean;
}) {
  await updateOneMastery({ ...params, subtopicId: null });

  if (params.subtopicId) {
    await updateOneMastery(params);
  }

  await updateExamReadiness(params.userId);
}

export async function calculateExamReadiness(userId: string) {
  const [masteryScores, attempts, mistakes, reviews] = await Promise.all([
    prisma.userMastery.findMany({
      where: { userId, subtopicId: null },
      include: { topic: { select: { weight: true } } },
    }),
    prisma.attempt.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 80,
    }),
    prisma.mistake.count({
      where: { userId, fixedLater: false },
    }),
    prisma.flashcardReview.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 80,
    }),
  ]);

  const totalWeight = masteryScores.reduce((sum, item) => sum + item.topic.weight, 0) || 1;
  const weightedMastery =
    masteryScores.reduce((sum, item) => sum + item.mastery * item.topic.weight, 0) / totalWeight;

  const accuracy =
    attempts.length > 0
      ? (attempts.filter((attempt) => attempt.isCorrect).length / attempts.length) * 100
      : 0;

  const difficulty =
    attempts.length > 0
      ? (attempts.reduce((sum, attempt) => sum + attempt.score / Math.max(attempt.maxScore, 1), 0) /
          attempts.length) *
        100
      : 0;

  const flashcardRetention =
    reviews.length > 0
      ? (reviews.filter((review) => review.rating === "GOOD" || review.rating === "EASY").length /
          reviews.length) *
        100
      : 0;

  const mistakePenalty = clamp(mistakes * 1.2, 0, 24);
  const consistency = clamp(Math.min(attempts.length, 30) * 2.5, 0, 75);

  return Math.round(
    clamp(
      weightedMastery * 0.42 +
        accuracy * 0.2 +
        difficulty * 0.12 +
        flashcardRetention * 0.1 +
        consistency * 0.16 -
        mistakePenalty,
    ),
  );
}

export async function updateExamReadiness(userId: string) {
  const readiness = await calculateExamReadiness(userId);
  await prisma.user.update({
    where: { id: userId },
    data: { examReadinessScore: readiness },
  });
  return readiness;
}
