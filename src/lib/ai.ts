import { defaultRubricDimensions } from "@/lib/course-data";

export type QuestionForAI = {
  prompt: string;
  correctAnswer: string;
  explanation: string;
  questionType: string;
  formulaTags?: string | null;
  topic?: { title: string } | null;
  options?: Array<{ label: string; text: string; rationale: string; isCorrect: boolean }>;
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

async function openAIText(prompt: string) {
  if (!process.env.OPENAI_API_KEY) return null;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
        input: prompt,
      }),
    });

    if (!response.ok) return null;

    const json = await response.json();
    return json.output_text as string | undefined;
  } catch {
    return null;
  }
}

export async function explainQuestion(params: {
  question: QuestionForAI;
  style: string;
  userAnswer?: string;
}) {
  const label = styleLabels[params.style] ?? "Step-by-step exam solution";

  const aiPrompt = [
    "You are an AI tutor for Tilburg University Microeconomics: Markets and Games.",
    "Use original explanation wording. Do not claim this is an official exam question.",
    `Style: ${label}.`,
    `Question: ${params.question.prompt}`,
    `Correct answer: ${params.question.correctAnswer}`,
    params.userAnswer ? `Student answer: ${params.userAnswer}` : "",
    `Base explanation: ${params.question.explanation}`,
    "For calculations, include formula, setup, substitution, calculation, final answer, economic interpretation, and common trap unless the style asks for only a hint.",
  ].join("\n");

  const ai = await openAIText(aiPrompt);
  if (ai) return ai;

  if (params.style === "hint") {
    return `Hint: identify the relevant topic first (${params.question.topic?.title ?? "course topic"}), then write the formula before substituting numbers. Do not jump straight to the final answer.`;
  }

  if (params.style === "second_try") {
    return "Try again with this structure: write the formula, plug in the values, calculate one line at a time, then add one sentence explaining the economic meaning.";
  }

  if (params.style === "options" && params.question.options?.length) {
    return params.question.options
      .map((option) => `${option.label}. ${option.isCorrect ? "Correct." : "Wrong."} ${option.rationale}`)
      .join("\n");
  }

  if (params.style === "intuition") {
    return `Intuition: the question is testing ${params.question.topic?.title ?? "a core microeconomics relationship"}. The key idea is to connect the economic rule to the result before calculating. ${params.question.explanation}`;
  }

  if (params.style === "formula") {
    return `Formula focus: use ${params.question.formulaTags ?? "the relevant course formula"}. Then apply it carefully.\n\n${params.question.explanation}`;
  }

  if (params.style === "wrong" && params.userAnswer) {
    return `Your answer was "${params.userAnswer}". Compare it with the required result: ${params.question.correctAnswer}. The likely issue is a formula choice, setup, or interpretation step. A full correction is:\n\n${params.question.explanation}`;
  }

  if (params.style === "similar") {
    return `Similar example: keep the same logic but change the numbers or context. First solve the formula/setup step, then calculate. Original worked solution:\n\n${params.question.explanation}`;
  }

  if (params.style === "harder") {
    return `Harder version: add one extra step, such as comparing welfare, calculating profit, or explaining the intuition after the numerical result. Base solution:\n\n${params.question.explanation}`;
  }

  if (params.style === "easier") {
    return `Easier version: identify only the formula and first substitution before doing the full calculation. Base solution:\n\n${params.question.explanation}`;
  }

  return [
    `Style: ${label}`,
    "",
    "1. Formula/setup:",
    params.question.formulaTags ? `Use ${params.question.formulaTags}.` : "Use the relevant course relationship.",
    "",
    "2. Work:",
    params.question.explanation,
    "",
    "3. Final answer:",
    params.question.correctAnswer,
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

export async function gradeOpenAnswer(question: QuestionForAI, answer: string): Promise<RubricGrade> {
  const aiPrompt = [
    "Grade this open-ended microeconomics answer with partial credit.",
    "Return concise JSON with totalScore, maxScore, feedback, correctParts, missingParts, modelAnswer, rewrittenAnswer, and dimensions.",
    `Question: ${question.prompt}`,
    `Correct answer: ${question.correctAnswer}`,
    `Reference explanation: ${question.explanation}`,
    `Student answer: ${answer}`,
    `Dimensions: ${defaultRubricDimensions.join(", ")}`,
  ].join("\n");

  const ai = await openAIText(aiPrompt);
  if (ai) {
    try {
      const parsed = JSON.parse(ai) as RubricGrade;
      if (typeof parsed.totalScore === "number") return parsed;
    } catch {
      // Fall through to deterministic grading.
    }
  }

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
  ]);
  const hasSetup = containsAny(normalized, ["=", "set", "solve", "where", "because", "therefore"]);
  const hasCalculation = countNumbers(normalized) >= 2 || containsAny(normalized, ["derive", "differentiate"]);
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
  ]);
  const hasClarity = normalized.length > 80;
  const hasSteps = normalized.split(/\n|\.|;/).filter((line) => line.trim().length > 8).length >= 3;
  const hasTerminology = containsAny(normalized, (question.formulaTags ?? "").split(",").concat(["marginal", "equilibrium", "profit", "cost", "demand"]));

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

export function buildPanicPlan(params: {
  hours: string;
  goal: string;
  weakest: string;
  weakTopics: string[];
}) {
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
