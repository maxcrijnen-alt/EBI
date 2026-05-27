import { defaultRubricDimensions, formulaSeeds } from "@/lib/course-data";
import { prisma } from "@/lib/db";

type DraftOption = {
  label: string;
  text: string;
  isCorrect: boolean;
  rationale: string;
};

type Playbook = {
  formulaTags: string;
  rule: string;
  trap: string;
  numericPrompt: string;
  correctAnswer: string;
  explanation: string;
};

const openEndedTypes = new Set([
  "OPEN_ENDED",
  "DERIVATION",
  "EXPLAIN_INTUITION",
  "COMPARE_OUTCOMES",
  "FIND_THE_MISTAKE",
]);

const draftTypes = [
  "MCQ",
  "WHICH_NOT_CORRECT",
  "NUMERICAL",
  "OPEN_ENDED",
  "DERIVATION",
  "FIND_THE_MISTAKE",
  "EXPLAIN_INTUITION",
  "COMPARE_OUTCOMES",
];

const playbooks: Record<string, Playbook> = {
  "production-costs": {
    formulaTags: "TC, FC, VC, AC, AVC, AFC, MC",
    rule: "Marginal cost is the extra total cost from one more unit, while average cost spreads total cost over all units.",
    trap: "Treating fixed cost as if it changes when output changes.",
    numericPrompt:
      "A firm has fixed cost 48 and variable cost VC(q) = 6q + q^2. At q = 6, calculate TC, AC, and MC.",
    correctAnswer: "TC = 120, AC = 20, MC = 18.",
    explanation:
      "TC = FC + VC = 48 + 6(6) + 6^2 = 120. AC = TC/q = 120/6 = 20. MC is the derivative of TC with respect to q: MC = 6 + 2q, so MC = 18 at q = 6.",
  },
  "demand-revenue-elasticity": {
    formulaTags: "inverse demand, TR, MR, elasticity",
    rule: "For linear inverse demand P = a - bQ, total revenue is PQ and marginal revenue has twice the slope: MR = a - 2bQ.",
    trap: "Using demand price as marginal revenue for a firm with market power.",
    numericPrompt:
      "Inverse demand is P = 60 - 2Q. At Q = 10, calculate price, total revenue, and marginal revenue.",
    correctAnswer: "P = 40, TR = 400, MR = 20.",
    explanation:
      "Substitute Q = 10 into demand: P = 60 - 20 = 40. TR = PQ = 40(10) = 400. Since TR = 60Q - 2Q^2, MR = 60 - 4Q = 20.",
  },
  "profit-maximization": {
    formulaTags: "profit, MR, MC, isoprofit",
    rule: "Profit is maximized where marginal revenue equals marginal cost, provided the firm checks whether the result is economically feasible.",
    trap: "Choosing the highest output level because revenue is highest, without comparing marginal revenue and marginal cost.",
    numericPrompt:
      "A firm faces P = 80 - 2Q and TC = 100 + 8Q + Q^2. Find the profit-maximizing Q and profit.",
    correctAnswer: "Q = 12 and profit = 332.",
    explanation:
      "TR = 80Q - 2Q^2, so MR = 80 - 4Q. MC = 8 + 2Q. Set MR = MC: 80 - 4Q = 8 + 2Q, so Q = 12. Price is 56, revenue is 672, cost is 340, and profit is 332.",
  },
  "perfect-competition": {
    formulaTags: "P = MC, P = MC = AC, long-run equilibrium",
    rule: "A competitive firm takes price as given and chooses output where P = MC if price covers the relevant cost.",
    trap: "Letting an individual competitive firm choose the market price.",
    numericPrompt:
      "A competitive firm has TC = 50 + 4q + q^2 and market price P = 24. Find the firm's output and profit.",
    correctAnswer: "q = 10 and profit = 50.",
    explanation:
      "MC = 4 + 2q. Set P = MC: 24 = 4 + 2q, so q = 10. Revenue is 240 and total cost is 50 + 40 + 100 = 190, so profit is 50.",
  },
  "monopoly-welfare": {
    formulaTags: "MR = MC, consumer surplus, producer surplus, deadweight loss",
    rule: "A monopoly chooses the quantity where MR = MC, then charges the price on the demand curve.",
    trap: "Setting price equal to marginal cost for a monopoly without checking marginal revenue.",
    numericPrompt:
      "A monopolist faces P = 100 - Q and constant MC = 20. Find the monopoly quantity and price.",
    correctAnswer: "Q = 40 and P = 60.",
    explanation:
      "TR = 100Q - Q^2, so MR = 100 - 2Q. Set MR = MC: 100 - 2Q = 20, giving Q = 40. Demand gives P = 100 - 40 = 60.",
  },
  "taxes-surplus": {
    formulaTags: "tax wedge, tax revenue, deadweight loss, incidence",
    rule: "A tax creates a wedge between buyer price and seller price; incidence depends on relative elasticities, not on who legally pays.",
    trap: "Assuming the legal payer of a tax bears the full economic burden.",
    numericPrompt:
      "Demand is P = 100 - Q and supply is P = 20 + Q. A per-unit tax of 20 is placed on sellers. Find Q, buyer price, seller price, tax revenue, and DWL.",
    correctAnswer: "Q = 30, buyer price = 70, seller price = 50, tax revenue = 600, DWL = 100.",
    explanation:
      "With the tax, buyer price equals seller price plus 20: 100 - Q = 20 + Q + 20. Thus Q = 30, buyer price is 70, seller price is 50. Revenue is 20(30) = 600. Output falls from 40 to 30, so DWL = 0.5(20)(10) = 100.",
  },
  "price-discrimination": {
    formulaTags: "price discrimination, MR, consumer groups",
    rule: "With separable groups and no resale, a discriminating monopolist sets MR = MC in each group.",
    trap: "Charging the same price to all groups even when resale is blocked and elasticities differ.",
    numericPrompt:
      "A firm can separate two markets. Group A has P = 80 - Q, group B has P = 50 - Q, and MC = 20. Find each group's monopoly quantity and price.",
    correctAnswer: "Group A: Q = 30, P = 50. Group B: Q = 15, P = 35.",
    explanation:
      "For A, MR = 80 - 2Q. Set MR = 20, so Q = 30 and P = 50. For B, MR = 50 - 2Q. Set MR = 20, so Q = 15 and P = 35.",
  },
  "game-theory": {
    formulaTags: "best response, dominant strategy, Nash equilibrium",
    rule: "A Nash equilibrium is an action profile where every player is choosing a best response to the other player's action.",
    trap: "Calling an outcome Nash because total payoff is high, without checking individual deviations.",
    numericPrompt:
      "Two firms choose High or Low output. If both choose Low they earn 40 each. If one chooses High while the other chooses Low, High earns 55 and Low earns 20. If both choose High, they earn 25 each. Find the Nash equilibrium.",
    correctAnswer: "Both firms choose High.",
    explanation:
      "If the other firm chooses Low, High gives 55 instead of 40. If the other firm chooses High, High gives 25 instead of 20. High is a dominant strategy for both firms, so the Nash equilibrium is High, High.",
  },
  "social-preferences-public-goods": {
    formulaTags: "public good, free-riding, social optimum, ultimatum",
    rule: "Private incentives in public goods games can differ from the social optimum because each person ignores benefits to others.",
    trap: "Treating a positive total surplus project as privately optimal for every individual contributor.",
    numericPrompt:
      "Three students each get benefit 6 from a public project if anyone pays cost 12 to provide it. What is the private incentive and the social surplus if one student pays?",
    correctAnswer: "Privately, each prefers to free ride; social surplus is 6 + 6 + 6 - 12 = 6.",
    explanation:
      "The contributor pays 12 but receives only private benefit 6, so contributing is privately costly. Society counts all three benefits: 18 - 12 = 6, so provision is socially valuable.",
  },
  oligopoly: {
    formulaTags: "Cournot, Bertrand, collusion, best response",
    rule: "Cournot firms choose quantities and account for rivals' quantities; Bertrand firms choose prices and can face strong price undercutting incentives.",
    trap: "Assuming Cournot and Bertrand always lead to the same price.",
    numericPrompt:
      "Two identical Cournot firms face P = 70 - Q and constant marginal cost c = 10. Find the symmetric Cournot output per firm and price.",
    correctAnswer: "Each firm produces 20, total output is 40, and price is 30.",
    explanation:
      "For linear demand with two symmetric Cournot firms, q_i = (a - c)/3 = (70 - 10)/3 = 20. Total output is 40 and price is 70 - 40 = 30.",
  },
  "innovation-patents": {
    formulaTags: "innovation, patents, complementary innovations, substitute innovations",
    rule: "A patent can raise innovation incentives by protecting returns, but it can also restrict diffusion or follow-on use.",
    trap: "Assuming stronger patent protection always increases welfare.",
    numericPrompt:
      "An innovation costs 50. Without a patent, expected profit is 30. With a patent, expected profit is 90 but consumer surplus falls by 25. Compare private and total surplus changes from patent protection.",
    correctAnswer: "Private incentive rises by 60; total surplus changes by 90 - 50 - 25 = 15 relative to no innovation if the patent induces innovation.",
    explanation:
      "Patent protection raises private expected profit from 30 to 90, so it can make the investment privately worthwhile. If it induces innovation, net surplus is profit 90 minus cost 50 minus consumer-surplus loss 25, which equals 15.",
  },
  "network-effects-standards": {
    formulaTags: "network effects, lock-in, technical standards, benefit = qn - p",
    rule: "With network effects, willingness to adopt rises with expected adoption by others, so expectations can create multiple adoption outcomes.",
    trap: "Evaluating adoption from price alone while ignoring the expected network size.",
    numericPrompt:
      "A student's adoption benefit is qn - p. Let q = 4, expected users n = 5, and price p = 14. Should the student adopt, and what is the net benefit?",
    correctAnswer: "Yes. Net benefit is 4(5) - 14 = 6.",
    explanation:
      "Compute qn - p = 4(5) - 14 = 6. Since the net benefit is positive, adoption is privately attractive at that expected network size.",
  },
  "exam-technique": {
    formulaTags: "open-ended structure, MC traps, partial credit",
    rule: "A strong open-ended answer shows formula, setup, calculation, final answer, and economic interpretation.",
    trap: "Writing only the final number and losing partial-credit evidence.",
    numericPrompt:
      "A student solves MR = MC and gets Q = 12, price 56, and profit 332, but writes only 'profit is 332'. What partial-credit steps are missing?",
    correctAnswer: "Formula, setup, substitution or calculation, and economic interpretation are missing.",
    explanation:
      "The final answer may be right, but the answer does not show how MR and MC were used, how price and cost were calculated, or what the result means economically.",
  },
};

