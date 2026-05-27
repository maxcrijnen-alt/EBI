import "server-only";
import { defaultRubricDimensions } from "@/lib/course-data";
import { prisma } from "@/lib/db";

export type QuestionForAI = {
  prompt: string;
  correctAnswer: string;
  explanation: string;
  questionType: string;
  formulaTags?: string | null;
  topic?: { title: string } | null;
  options?: Array<{ label: string; text: string; rationale: string; isCorrect: boolean }>;
};

export type AITextResult = {
  text: string;
  aiUsed: boolean;
  fallbackReason?: string;
};

export type RubricGrade = {
  totalScore: number;
  maxScore: number;
  feedback: string;
  correctParts: string;
  missingParts: string;
  modelAnswer: string;
  rewrittenAnswer: string;
  dimensions: Array<{ name: string; score: number; max: number; note: string }>;
  aiUsed?: boolean;
  fallbackReason?: string;
};

export type PanicPlan = {
  title: string;
  blocks: Array<{ name: string; tasks: string[] }>;
};

type AIRequest = {
  purpose: string;
  prompt: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  maxOutputTokens?: number;
};

const styleLabels: Record<string, string> = {
  quick: "Quick answer",
  step: "Step-by-step exam solution",
  intuition: "Intuition first",
  formula: "Formula first",
  professor: "Professor-style explanation",
  confused: "Explain like I am confused",
  hint: "Show only a hint",
  second_try: "Give me a second try",
  wrong: "Explain why my answer is wrong",
  options: "Explain why each MC option is wrong",
  similar: "Give a similar example",
  harder: "Give me a harder version",
  easier: "Give me an easier version",
};

const RATE_LIMIT_WINDOW_MINUTES = Number(process.env.AI_RATE_LIMIT_WINDOW_MINUTES ?? 60);
const RATE_LIMIT_MAX = Number(process.env.AI_RATE_LIMIT_MAX ?? 40);

function aiModel() {
  return process.env.OPENAI_MODEL ?? "gpt-5.4-mini";
}

async function logAIInteraction(params: {
  userId?: string;
  purpose: string;
  model?: string;
  status: string;
  fallbackReason?: string;
  promptChars?: number;
  responseChars?: number;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.aIInteraction.create({
      data: {
        userId: params.userId,
        purpose: params.purpose,
        model: params.model,
        status: params.status,
        fallbackReason: params.fallbackReason,
        promptChars: params.promptChars ?? 0,
        responseChars: params.responseChars ?? 0,
        metadataJson: params.metadata ? JSON.stringify(params.metadata) : undefined,
      },
    });
  } catch {
    // AI logging should never block studying.
  }
}

async function checkRateLimit(userId?: string) {
  if (!userId) return { allowed: true as const };

  const since = new Date();
  since.setMinutes(since.getMinutes() - RATE_LIMIT_WINDOW_MINUTES);
  const count = await prisma.aIInteraction.count({
    where: {
      userId,
      status: "SUCCESS",
      createdAt: { gte: since },
    },
  });

  if (count >= RATE_LIMIT_MAX) {
    return {
      allowed: false as const,
      reason: `rate_limit_${RATE_LIMIT_MAX}_per_${RATE_LIMIT_WINDOW_MINUTES}m`,
    };
  }

  return { allowed: true as const };
}

function extractResponseText(json: unknown) {
  if (json && typeof json === "object" && "output_text" in json && typeof json.output_text === "string") {
    return json.output_text;
  }

  const output = json && typeof json === "object" && "output" in json ? json.output : null;
  if (!Array.isArray(output)) return null;

  const parts: string[] = [];
  for (const item of output) {
    if (!item || typeof item !== "object" || !("content" in item) || !Array.isArray(item.content)) continue;
    for (const content of item.content) {
      if (content && typeof content === "object" && "text" in content && typeof content.text === "string") {
        parts.push(content.text);
      }
    }
  }

  return parts.length ? parts.join("\n") : null;
}

function stripJsonFence(value: string) {
  return value
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
}