function formulaTagsFor(topicSlug: string) {
  return (
    formulaSeeds
      .filter((formula) => formula.topicSlug === topicSlug)
      .map((formula) => formula.title)
      .join(", ") || playbooks[topicSlug]?.formulaTags || topicSlug
  );
}

function optionsJson(correct: string, trap: string, topicTitle: string): string {
  const options: DraftOption[] = [
    {
      label: "A",
      text: correct,
      isCorrect: true,
      rationale: "This matches the core course rule and keeps the relevant incentive or marginal condition explicit.",
    },
    {
      label: "B",
      text: trap,
      isCorrect: false,
      rationale: "This is a common trap because it skips the condition that determines the economic outcome.",
    },
    {
      label: "C",
      text: `The answer depends only on memorizing the definition of ${topicTitle}.`,
      isCorrect: false,
      rationale: "Definitions help, but exam questions usually require applying the rule to incentives, formulas, or welfare.",
    },
    {
      label: "D",
      text: "The correct answer cannot be checked using formulas or best-response logic.",
      isCorrect: false,
      rationale: "Most questions in this course can be checked by writing the relevant formula, payoff comparison, or marginal condition.",
    },
  ];
  return JSON.stringify(options);
}

function notCorrectOptions(correct: string, trap: string): string {
  const options: DraftOption[] = [
    {
      label: "A",
      text: correct,
      isCorrect: false,
      rationale: "This statement is correct, so it is not the answer to a NOT-correct question.",
    },
    {
      label: "B",
      text: trap,
      isCorrect: true,
      rationale: "This is the statement that is not correct.",
    },
    {
      label: "C",
      text: "A full exam answer should connect the result to economic intuition.",
      isCorrect: false,
      rationale: "This statement is correct for open-ended and calculation questions.",
    },
    {
      label: "D",
      text: "A common way to avoid mistakes is to write the setup before calculating.",
      isCorrect: false,
      rationale: "This statement is correct exam technique.",
    },
  ];
  return JSON.stringify(options);
}

function wrongOptionExplanations(options: string) {
  return (JSON.parse(options) as DraftOption[])
    .map((option) => `${option.label}: ${option.rationale}`)
    .join("\n");
}

function draftForType(params: {
  topicSlug: string;
  topicTitle: string;
  subtopicTitle: string;
  type: string;
  index: number;
  sourceInspiration: string;
  sourceChunkIds: string[];
}) {
  const playbook = playbooks[params.topicSlug] ?? playbooks["exam-technique"];
  const formulaTags = formulaTagsFor(params.topicSlug);
  const base = {
    topicSlug: params.topicSlug,
    questionType: params.type,
    difficulty: Math.min(6, Math.max(1, (params.index % 6) + 1)),
    formulaTags,
    estimatedSteps: params.type === "MCQ" || params.type === "WHICH_NOT_CORRECT" ? "2" : "5",
    sourceInspiration: params.sourceInspiration,
    sourceChunkIds: JSON.stringify(params.sourceChunkIds),
    generationKey: `focused-v1:${params.topicSlug}:${params.type}:${params.index}`,
    generationModel: process.env.OPENAI_MODEL ?? "deterministic-fallback",
    isOriginal: true,
    notes: "Original AI-style practice draft. Review before approval. Do not copy official source text into the prompt.",
  };

  if (params.type === "MCQ") {
    const options = optionsJson(playbook.rule, playbook.trap, params.topicTitle);
    return {
      ...base,
      prompt: `Which statement is correct about ${params.subtopicTitle}?`,
      answer: "A",
      explanation: playbook.rule,
      optionsJson: options,
      wrongOptionExplanations: wrongOptionExplanations(options),
    };
  }

  if (params.type === "WHICH_NOT_CORRECT") {
    const options = notCorrectOptions(playbook.rule, playbook.trap);
    return {
      ...base,
      prompt: `Which statement is NOT correct about ${params.topicTitle}?`,
      answer: "B",
      explanation: `The incorrect statement is the common trap: ${playbook.trap}`,
      optionsJson: options,
      wrongOptionExplanations: wrongOptionExplanations(options),
    };
  }

  if (params.type === "NUMERICAL") {
    return {
      ...base,
      prompt: `${playbook.numericPrompt} Show the formula and one interpretation sentence.`,
      answer: playbook.correctAnswer,
      explanation: playbook.explanation,
    };
  }

  if (params.type === "DERIVATION") {
    return {
      ...base,
      prompt: `Derive the key condition or formula used in ${params.subtopicTitle}, then explain how it guides the economic choice.`,
      answer: playbook.rule,
      explanation: `Start from the relevant objective or payoff, write the marginal or best-response condition, and explain the result. ${playbook.explanation}`,
    };
  }

  if (params.type === "FIND_THE_MISTAKE") {
    return {
      ...base,
      prompt: `Find the mistake: a student claims, "${playbook.trap}" Explain the correction for ${params.topicTitle}.`,
      answer: playbook.rule,
      explanation: `The mistake is that the student skipped the relevant economic condition. Correct reasoning: ${playbook.rule}`,
    };
  }

  if (params.type === "EXPLAIN_INTUITION") {
    return {
      ...base,
      prompt: `Explain the intuition behind this rule in ${params.topicTitle}: ${playbook.rule}`,
      answer: playbook.rule,
      explanation: `The intuition is that the decision maker compares marginal incentives or payoff deviations, not just labels. ${playbook.explanation}`,
    };
  }

  if (params.type === "COMPARE_OUTCOMES") {
    return {
      ...base,
      prompt: `Compare the outcome implied by "${playbook.rule}" with the mistaken reasoning "${playbook.trap}".`,
      answer: playbook.rule,
      explanation: `The correct outcome follows the course condition; the mistaken outcome ignores it. ${playbook.explanation}`,
    };
  }

  return {
    ...base,
    prompt: `Give an exam-quality explanation of ${params.subtopicTitle}.`,
    answer: playbook.rule,
    explanation: playbook.explanation,
  };
}