export async function requestAIText(params: AIRequest): Promise<{
  text: string | null;
  aiUsed: boolean;
  fallbackReason?: string;
}> {
  if (!process.env.OPENAI_API_KEY) {
    await logAIInteraction({
      userId: params.userId,
      purpose: params.purpose,
      model: aiModel(),
      status: "FALLBACK",
      fallbackReason: "missing_openai_api_key",
      promptChars: params.prompt.length,
      metadata: params.metadata,
    });
    return { text: null, aiUsed: false, fallbackReason: "missing_openai_api_key" };
  }

  const rateLimit = await checkRateLimit(params.userId);
  if (!rateLimit.allowed) {
    await logAIInteraction({
      userId: params.userId,
      purpose: params.purpose,
      model: aiModel(),
      status: "RATE_LIMITED",
      fallbackReason: rateLimit.reason,
      promptChars: params.prompt.length,
      metadata: params.metadata,
    });
    return { text: null, aiUsed: false, fallbackReason: rateLimit.reason };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: aiModel(),
        input: params.prompt,
        max_output_tokens: params.maxOutputTokens ?? 1200,
      }),
    });

    if (!response.ok) {
      const fallbackReason = `openai_http_${response.status}`;
      await logAIInteraction({
        userId: params.userId,
        purpose: params.purpose,
        model: aiModel(),
        status: "ERROR",
        fallbackReason,
        promptChars: params.prompt.length,
        metadata: params.metadata,
      });
      return { text: null, aiUsed: false, fallbackReason };
    }

    const json = await response.json();
    const text = extractResponseText(json);
    if (!text) {
      await logAIInteraction({
        userId: params.userId,
        purpose: params.purpose,
        model: aiModel(),
        status: "ERROR",
        fallbackReason: "empty_openai_response",
        promptChars: params.prompt.length,
        metadata: params.metadata,
      });
      return { text: null, aiUsed: false, fallbackReason: "empty_openai_response" };
    }

    await logAIInteraction({
      userId: params.userId,
      purpose: params.purpose,
      model: aiModel(),
      status: "SUCCESS",
      promptChars: params.prompt.length,
      responseChars: text.length,
      metadata: params.metadata,
    });
    return { text, aiUsed: true };
  } catch {
    await logAIInteraction({
      userId: params.userId,
      purpose: params.purpose,
      model: aiModel(),
      status: "ERROR",
      fallbackReason: "openai_request_failed",
      promptChars: params.prompt.length,
      metadata: params.metadata,
    });
    return { text: null, aiUsed: false, fallbackReason: "openai_request_failed" };
  }
}

export async function requestAIJson<T>(params: AIRequest): Promise<{
  value: T | null;
  aiUsed: boolean;
  fallbackReason?: string;
}> {
  const result = await requestAIText(params);
  if (!result.text) {
    return { value: null, aiUsed: result.aiUsed, fallbackReason: result.fallbackReason };
  }

  try {
    return { value: JSON.parse(stripJsonFence(result.text)) as T, aiUsed: true };
  } catch {
    await logAIInteraction({
      userId: params.userId,
      purpose: `${params.purpose}:json_parse`,
      model: aiModel(),
      status: "ERROR",
      fallbackReason: "invalid_json",
      promptChars: params.prompt.length,
      responseChars: result.text.length,
      metadata: params.metadata,
    });
    return { value: null, aiUsed: false, fallbackReason: "invalid_json" };
  }
}

export async function explainQuestion(params: {
  question: QuestionForAI;
  style: string;
  userAnswer?: string;
  userId?: string;
}): Promise<AITextResult> {
  const label = styleLabels[params.style] ?? "Step-by-step exam solution";

  const aiPrompt = [
    "You are an AI tutor for Tilburg University Microeconomics: Markets and Games.",
    "Use original explanation wording. Never claim this is an official exam question.",
    "Focus on understanding and exam-quality visible reasoning.",
    `Style: ${label}.`,
    `Question type: ${params.question.questionType}`,
    `Topic: ${params.question.topic?.title ?? "Microeconomics"}`,
    `Question: ${params.question.prompt}`,
    `Correct answer: ${params.question.correctAnswer}`,
    params.userAnswer ? `Student answer: ${params.userAnswer}` : "",
    `Base explanation: ${params.question.explanation}`,
    "For calculations, include formula, setup, substitution, calculation, final answer, economic interpretation, and common trap unless the style asks only for a hint.",
  ].join("\n");

  const ai = await requestAIText({
    purpose: "question_explanation",
    userId: params.userId,
    prompt: aiPrompt,
    metadata: { style: params.style, questionType: params.question.questionType },
  });
  if (ai.text) return { text: ai.text, aiUsed: true };

  return {
    text: deterministicExplanation(params.question, params.style, params.userAnswer),
    aiUsed: false,
    fallbackReason: ai.fallbackReason,
  };
}