export async function generateFocusedDraftBatch(limit = 104) {
  const [topics, chunksByTopic] = await Promise.all([
    prisma.topic.findMany({
      include: { subtopics: { orderBy: { orderIndex: "asc" } }, topicSummary: true },
      orderBy: { orderIndex: "asc" },
    }),
    prisma.sourceChunk.findMany({
      select: { id: true, topicId: true },
      orderBy: [{ topicId: "asc" }, { chunkIndex: "asc" }],
      take: 800,
    }),
  ]);

  const chunks = new Map<string, string[]>();
  for (const chunk of chunksByTopic) {
    if (!chunk.topicId) continue;
    const existing = chunks.get(chunk.topicId) ?? [];
    if (existing.length < 4) existing.push(chunk.id);
    chunks.set(chunk.topicId, existing);
  }

  let created = 0;
  let updated = 0;
  let processed = 0;

  for (const topic of topics) {
    for (const [index, type] of draftTypes.entries()) {
      if (processed >= limit) break;
      const subtopic = topic.subtopics[index % Math.max(1, topic.subtopics.length)];
      const sourceInspiration = topic.topicSummary
        ? `Topic summary for ${topic.title}; original practice, not copied source text.`
        : `Course taxonomy for ${topic.title}; original practice, not copied source text.`;
      const draft = draftForType({
        topicSlug: topic.slug,
        topicTitle: topic.title,
        subtopicTitle: subtopic?.title ?? topic.title,
        type,
        index,
        sourceInspiration,
        sourceChunkIds: chunks.get(topic.id) ?? [],
      });

      const result = await prisma.questionDraft.upsert({
        where: { generationKey: draft.generationKey },
        update: {
          subtopicId: subtopic?.id,
          questionType: draft.questionType,
          difficulty: draft.difficulty,
          prompt: draft.prompt,
          answer: draft.answer,
          explanation: draft.explanation,
          optionsJson: "optionsJson" in draft ? draft.optionsJson : undefined,
          wrongOptionExplanations:
            "wrongOptionExplanations" in draft ? draft.wrongOptionExplanations : undefined,
          formulaTags: draft.formulaTags,
          estimatedSteps: draft.estimatedSteps,
          sourceInspiration: draft.sourceInspiration,
          sourceChunkIds: draft.sourceChunkIds,
          generationModel: draft.generationModel,
          isOriginal: draft.isOriginal,
          notes: draft.notes,
        },
        create: {
          topicId: topic.id,
          subtopicId: subtopic?.id,
          questionType: draft.questionType,
          difficulty: draft.difficulty,
          prompt: draft.prompt,
          answer: draft.answer,
          explanation: draft.explanation,
          optionsJson: "optionsJson" in draft ? draft.optionsJson : undefined,
          wrongOptionExplanations:
            "wrongOptionExplanations" in draft ? draft.wrongOptionExplanations : undefined,
          formulaTags: draft.formulaTags,
          estimatedSteps: draft.estimatedSteps,
          sourceInspiration: draft.sourceInspiration,
          sourceChunkIds: draft.sourceChunkIds,
          generationKey: draft.generationKey,
          generationModel: draft.generationModel,
          isOriginal: draft.isOriginal,
          notes: draft.notes,
        },
      });

      if (result.createdAt.getTime() === result.updatedAt.getTime()) created += 1;
      else updated += 1;
      processed += 1;
    }
  }

  return { processed, created, updated };
}