function deterministicExplanation(question: QuestionForAI, style: string, userAnswer?: string) {
  const label = styleLabels[style] ?? "Step-by-step exam solution";

  if (style === "hint") {
    return `Hint: identify the relevant topic first (${question.topic?.title ?? "course topic"}), then write the formula before substituting numbers. Do not jump straight to the final answer.`;
  }

  if (style === "second_try") {
    return "Try again with this structure: write the formula, plug in the values, calculate one line at a time, then add one sentence explaining the economic meaning.";
  }

  if (style === "options" && question.options?.length) {
    return question.options
      .map((option) => `${option.label}. ${option.isCorrect ? "Correct." : "Wrong."} ${option.rationale}`)
      .join("\n");
  }

  if (style === "intuition") {
    return `Intuition: the question is testing ${question.topic?.title ?? "a core microeconomics relationship"}. The key idea is to connect the economic rule to the result before calculating. ${question.explanation}`;
  }

  if (style === "formula") {
    return `Formula focus: use ${question.formulaTags ?? "the relevant course formula"}. Then apply it carefully.\n\n${question.explanation}`;
  }

  if (style === "wrong" && userAnswer) {
    return `Your answer was "${userAnswer}". Compare it with the required result: ${question.correctAnswer}. The likely issue is a formula choice, setup, or interpretation step. A full correction is:\n\n${question.explanation}`;
  }

  if (style === "similar") {
    return `Similar example: keep the same logic but change the numbers or context. First solve the formula/setup step, then calculate. Original worked solution:\n\n${question.explanation}`;
  }

  if (style === "harder") {
    return `Harder version: add one extra step, such as comparing welfare, calculating profit, or explaining the intuition after the numerical result. Base solution:\n\n${question.explanation}`;
  }

  if (style === "easier") {
    return `Easier version: identify only the formula and first substitution before doing the full calculation. Base solution:\n\n${question.explanation}`;
  }

  return [
    `Style: ${label}`,
    "",
    "1. Formula/setup:",
    question.formulaTags ? `Use ${question.formulaTags}.` : "Use the relevant course relationship.",
    "",
    "2. Work:",
    question.explanation,
    "",
    "3. Final answer:",
    question.correctAnswer,
    "",
    "4. Common trap:",
    "Do not skip the setup. The real exam rewards visible reasoning and partial-credit steps.",
  ].join("\n");
}

function containsAny(answer: string, words: string[]) {
  const lower = answer.toLowerCase();
  return words.some((word) => lower.includes(word.toLowerCase()));
}

function countNumbers(answer: string) {
  return answer.match(/-?\d+(\.\d+)?/g)?.length ?? 0;
}

export async function gradeOpenAnswer(
  question: QuestionForAI,
  answer: string,
  userId?: string,
): Promise<RubricGrade> {
  const aiPrompt = [
    "Grade this open-ended microeconomics answer with partial credit.",
    "Return only valid JSON with totalScore, maxScore, feedback, correctParts, missingParts, modelAnswer, rewrittenAnswer, and dimensions.",
    "Each dimension must have name, score, max, and note. Use scores 0, 0.5, or 1 unless a category is not applicable.",
    "Reward visible exam steps: formula, setup, calculation, final answer, interpretation, clarity, and terminology.",
    `Question: ${question.prompt}`,
    `Correct answer: ${question.correctAnswer}`,
    `Reference explanation: ${question.explanation}`,
    `Student answer: ${answer}`,
    `Dimensions: ${defaultRubricDimensions.join(", ")}`,
  ].join("\n");

  const ai = await requestAIJson<RubricGrade>({
    purpose: "open_answer_grading",
    userId,
    prompt: aiPrompt,
    metadata: { questionType: question.questionType, topic: question.topic?.title },
  });
  if (ai.value && typeof ai.value.totalScore === "number" && Array.isArray(ai.value.dimensions)) {
    return { ...ai.value, aiUsed: true };
  }

  return {
    ...deterministicOpenAnswerGrade(question, answer),
    aiUsed: false,
    fallbackReason: ai.fallbackReason,
  };
}

function deterministicOpenAnswerGrade(question: QuestionForAI, answer: string): RubricGrade {
  const normalized = answer.trim();
  const hasFormula = containsAny(normalized, [
    "mr",
    "mc",
    "tr",
    "tc",
    "ac",
    "elastic",
    "nash",
    "best response",
    "dwl",
    "surplus",
    "tax",
    "profit",
    "formula:",
  ]);
  const hasSetup = containsAny(normalized, ["=", "set", "solve", "where", "because", "therefore", "setup:"]);
  const hasCalculation = countNumbers(normalized) >= 2 || containsAny(normalized, ["derive", "differentiate", "calculation:"]);
  const hasFinal = containsAny(normalized, question.correctAnswer.split(/[,\s;=]+/).filter((part) => part.length > 2));
  const hasInterpretation = containsAny(normalized, [
    "economic",
    "intuition",
    "means",
    "because",
    "incentive",
    "surplus",
    "efficient",
    "welfare",
    "burden",
    "interpretation:",
  ]);
  const hasClarity = normalized.length > 80;
  const hasSteps = normalized.split(/\n|\.|;/).filter((line) => line.trim().length > 8).length >= 3;
  const hasTerminology = containsAny(
    normalized,
    (question.formulaTags ?? "").split(",").concat(["marginal", "equilibrium", "profit", "cost", "demand"]),
  );

  const checks = [
    [defaultRubricDimensions[0], hasFormula, "Relevant formula or concept is stated."],
    [defaultRubricDimensions[1], hasSetup, "Setup connects the formula to the problem."],
    [defaultRubricDimensions[2], hasCalculation, "Calculation or derivation work is visible."],
    [defaultRubricDimensions[3], hasFinal, "Final answer is aligned with the expected result."],
    [defaultRubricDimensions[4], hasInterpretation, "Economic interpretation is included."],
    [defaultRubricDimensions[5], hasClarity, "Answer is clear enough to grade."],
    [defaultRubricDimensions[6], hasSteps, "Reasoning is broken into steps."],
    [defaultRubricDimensions[7], hasTerminology, "Course terminology is used correctly."],
  ] as const;

  const dimensions = checks.map(([name, passed, note]) => ({
    name,
    score: passed ? 1 : 0,
    max: 1,
    note: passed ? note : `Missing or weak: ${name.toLowerCase()}.`,
  }));

  const totalScore = dimensions.reduce((sum, item) => sum + item.score, 0);
  const missing = dimensions.filter((item) => item.score === 0).map((item) => item.name);

  return {
    totalScore,
    maxScore: dimensions.length,
    feedback:
      totalScore >= 6
        ? "Good exam structure. Tighten any missing formula/calculation details for full credit."
        : "The answer needs more visible steps. Write the formula, setup, substitution, final result, and interpretation.",
    correctParts: dimensions
      .filter((item) => item.score > 0)
      .map((item) => item.name)
      .join(", "),
    missingParts: missing.length ? missing.join(", ") : "No major rubric gaps detected.",
    modelAnswer: question.explanation,
    rewrittenAnswer: `Use this exam-quality structure: ${question.explanation} Therefore, the final answer is ${question.correctAnswer}.`,
    dimensions,
  };
}

function deterministicPanicPlan(params: {
  hours: string;
  goal: string;
  weakest: string;
  weakTopics: string[];
}): PanicPlan {
  const highYield = [
    "MR = MC monopoly calculations",
    "P = MC = AC long-run competition",
    "cost curve and average/marginal cost relationships",
    "tax incidence, tax revenue, and DWL triangles",
    "Nash equilibrium and dominant strategies",
    "Cournot vs Bertrand logic",
    "network effects threshold benefit = qn - p",
  ];

  return {
    title: `Panic plan: ${params.hours}, goal ${params.goal}`,
    blocks: [
      {
        name: "Must-know formulas",
        tasks: highYield.slice(0, params.goal === "Pass" ? 4 : 7),
      },
      {
        name: "Weak-topic repair",
        tasks: params.weakTopics.length
          ? params.weakTopics.map((topic) => `Do 3 targeted questions for ${topic}`)
          : [`Start with the area you marked weakest: ${params.weakest}`],
      },
      {
        name: "Fast practice",
        tasks: [
          "Do one mixed MC set without a timer.",
          "Write two open-ended answers with full formula/setup/substitution/interpretation.",
          "Review every mistake immediately and turn one into a flashcard.",
        ],
      },
      {
        name: "Final check",
        tasks: [
          "Recite the formula bank from memory.",
          "Do a flashcard sprint: Again/Hard/Good/Easy.",
          "Read the common traps for NOT-correct and Statement I/II questions.",
        ],
      },
    ],
  };
}

export async function buildPanicPlan(params: {
  hours: string;
  goal: string;
  weakest: string;
  weakTopics: string[];
  userId?: string;
}): Promise<{ plan: PanicPlan; aiUsed: boolean; fallbackReason?: string }> {
  const aiPrompt = [
    "Create a concise panic-mode revision plan for Tilburg University Microeconomics: Markets and Games.",
    "Return only valid JSON with title and blocks. Each block must have name and tasks.",
    "Prioritize weak topics, frequently tested formulas, mistake review, flashcard sprint, and open-ended answer structure.",
    `Available time: ${params.hours}`,
    `Goal: ${params.goal}`,
    `Student says weakest: ${params.weakest}`,
    `Measured weak topics: ${params.weakTopics.join(", ") || "none yet"}`,
  ].join("\n");

  const ai = await requestAIJson<PanicPlan>({
    purpose: "panic_plan",
    userId: params.userId,
    prompt: aiPrompt,
    metadata: { hours: params.hours, goal: params.goal },
  });
  if (ai.value?.title && Array.isArray(ai.value.blocks)) {
    return { plan: ai.value, aiUsed: true };
  }

  return {
    plan: deterministicPanicPlan(params),
    aiUsed: false,
    fallbackReason: ai.fallbackReason,
  };
}