export function parseDraftOptions(optionsJson?: string | null): DraftOption[] {
  if (!optionsJson) return [];
  const parsed = JSON.parse(optionsJson) as DraftOption[];
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((option) => option.label && option.text);
}

export async function approveQuestionDraft(draftId: string) {
  const draft = await prisma.questionDraft.findUnique({
    where: { id: draftId },
    include: { question: true },
  });
  if (!draft) throw new Error("Draft not found");
  if (draft.questionId) return draft.questionId;

  const options = parseDraftOptions(draft.optionsJson);
  const question = await prisma.question.create({
    data: {
      topicId: draft.topicId,
      subtopicId: draft.subtopicId ?? undefined,
      sourceType: "AI_GENERATED",
      questionType: draft.questionType,
      difficulty: draft.difficulty,
      prompt: draft.prompt,
      correctAnswer: draft.answer,
      explanation: draft.explanation,
      wrongOptionExplanations: draft.wrongOptionExplanations ?? undefined,
      formulaTags: draft.formulaTags ?? undefined,
      estimatedSteps: draft.estimatedSteps ?? undefined,
      sourceInspiration: draft.sourceInspiration ?? "Original AI-generated practice draft.",
      isReviewed: true,
      reviewStatus: "APPROVED",
    },
  });

  for (const [index, option] of options.entries()) {
    await prisma.questionOption.create({
      data: {
        questionId: question.id,
        label: option.label,
        text: option.text,
        isCorrect: option.isCorrect,
        rationale: option.rationale,
        orderIndex: index,
      },
    });
  }

  if (openEndedTypes.has(draft.questionType)) {
    await prisma.rubric.create({
      data: {
        questionId: question.id,
        name: "Open-ended exam reasoning rubric",
        maxScore: defaultRubricDimensions.length,
        dimensions: JSON.stringify(defaultRubricDimensions),
      },
    });
  }

  await prisma.questionDraft.update({
    where: { id: draft.id },
    data: {
      questionId: question.id,
      status: "APPROVED",
    },
  });

  return question.id;
}
