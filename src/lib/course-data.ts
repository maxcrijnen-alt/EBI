export type TopicSeed = {
  slug: string;
  title: string;
  description: string;
  orderIndex: number;
  weight: number;
  coreSectionUrl?: string;
  subtopics: Array<{
    slug: string;
    title: string;
    description: string;
    orderIndex: number;
  }>;
};

export type FormulaSeed = {
  topicSlug: string;
  title: string;
  formula: string;
  meaning: string;
  whenToUse: string;
  variables: string;
  example: string;
  trap: string;
  relatedTypes: string;
};

export type FlashcardSeed = {
  topicSlug: string;
  subtopicSlug?: string;
  category: string;
  front: string;
  back: string;
  example?: string;
  trap?: string;
  formulaTags?: string;
};

export type QuestionSeed = {
  topicSlug: string;
  subtopicSlug?: string;
  questionType: string;
  difficulty: number;
  prompt: string;
  options?: Array<{
    label: string;
    text: string;
    isCorrect: boolean;
    rationale: string;
  }>;
  correctAnswer: string;
  explanation: string;
  wrongOptionExplanations?: string;
  formulaTags?: string;
  estimatedSteps?: string;
  sourceInspiration: string;
  isReviewed?: boolean;
  reviewStatus?: string;
};

export const topicSeeds: TopicSeed[] = [
  {
    slug: "production-costs",
    title: "Production and Costs",
    description:
      "Cost functions, fixed and variable costs, average costs, marginal cost, and returns to scale.",
    orderIndex: 1,
    weight: 10,
    coreSectionUrl: "https://core-econ.org/the-economy/microeconomics/0-3-contents.html",
    subtopics: [
      {
        slug: "cost-types",
        title: "Fixed, Variable, Average, and Marginal Cost",
        description: "Identify and calculate TC, FC, VC, AC, AVC, AFC, and MC.",
        orderIndex: 1,
      },
      {
        slug: "returns-scale",
        title: "Returns to Scale",
        description: "Distinguish increasing, constant, and decreasing returns to scale.",
        orderIndex: 2,
      },
      {
        slug: "cost-curves",
        title: "Cost Curves",
        description: "Interpret AC, AVC, AFC, and MC curves and their intersections.",
        orderIndex: 3,
      },
    ],
  },
  {
    slug: "demand-revenue-elasticity",
    title: "Demand, Revenue, and Elasticity",
    description:
      "Demand and inverse demand, total revenue, marginal revenue, elasticity, and revenue effects.",
    orderIndex: 2,
    weight: 10,
    subtopics: [
      {
        slug: "inverse-demand",
        title: "Demand and Inverse Demand",
        description: "Move between Q(P) and P(Q) forms and read intercepts.",
        orderIndex: 1,
      },
      {
        slug: "elasticity",
        title: "Elasticity and Total Revenue",
        description: "Use elasticity to predict whether revenue rises or falls after a price change.",
        orderIndex: 2,
      },
      {
        slug: "marginal-revenue",
        title: "Total and Marginal Revenue",
        description: "Derive MR from inverse demand and total revenue.",
        orderIndex: 3,
      },
    ],
  },
  {
    slug: "profit-maximization",
    title: "Profit Maximization",
    description:
      "Profit, isoprofit curves, marginal revenue, marginal cost, and shutdown logic.",
    orderIndex: 3,
    weight: 9,
    subtopics: [
      {
        slug: "mr-mc",
        title: "MR = MC Logic",
        description: "Use marginal reasoning to select the profit-maximizing quantity.",
        orderIndex: 1,
      },
      {
        slug: "isoprofit",
        title: "Isoprofit Curves",
        description: "Interpret profit contours and their slopes.",
        orderIndex: 2,
      },
      {
        slug: "shutdown",
        title: "Shutdown and Profit Tests",
        description: "Separate profit, loss minimization, and shutdown decisions.",
        orderIndex: 3,
      },
    ],
  },
  {
    slug: "perfect-competition",
    title: "Perfect Competition",
    description:
      "Price-taking firms, market supply, short-run and long-run competitive equilibrium.",
    orderIndex: 4,
    weight: 9,
    subtopics: [
      {
        slug: "price-taking",
        title: "Price Taking",
        description: "Understand why individual firms face horizontal demand.",
        orderIndex: 1,
      },
      {
        slug: "long-run-equilibrium",
        title: "Long-run Equilibrium",
        description: "Apply P = MC = AC and zero economic profit.",
        orderIndex: 2,
      },
      {
        slug: "entry-exit",
        title: "Entry and Exit",
        description: "Predict how profits or losses move the market in the long run.",
        orderIndex: 3,
      },
    ],
  },
  {
    slug: "monopoly-welfare",
    title: "Monopoly and Welfare",
    description:
      "Monopoly pricing, welfare loss, surplus transfers, and Pareto efficiency comparisons.",
    orderIndex: 5,
    weight: 11,
    subtopics: [
      {
        slug: "monopoly-choice",
        title: "Monopoly MR = MC",
        description: "Choose monopoly output and price from demand and cost.",
        orderIndex: 1,
      },
      {
        slug: "welfare-loss",
        title: "Welfare Loss",
        description: "Calculate consumer surplus, producer surplus, and deadweight loss.",
        orderIndex: 2,
      },
      {
        slug: "pareto-efficient-output",
        title: "Pareto Efficient Output",
        description: "Compare monopoly output with the efficient allocation.",
        orderIndex: 3,
      },
    ],
  },
  {
    slug: "taxes-surplus",
    title: "Taxes, Surplus, and Incidence",
    description:
      "Tax wedges, tax revenue, incidence, and deadweight loss in demand and supply diagrams.",
    orderIndex: 6,
    weight: 9,
    subtopics: [
      {
        slug: "tax-wedge",
        title: "Tax Wedge",
        description: "Separate buyer price, seller price, and tax per unit.",
        orderIndex: 1,
      },
      {
        slug: "incidence",
        title: "Tax Incidence",
        description: "Use elasticities to determine who bears more of the tax.",
        orderIndex: 2,
      },
      {
        slug: "tax-revenue-dwl",
        title: "Tax Revenue and Deadweight Loss",
        description: "Calculate rectangles and triangles after a tax.",
        orderIndex: 3,
      },
    ],
  },
  {
    slug: "price-discrimination",
    title: "Price Discrimination",
    description:
      "Uniform pricing, group pricing, first-degree discrimination, and welfare comparisons.",
    orderIndex: 7,
    weight: 6,
    subtopics: [
      {
        slug: "uniform-vs-discriminating",
        title: "Uniform vs Discriminating Pricing",
        description: "Compare quantities, prices, profits, and surplus.",
        orderIndex: 1,
      },
      {
        slug: "consumer-groups",
        title: "Consumer Groups",
        description: "Understand when group-specific pricing is possible.",
        orderIndex: 2,
      },
    ],
  },
  {
    slug: "game-theory",
    title: "Game Theory",
    description:
      "Strategic form games, best responses, dominant strategies, Nash equilibrium, and prisoners' dilemma.",
    orderIndex: 8,
    weight: 12,
    subtopics: [
      {
        slug: "best-responses",
        title: "Best Responses",
        description: "Mark each player's best response to the other player's action.",
        orderIndex: 1,
      },
      {
        slug: "dominant-strategies",
        title: "Dominant Strategies",
        description: "Identify strategies that are best regardless of the opponent's action.",
        orderIndex: 2,
      },
      {
        slug: "nash-equilibrium",
        title: "Nash Equilibrium",
        description: "Find action profiles where no player wants to deviate unilaterally.",
        orderIndex: 3,
      },
      {
        slug: "prisoners-dilemma",
        title: "Prisoners' Dilemma",
        description: "Recognize individual incentives that conflict with joint surplus.",
        orderIndex: 4,
      },
    ],
  },
  {
    slug: "social-preferences-public-goods",
    title: "Social Preferences and Public Goods",
    description:
      "Public goods games, social optimum, fairness, ultimatum games, and free-riding.",
    orderIndex: 9,
    weight: 8,
    subtopics: [
      {
        slug: "public-goods",
        title: "Public Goods Games",
        description: "Compare private incentives and social optimum contributions.",
        orderIndex: 1,
      },
      {
        slug: "fairness",
        title: "Fairness and Social Preferences",
        description: "Use fairness concerns to explain deviations from self-interest.",
        orderIndex: 2,
      },
      {
        slug: "ultimatum",
        title: "Ultimatum Games",
        description: "Predict offers and acceptance thresholds.",
        orderIndex: 3,
      },
    ],
  },
  {
    slug: "oligopoly",
    title: "Oligopoly",
    description:
      "Cournot, Bertrand, collusion, capacity constraints, and the Bertrand trap.",
    orderIndex: 10,
    weight: 12,
    subtopics: [
      {
        slug: "cournot",
        title: "Cournot Competition",
        description: "Use quantity best-response functions and symmetric equilibrium.",
        orderIndex: 1,
      },
      {
        slug: "bertrand",
        title: "Bertrand Competition",
        description: "Use price competition logic and the Bertrand trap.",
        orderIndex: 2,
      },
      {
        slug: "collusion",
        title: "Collusion",
        description: "Compare collusive and non-cooperative outcomes.",
        orderIndex: 3,
      },
      {
        slug: "capacity-constraints",
        title: "Capacity Constraints",
        description: "Understand when Bertrand logic changes because firms cannot serve all demand.",
        orderIndex: 4,
      },
    ],
  },
  {
    slug: "innovation-patents",
    title: "Innovation and Patents",
    description:
      "Patent incentives, complementary and substitute innovations, and welfare tradeoffs.",
    orderIndex: 11,
    weight: 7,
    subtopics: [
      {
        slug: "patent-incentives",
        title: "Patent Incentives",
        description: "Balance innovation incentives against monopoly distortions.",
        orderIndex: 1,
      },
      {
        slug: "complements-substitutes",
        title: "Complementary and Substitute Innovations",
        description: "Predict how one innovation changes incentives for another.",
        orderIndex: 2,
      },
    ],
  },
  {
    slug: "network-effects-standards",
    title: "Network Effects and Standards",
    description:
      "Network effects, economies of scale, lock-in, technical standards, and adoption thresholds.",
    orderIndex: 12,
    weight: 8,
    subtopics: [
      {
        slug: "network-effects",
        title: "Network Effects",
        description: "Use payoff logic where value rises with the number of users.",
        orderIndex: 1,
      },
      {
        slug: "lock-in",
        title: "Lock-in",
        description: "Explain why users may stay with inferior technologies.",
        orderIndex: 2,
      },
      {
        slug: "standards",
        title: "Technical Standards",
        description: "Compare coordination benefits and competition costs of standards.",
        orderIndex: 3,
      },
    ],
  },
  {
    slug: "exam-technique",
    title: "Exam Technique",
    description:
      "Step-by-step reasoning, partial-credit writing, multiple-choice traps, and clean calculations.",
    orderIndex: 13,
    weight: 10,
    subtopics: [
      {
        slug: "open-ended-structure",
        title: "Open-ended Answer Structure",
        description: "Show formula, setup, substitution, calculation, and interpretation.",
        orderIndex: 1,
      },
      {
        slug: "mc-traps",
        title: "Multiple-choice Traps",
        description: "Handle NOT correct, statement I/II, and distractor wording.",
        orderIndex: 2,
      },
    ],
  },
];

export const formulaSeeds: FormulaSeed[] = [
  {
    topicSlug: "production-costs",
    title: "Total Cost",
    formula: "TC(Q) = FC + VC(Q)",
    meaning: "Total cost is the sum of fixed and variable costs.",
    whenToUse: "Use when a cost table or function separates fixed and variable parts.",
    variables: "TC total cost; FC fixed cost; VC variable cost; Q quantity.",
    example: "If FC = 20 and VC = 3Q^2, then TC(4) = 20 + 3(16) = 68.",
    trap: "Fixed cost does not change with output, including at Q = 0.",
    relatedTypes: "Numerical calculation, formula selection, cost curve interpretation",
  },
  {
    topicSlug: "production-costs",
    title: "Average Costs",
    formula: "AC = TC/Q; AVC = VC/Q; AFC = FC/Q",
    meaning: "Average costs divide cost by output.",
    whenToUse: "Use when comparing per-unit cost or long-run competitive equilibrium.",
    variables: "AC average cost; AVC average variable cost; AFC average fixed cost.",
    example: "If TC = 68, VC = 48, FC = 20, Q = 4, then AC = 17, AVC = 12, AFC = 5.",
    trap: "Do not divide fixed cost by zero when Q = 0.",
    relatedTypes: "Cost table, graph interpretation, long-run competition",
  },
  {
    topicSlug: "production-costs",
    title: "Marginal Cost",
    formula: "MC = Delta TC / Delta Q, or MC = dTC/dQ",
    meaning: "Marginal cost is the additional cost of one more unit.",
    whenToUse: "Use for profit maximization, supply, and efficient output.",
    variables: "Delta means change; dTC/dQ is the derivative of total cost.",
    example: "If TC = 20 + 3Q^2, MC = 6Q.",
    trap: "MC is not TC/Q. That is average cost.",
    relatedTypes: "Derivation, profit maximization, graph interpretation",
  },
  {
    topicSlug: "demand-revenue-elasticity",
    title: "Total Revenue",
    formula: "TR(Q) = P(Q)Q",
    meaning: "Revenue equals price times quantity sold.",
    whenToUse: "Use before deriving marginal revenue or calculating monopoly profit.",
    variables: "TR total revenue; P(Q) inverse demand; Q quantity.",
    example: "If P = 20 - Q, then TR = (20 - Q)Q = 20Q - Q^2.",
    trap: "Use inverse demand P(Q), not demand Q(P), when multiplying by Q.",
    relatedTypes: "Monopoly, elasticity, marginal revenue",
  },
  {
    topicSlug: "demand-revenue-elasticity",
    title: "Marginal Revenue",
    formula: "MR = dTR/dQ",
    meaning: "Marginal revenue is the extra revenue from selling one more unit.",
    whenToUse: "Use for monopoly and oligopoly output choices.",
    variables: "TR total revenue; Q quantity.",
    example: "If TR = 20Q - Q^2, then MR = 20 - 2Q.",
    trap: "With downward-sloping demand, MR lies below demand.",
    relatedTypes: "Derivation, monopoly, Cournot",
  },
  {
    topicSlug: "demand-revenue-elasticity",
    title: "Price Elasticity of Demand",
    formula: "epsilon = (dQ/dP)(P/Q)",
    meaning: "Elasticity measures percentage quantity response to a percentage price change.",
    whenToUse: "Use to predict revenue effects and tax incidence.",
    variables: "epsilon demand elasticity; P price; Q quantity.",
    example: "If Q = 100 - 2P, at P = 20 Q = 60 and epsilon = -2(20/60) = -2/3.",
    trap: "Demand elasticity is usually negative; often use absolute value for comparisons.",
    relatedTypes: "Revenue effect, incidence, statement questions",
  },
  {
    topicSlug: "profit-maximization",
    title: "Profit",
    formula: "pi(Q) = TR(Q) - TC(Q)",
    meaning: "Profit is revenue minus total cost.",
    whenToUse: "Use to evaluate whether the chosen quantity is profitable.",
    variables: "pi profit; TR total revenue; TC total cost.",
    example: "If TR = 100 and TC = 70, profit is 30.",
    trap: "A firm can maximize profit even if the maximum profit is negative in the short run.",
    relatedTypes: "Numerical calculation, shutdown, open-ended explanation",
  },
  {
    topicSlug: "profit-maximization",
    title: "Per-unit Profit",
    formula: "pi = (P - AC)Q",
    meaning: "Profit equals margin per unit times quantity.",
    whenToUse: "Use when price, average cost, and output are known.",
    variables: "P price; AC average cost; Q quantity.",
    example: "If P = 12, AC = 9, Q = 40, profit = 120.",
    trap: "Use AC, not AVC, for total economic profit.",
    relatedTypes: "Perfect competition, profit test",
  },
  {
    topicSlug: "perfect-competition",
    title: "Long-run Competitive Equilibrium",
    formula: "P = MC = AC",
    meaning: "In long-run perfect competition, firms earn zero economic profit at minimum AC.",
    whenToUse: "Use when free entry and exit have fully adjusted.",
    variables: "P price; MC marginal cost; AC average cost.",
    example: "If minimum AC is 8, the long-run price is 8.",
    trap: "Short-run competitive equilibrium can have profit or loss.",
    relatedTypes: "Statement questions, graph interpretation, equilibrium calculation",
  },
  {
    topicSlug: "monopoly-welfare",
    title: "Monopoly Choice",
    formula: "MR(Q) = MC(Q), then use demand for price",
    meaning: "A monopolist chooses quantity by marginal reasoning and charges the demand price.",
    whenToUse: "Use for single-seller output and price questions.",
    variables: "MR marginal revenue; MC marginal cost; P demand price.",
    example: "If P = 20 - Q and MC = 4, MR = 20 - 2Q = 4 gives Q = 8 and P = 12.",
    trap: "Do not set P = MC for monopoly unless finding efficient output.",
    relatedTypes: "Calculation, welfare, graph interpretation",
  },
  {
    topicSlug: "monopoly-welfare",
    title: "Deadweight Loss Triangle",
    formula: "DWL = 0.5 x base x height",
    meaning: "DWL is lost total surplus from trades that no longer occur.",
    whenToUse: "Use for monopoly or tax welfare losses.",
    variables: "Base is lost quantity; height is value-cost wedge.",
    example: "If lost output is 4 and wedge at the monopoly quantity is 8, DWL = 16.",
    trap: "Do not count surplus transferred from consumers to producers as DWL.",
    relatedTypes: "Area calculation, welfare comparison",
  },
  {
    topicSlug: "taxes-surplus",
    title: "Tax Revenue",
    formula: "Tax revenue = t x Q_after_tax",
    meaning: "Government revenue is tax per unit times quantity sold after the tax.",
    whenToUse: "Use after finding the new tax equilibrium quantity.",
    variables: "t per-unit tax; Q_after_tax quantity traded after tax.",
    example: "A tax of 3 with quantity 20 gives revenue 60.",
    trap: "Use post-tax quantity, not the original quantity.",
    relatedTypes: "Tax wedge, area calculation",
  },
  {
    topicSlug: "taxes-surplus",
    title: "Tax Incidence",
    formula: "Less elastic side bears more of the tax burden",
    meaning: "Burden falls more heavily on the side less able to adjust quantity.",
    whenToUse: "Use for conceptual incidence and graph interpretation questions.",
    variables: "Elasticity compares responsiveness of buyers and sellers.",
    example: "If demand is steep and supply is flat, buyers bear most of the tax.",
    trap: "Legal responsibility for paying the tax does not determine economic incidence.",
    relatedTypes: "Statement questions, graph interpretation",
  },
  {
    topicSlug: "oligopoly",
    title: "Cournot Best Response",
    formula: "Choose q_i to maximize (P(Q) - c)q_i, taking rivals' quantities as fixed",
    meaning: "Each firm chooses quantity while treating competitors' output as given.",
    whenToUse: "Use for quantity competition and best-response curves.",
    variables: "q_i firm i output; Q total output; c marginal cost.",
    example: "If P = a - b(q_i + q_j), solve firm i's first-order condition for q_i.",
    trap: "Cournot firms compete in quantities, not prices.",
    relatedTypes: "Best response, Nash equilibrium, derivation",
  },
  {
    topicSlug: "oligopoly",
    title: "Bertrand Equilibrium Logic",
    formula: "With identical products and constant MC, P = MC",
    meaning: "Price competition can push price down to marginal cost.",
    whenToUse: "Use for homogeneous-product Bertrand questions without capacity constraints.",
    variables: "P price; MC marginal cost.",
    example: "If both firms have MC = 5, Bertrand equilibrium price is 5.",
    trap: "The Bertrand trap may fail with differentiated products or capacity limits.",
    relatedTypes: "Statement questions, compare outcomes",
  },
  {
    topicSlug: "social-preferences-public-goods",
    title: "Public Goods Payoff",
    formula: "Payoff = private benefit + share of public benefit - contribution cost",
    meaning: "Public goods create benefits that spill over to others.",
    whenToUse: "Use to compare private contribution incentives with social optimum.",
    variables: "Contribution cost is private; public benefit is shared.",
    example: "A student contributes if private payoff gain is positive, even if social gain is larger.",
    trap: "The social optimum includes benefits to all players, not only the contributor.",
    relatedTypes: "Public goods game, social optimum",
  },
  {
    topicSlug: "network-effects-standards",
    title: "Network Effects Payoff",
    formula: "benefit = qn - p",
    meaning: "A user's net benefit rises with quality q and number of adopters n, and falls with price p.",
    whenToUse: "Use to find adoption thresholds and tipping points.",
    variables: "q quality or network value; n network size; p price.",
    example: "If q = 2 and p = 10, adoption requires n >= 5.",
    trap: "A high-quality product can fail if the initial network is too small.",
    relatedTypes: "Threshold calculation, lock-in, standards",
  },
];

export const flashcardSeeds: FlashcardSeed[] = [
  {
    topicSlug: "production-costs",
    subtopicSlug: "cost-types",
    category: "Definitions",
    front: "What is the difference between MC, AC, AVC, and AFC?",
    back: "MC is the extra cost of one more unit. AC is total cost per unit. AVC is variable cost per unit. AFC is fixed cost per unit.",
    example: "If FC = 20, VC = 80, and Q = 10, AC = 10, AVC = 8, AFC = 2.",
    trap: "Do not call MC an average.",
    formulaTags: "MC,AC,AVC,AFC",
  },
  {
    topicSlug: "production-costs",
    subtopicSlug: "cost-curves",
    category: "Graph interpretations",
    front: "When is ATC minimized?",
    back: "ATC is minimized where MC crosses ATC from below.",
    trap: "MC can be below ATC while ATC is still falling.",
    formulaTags: "MC,AC",
  },
  {
    topicSlug: "production-costs",
    subtopicSlug: "returns-scale",
    category: "Concept comparisons",
    front: "How do increasing returns to scale differ from decreasing average cost?",
    back: "Increasing returns is a production relationship when scaling all inputs. Decreasing average cost is a cost outcome over output.",
    trap: "They are related but not identical concepts.",
  },
  {
    topicSlug: "demand-revenue-elasticity",
    subtopicSlug: "elasticity",
    category: "Key intuitions",
    front: "What happens to total revenue when price rises on an elastic part of demand?",
    back: "Total revenue falls because quantity falls proportionally more than price rises.",
    trap: "Elastic demand means consumers respond strongly.",
    formulaTags: "elasticity,TR",
  },
  {
    topicSlug: "demand-revenue-elasticity",
    subtopicSlug: "marginal-revenue",
    category: "Formulas",
    front: "How do you get MR from inverse demand P = a - bQ?",
    back: "First write TR = (a - bQ)Q = aQ - bQ^2, then MR = a - 2bQ.",
    example: "P = 20 - Q gives MR = 20 - 2Q.",
    trap: "MR is not the same line as demand.",
    formulaTags: "TR,MR",
  },
  {
    topicSlug: "profit-maximization",
    subtopicSlug: "mr-mc",
    category: "Step-by-step procedures",
    front: "What are the steps for a profit-maximization calculation?",
    back: "Find TR, derive MR, derive MC, solve MR = MC, use demand for price, then calculate profit and interpretation.",
    trap: "For monopoly, do not set demand equal to MC to choose profit-max output.",
    formulaTags: "MR,MC,profit",
  },
  {
    topicSlug: "perfect-competition",
    subtopicSlug: "long-run-equilibrium",
    category: "Formulas",
    front: "What condition holds in long-run perfect competition?",
    back: "P = MC = AC at the minimum of AC, with zero economic profit.",
    trap: "P = MC alone is not enough for the long run; AC matters too.",
    formulaTags: "P=MC=AC",
  },
  {
    topicSlug: "monopoly-welfare",
    subtopicSlug: "monopoly-choice",
    category: "Common exam traps",
    front: "After solving MR = MC for monopoly output, how do you find price?",
    back: "Plug the output into the demand curve, not the marginal revenue curve.",
    trap: "Using MR as price gives an artificially low price.",
    formulaTags: "MR,MC,demand",
  },
  {
    topicSlug: "monopoly-welfare",
    subtopicSlug: "welfare-loss",
    category: "Graph interpretations",
    front: "What is monopoly deadweight loss?",
    back: "The surplus from units where willingness to pay exceeds marginal cost but monopoly does not sell them.",
    trap: "Profit transferred from consumers is not deadweight loss.",
  },
  {
    topicSlug: "taxes-surplus",
    subtopicSlug: "incidence",
    category: "Key intuitions",
    front: "Who bears more of a tax?",
    back: "The less elastic side of the market bears more of the burden.",
    trap: "Statutory incidence is not economic incidence.",
  },
  {
    topicSlug: "taxes-surplus",
    subtopicSlug: "tax-revenue-dwl",
    category: "Formulas",
    front: "How do you calculate tax revenue?",
    back: "Tax revenue equals the per-unit tax times the post-tax quantity traded.",
    example: "t = 4 and Q_after_tax = 30 gives revenue 120.",
    trap: "Use the quantity after the tax, not before.",
    formulaTags: "tax revenue",
  },
  {
    topicSlug: "price-discrimination",
    subtopicSlug: "uniform-vs-discriminating",
    category: "Concept comparisons",
    front: "How can first-degree price discrimination affect DWL?",
    back: "If the seller can charge each buyer willingness to pay, efficient quantity can be sold and DWL can disappear, though consumer surplus is extracted.",
    trap: "Efficiency can rise even when consumers are worse off.",
  },
  {
    topicSlug: "game-theory",
    subtopicSlug: "best-responses",
    category: "Step-by-step procedures",
    front: "How do you find best responses in a payoff matrix?",
    back: "For each possible action of the other player, compare the player's payoffs and mark the highest payoff.",
    trap: "Compare within the same column for the row player and within the same row for the column player.",
  },
  {
    topicSlug: "game-theory",
    subtopicSlug: "dominant-strategies",
    category: "Definitions",
    front: "What is a dominant strategy?",
    back: "A strategy that gives a player a higher payoff than other strategies regardless of what the other player does.",
    trap: "A strategy used in one Nash equilibrium is not automatically dominant.",
  },
  {
    topicSlug: "game-theory",
    subtopicSlug: "nash-equilibrium",
    category: "Definitions",
    front: "What is a Nash equilibrium?",
    back: "An action profile where each player's action is a best response to the other's action.",
    trap: "Nash equilibrium does not mean the joint payoff is highest.",
  },
  {
    topicSlug: "game-theory",
    subtopicSlug: "prisoners-dilemma",
    category: "Common exam traps",
    front: "What makes a game a prisoners' dilemma?",
    back: "Each player has an incentive to choose the individually dominant action, but both would be better off if both cooperated.",
    trap: "The socially best outcome is not the Nash equilibrium.",
  },
  {
    topicSlug: "social-preferences-public-goods",
    subtopicSlug: "public-goods",
    category: "Key intuitions",
    front: "Why do public goods games create free-riding?",
    back: "Individuals receive some benefit from others' contributions, so private incentives to contribute are weaker than social benefits.",
    trap: "Low contribution can be rational even when total surplus would rise.",
  },
  {
    topicSlug: "social-preferences-public-goods",
    subtopicSlug: "ultimatum",
    category: "Definitions",
    front: "What is the minimum acceptable offer in an ultimatum game?",
    back: "It is the smallest offer the responder is willing to accept instead of rejecting both payoffs.",
    trap: "With fairness concerns, this may be above zero.",
  },
  {
    topicSlug: "oligopoly",
    subtopicSlug: "cournot",
    category: "Concept comparisons",
    front: "Cournot vs Bertrand: what is the strategic variable?",
    back: "Cournot firms choose quantities. Bertrand firms choose prices.",
    trap: "Using price-undercutting logic in a Cournot question is a category error.",
  },
  {
    topicSlug: "oligopoly",
    subtopicSlug: "bertrand",
    category: "Common exam traps",
    front: "What is the Bertrand trap?",
    back: "With identical products, constant marginal cost, and no capacity constraints, price competition drives price to marginal cost.",
    trap: "The result may not hold with capacity constraints or differentiated products.",
  },
  {
    topicSlug: "oligopoly",
    subtopicSlug: "collusion",
    category: "Key intuitions",
    front: "Why is collusion unstable in a one-shot Bertrand-style setting?",
    back: "Each firm can gain by slightly undercutting the collusive price if it can serve the market.",
    trap: "Jointly optimal behavior is not automatically individually stable.",
  },
  {
    topicSlug: "innovation-patents",
    subtopicSlug: "patent-incentives",
    category: "Concept comparisons",
    front: "What is the main patent tradeoff?",
    back: "Patents increase innovation incentives by granting market power, but that market power can create higher prices and welfare loss.",
    trap: "Stronger patent protection is not always welfare-improving.",
  },
  {
    topicSlug: "innovation-patents",
    subtopicSlug: "complements-substitutes",
    category: "Definitions",
    front: "How do complementary and substitute innovations differ?",
    back: "Complementary innovations raise each other's value. Substitute innovations make each other less valuable or redundant.",
    trap: "Two technologies in the same sector are not automatically substitutes.",
  },
  {
    topicSlug: "network-effects-standards",
    subtopicSlug: "network-effects",
    category: "Formulas",
    front: "How do you use benefit = qn - p for adoption?",
    back: "Adoption is attractive when qn - p >= 0, so the required network size is n >= p/q.",
    example: "If q = 2 and p = 10, n must be at least 5.",
    trap: "Do not ignore the existing number of adopters.",
    formulaTags: "network effects",
  },
  {
    topicSlug: "network-effects-standards",
    subtopicSlug: "lock-in",
    category: "Key intuitions",
    front: "What is lock-in?",
    back: "Users remain with a technology because switching costs, installed base, or compatibility benefits make switching unattractive.",
    trap: "Lock-in can persist even if a rival technology is technically better.",
  },
  {
    topicSlug: "exam-technique",
    subtopicSlug: "open-ended-structure",
    category: "Step-by-step procedures",
    front: "What structure should an open-ended calculation answer follow?",
    back: "State the formula, set up the problem, substitute values, calculate, give final answer, and add economic interpretation.",
    trap: "A correct number without steps may lose partial credit.",
  },
  {
    topicSlug: "exam-technique",
    subtopicSlug: "mc-traps",
    category: "Common exam traps",
    front: "How should you handle a 'Which statement is NOT correct?' question?",
    back: "Mark each statement true or false first, then choose the false one. Do not answer the statement that is correct.",
    trap: "Students often miss the word NOT.",
  },
];

export const questionSeeds: QuestionSeed[] = [
  {
    topicSlug: "production-costs",
    subtopicSlug: "cost-types",
    questionType: "NUMERICAL",
    difficulty: 2,
    prompt:
      "AI-generated practice. A firm has FC = 24 and VC(Q) = 2Q^2. At Q = 6, what are TC, AC, AVC, AFC, and MC?",
    correctAnswer: "TC = 96, AC = 16, AVC = 12, AFC = 4, MC = 24",
    explanation:
      "TC = FC + VC = 24 + 2(6^2) = 96. AC = 96/6 = 16. AVC = 72/6 = 12. AFC = 24/6 = 4. MC = dTC/dQ = 4Q, so MC(6) = 24.",
    formulaTags: "TC,AC,AVC,AFC,MC",
    estimatedSteps: "Compute VC, TC, divide by Q, derive MC, substitute Q.",
    sourceInspiration: "Cost function practice",
    isReviewed: true,
    reviewStatus: "APPROVED",
  },
  {
    topicSlug: "production-costs",
    subtopicSlug: "cost-curves",
    questionType: "MCQ",
    difficulty: 1,
    prompt: "AI-generated practice. Which statement about the minimum of average cost is correct?",
    options: [
      {
        label: "A",
        text: "Average cost is minimized where marginal cost crosses average cost from below.",
        isCorrect: true,
        rationale: "When MC is below AC, AC falls; when MC is above AC, AC rises.",
      },
      {
        label: "B",
        text: "Average cost is minimized where fixed cost equals variable cost.",
        isCorrect: false,
        rationale: "The equality of FC and VC has no general link to minimum AC.",
      },
      {
        label: "C",
        text: "Average cost is minimized wherever average fixed cost is minimized.",
        isCorrect: false,
        rationale: "AFC keeps falling as output rises; it does not identify the AC minimum.",
      },
      {
        label: "D",
        text: "Average cost is minimized where total cost is zero.",
        isCorrect: false,
        rationale: "Total cost is usually positive and does not define the AC minimum.",
      },
    ],
    correctAnswer: "A",
    explanation:
      "Average cost falls when MC is below AC and rises when MC is above AC. Therefore the minimum occurs where MC crosses AC from below.",
    wrongOptionExplanations: "B confuses cost components; C confuses AFC with AC; D is not economically meaningful.",
    formulaTags: "MC,AC",
    estimatedSteps: "Recall relationship between marginal and average values.",
    sourceInspiration: "Cost curve interpretation",
    isReviewed: true,
    reviewStatus: "APPROVED",
  },
  {
    topicSlug: "demand-revenue-elasticity",
    subtopicSlug: "marginal-revenue",
    questionType: "DERIVATION",
    difficulty: 3,
    prompt:
      "AI-generated practice. A monopolist faces inverse demand P = 48 - 2Q. Derive total revenue and marginal revenue.",
    correctAnswer: "TR = 48Q - 2Q^2; MR = 48 - 4Q",
    explanation:
      "Total revenue is price times quantity: TR(Q) = (48 - 2Q)Q = 48Q - 2Q^2. Marginal revenue is the derivative: MR(Q) = 48 - 4Q.",
    formulaTags: "TR,MR,inverse demand",
    estimatedSteps: "Multiply inverse demand by Q, expand, differentiate.",
    sourceInspiration: "Monopoly revenue derivation",
    isReviewed: true,
    reviewStatus: "APPROVED",
  },
  {
    topicSlug: "demand-revenue-elasticity",
    subtopicSlug: "elasticity",
    questionType: "WHICH_NOT_CORRECT",
    difficulty: 3,
    prompt: "AI-generated practice. Which statement is NOT correct?",
    options: [
      {
        label: "A",
        text: "If demand is elastic, a price increase lowers total revenue.",
        isCorrect: false,
        rationale: "This statement is correct.",
      },
      {
        label: "B",
        text: "If demand is inelastic, a price increase can raise total revenue.",
        isCorrect: false,
        rationale: "This statement is correct.",
      },
      {
        label: "C",
        text: "Elasticity measures the slope of the demand curve in euros per unit.",
        isCorrect: true,
        rationale: "This is not correct: elasticity is a percentage responsiveness, not the slope.",
      },
      {
        label: "D",
        text: "At unit elasticity, a small price change leaves total revenue approximately unchanged.",
        isCorrect: false,
        rationale: "This statement is correct.",
      },
    ],
    correctAnswer: "C",
    explanation:
      "The false statement is C. Slope and elasticity are different: slope uses units, while elasticity is a percentage change ratio.",
    wrongOptionExplanations: "A, B, and D are correct revenue-elasticity relationships.",
    formulaTags: "elasticity,TR",
    estimatedSteps: "Read NOT carefully, then evaluate each statement.",
    sourceInspiration: "Elasticity concept trap",
    isReviewed: true,
    reviewStatus: "APPROVED",
  },
  {
    topicSlug: "profit-maximization",
    subtopicSlug: "mr-mc",
    questionType: "OPEN_ENDED",
    difficulty: 4,
    prompt:
      "AI-generated practice. A firm faces P = 30 - Q and TC = 20 + 6Q. Find the profit-maximizing output, price, and profit. Show all steps.",
    correctAnswer: "Q = 12, P = 18, profit = 124",
    explanation:
      "TR = (30 - Q)Q = 30Q - Q^2, so MR = 30 - 2Q. MC = 6. Set MR = MC: 30 - 2Q = 6, so Q = 12. Demand gives P = 18. Profit = TR - TC = 216 - 92 = 124.",
    formulaTags: "TR,MR,MC,profit",
    estimatedSteps: "TR, MR, MC, solve, price, profit, interpretation.",
    sourceInspiration: "Exam-style profit maximization",
    isReviewed: true,
    reviewStatus: "APPROVED",
  },
  {
    topicSlug: "perfect-competition",
    subtopicSlug: "long-run-equilibrium",
    questionType: "MCQ",
    difficulty: 2,
    prompt:
      "AI-generated practice. In a long-run perfectly competitive equilibrium with free entry and exit, which condition must hold?",
    options: [
      {
        label: "A",
        text: "P = MC = AC, and firms earn zero economic profit.",
        isCorrect: true,
        rationale: "Free entry and exit eliminate economic profit and loss.",
      },
      {
        label: "B",
        text: "P > AC, and firms earn positive economic profit forever.",
        isCorrect: false,
        rationale: "Positive profit attracts entry in the long run.",
      },
      {
        label: "C",
        text: "P = MR, but MC must be above price.",
        isCorrect: false,
        rationale: "A competitive firm has P = MR, but optimal production sets P = MC.",
      },
      {
        label: "D",
        text: "P = AVC, and fixed costs determine the long-run price.",
        isCorrect: false,
        rationale: "Long-run equilibrium depends on AC, not AVC alone.",
      },
    ],
    correctAnswer: "A",
    explanation:
      "In long-run perfect competition, entry and exit push price to minimum average cost. A price-taking firm also produces where P = MC.",
    wrongOptionExplanations: "B ignores entry; C misses MC = P; D confuses short-run shutdown with long-run equilibrium.",
    formulaTags: "P=MC=AC",
    estimatedSteps: "Recall long-run entry-exit logic.",
    sourceInspiration: "Competition equilibrium",
    isReviewed: true,
    reviewStatus: "APPROVED",
  },
  {
    topicSlug: "monopoly-welfare",
    subtopicSlug: "monopoly-choice",
    questionType: "NUMERICAL",
    difficulty: 4,
    prompt:
      "AI-generated practice. A monopolist faces P = 40 - Q and constant MC = 10. Find monopoly Q and P, then find the efficient Q.",
    correctAnswer: "Monopoly Q = 15, P = 25; efficient Q = 30",
    explanation:
      "TR = 40Q - Q^2, so MR = 40 - 2Q. Monopoly sets MR = MC: 40 - 2Q = 10, so Q = 15. Demand gives P = 25. Efficient output sets P = MC: 40 - Q = 10, so Q = 30.",
    formulaTags: "MR,MC,P=MC",
    estimatedSteps: "Derive MR, solve MR=MC, use demand, solve P=MC.",
    sourceInspiration: "Monopoly versus efficient outcome",
    isReviewed: true,
    reviewStatus: "APPROVED",
  },
  {
    topicSlug: "monopoly-welfare",
    subtopicSlug: "welfare-loss",
    questionType: "NUMERICAL",
    difficulty: 4,
    prompt:
      "AI-generated practice. A monopoly reduces output from the efficient quantity 30 to 18. At Q = 18, willingness to pay is 22 and MC is 10. What is the deadweight loss triangle?",
    correctAnswer: "DWL = 72",
    explanation:
      "The lost output is 30 - 18 = 12. The wedge at the monopoly quantity is 22 - 10 = 12. DWL = 0.5 x 12 x 12 = 72.",
    formulaTags: "DWL",
    estimatedSteps: "Find base, find height, apply triangle formula.",
    sourceInspiration: "Welfare area calculation",
    isReviewed: true,
    reviewStatus: "APPROVED",
  },
  {
    topicSlug: "taxes-surplus",
    subtopicSlug: "incidence",
    questionType: "MCQ",
    difficulty: 2,
    prompt:
      "AI-generated practice. Demand is much less elastic than supply. A per-unit tax is introduced. Who bears most of the economic burden?",
    options: [
      {
        label: "A",
        text: "Buyers bear most of the burden.",
        isCorrect: true,
        rationale: "The less elastic side bears more of the burden.",
      },
      {
        label: "B",
        text: "Sellers bear most because they legally remit the tax.",
        isCorrect: false,
        rationale: "Legal remittance does not determine economic incidence.",
      },
      {
        label: "C",
        text: "The burden must be split exactly equally.",
        isCorrect: false,
        rationale: "The split depends on relative elasticities.",
      },
      {
        label: "D",
        text: "Nobody bears a burden because tax revenue offsets it.",
        isCorrect: false,
        rationale: "Tax revenue is not the same as private burden or deadweight loss.",
      },
    ],
    correctAnswer: "A",
    explanation:
      "Buyers have less ability to reduce quantity demanded, so price paid by buyers rises by more than the price received by sellers falls.",
    wrongOptionExplanations: "B confuses statutory and economic incidence; C ignores elasticities; D confuses revenue with burden.",
    formulaTags: "tax incidence,elasticity",
    estimatedSteps: "Compare relative elasticities.",
    sourceInspiration: "Tax incidence concept",
    isReviewed: true,
    reviewStatus: "APPROVED",
  },
  {
    topicSlug: "taxes-surplus",
    subtopicSlug: "tax-revenue-dwl",
    questionType: "NUMERICAL",
    difficulty: 3,
    prompt:
      "AI-generated practice. A tax of 4 euros per unit reduces quantity from 50 to 38. What is tax revenue, and what information is still needed to compute DWL exactly?",
    correctAnswer: "Tax revenue = 152; to compute DWL exactly, need the welfare wedge over the lost units or linear demand/supply slopes.",
    explanation:
      "Tax revenue equals t x Q_after_tax = 4 x 38 = 152. DWL is the lost surplus triangle from the 12 units no longer traded; to compute it exactly, you need the relevant demand/supply slopes or wedge at the old quantity.",
    formulaTags: "tax revenue,DWL",
    estimatedSteps: "Use post-tax quantity, identify missing area information.",
    sourceInspiration: "Tax revenue and DWL",
    isReviewed: true,
    reviewStatus: "APPROVED",
  },
  {
    topicSlug: "game-theory",
    subtopicSlug: "dominant-strategies",
    questionType: "STATEMENT_I_II",
    difficulty: 3,
    prompt:
      "AI-generated practice. Statement I: If a player has a dominant strategy, it is a best response to every action of the other player. Statement II: Every Nash equilibrium must maximize total surplus. Which is correct?",
    options: [
      {
        label: "A",
        text: "Only Statement I is correct.",
        isCorrect: true,
        rationale: "Dominance means best against every opponent action; Nash need not maximize total surplus.",
      },
      {
        label: "B",
        text: "Only Statement II is correct.",
        isCorrect: false,
        rationale: "Statement II is false and Statement I is true.",
      },
      {
        label: "C",
        text: "Both statements are correct.",
        isCorrect: false,
        rationale: "Statement II is false.",
      },
      {
        label: "D",
        text: "Neither statement is correct.",
        isCorrect: false,
        rationale: "Statement I is correct.",
      },
    ],
    correctAnswer: "A",
    explanation:
      "Statement I follows directly from the definition of a dominant strategy. Statement II is false because Nash equilibrium can be inefficient, as in prisoners' dilemma.",
    wrongOptionExplanations: "B, C, and D misclassify at least one statement.",
    formulaTags: "dominant strategy,Nash equilibrium",
    estimatedSteps: "Evaluate each statement independently.",
    sourceInspiration: "Game theory statement question",
    isReviewed: true,
    reviewStatus: "APPROVED",
  },
  {
    topicSlug: "game-theory",
    subtopicSlug: "nash-equilibrium",
    questionType: "FIND_THE_MISTAKE",
    difficulty: 3,
    prompt:
      "AI-generated practice. A student says: 'This outcome gives both players the highest joint payoff, so it must be a Nash equilibrium.' What is the mistake?",
    correctAnswer:
      "The student confuses social optimality with Nash equilibrium. Nash equilibrium requires each action to be a best response, not maximum joint payoff.",
    explanation:
      "A Nash equilibrium is stable against unilateral deviations. An outcome can maximize joint surplus but still give one player an incentive to deviate.",
    formulaTags: "Nash equilibrium,social optimum",
    estimatedSteps: "Define Nash, compare with joint surplus, identify deviation logic.",
    sourceInspiration: "Nash concept trap",
    isReviewed: true,
    reviewStatus: "APPROVED",
  },
  {
    topicSlug: "social-preferences-public-goods",
    subtopicSlug: "public-goods",
    questionType: "OPEN_ENDED",
    difficulty: 4,
    prompt:
      "AI-generated practice. Explain why the Nash equilibrium contribution in a public goods game can be lower than the socially optimal contribution.",
    correctAnswer:
      "Each individual compares private benefit with private cost, while the social planner includes benefits to all players. Because contributors do not capture the full social benefit, they under-contribute relative to the social optimum.",
    explanation:
      "The wedge between private and social benefits creates free-riding. Even if one contribution raises total surplus, the individual may not gain enough personally to cover the cost.",
    formulaTags: "public goods,social optimum",
    estimatedSteps: "Private incentive, social benefit, externality, conclusion.",
    sourceInspiration: "Public goods explanation",
    isReviewed: true,
    reviewStatus: "APPROVED",
  },
  {
    topicSlug: "social-preferences-public-goods",
    subtopicSlug: "ultimatum",
    questionType: "MCQ",
    difficulty: 2,
    prompt:
      "AI-generated practice. In an ultimatum game, why might a responder reject a positive offer?",
    options: [
      {
        label: "A",
        text: "The responder may care about fairness and dislike unequal splits.",
        isCorrect: true,
        rationale: "Fairness concerns can make low positive offers unacceptable.",
      },
      {
        label: "B",
        text: "Rejecting always gives the responder more money.",
        isCorrect: false,
        rationale: "Rejecting typically gives both players zero.",
      },
      {
        label: "C",
        text: "The proposer is legally required to offer half.",
        isCorrect: false,
        rationale: "There is no such requirement in the standard game.",
      },
      {
        label: "D",
        text: "Positive offers cannot be accepted in ultimatum games.",
        isCorrect: false,
        rationale: "Positive offers can be accepted.",
      },
    ],
    correctAnswer: "A",
    explanation:
      "A responder with fairness preferences may reject a low positive offer because accepting an unequal split feels worse than rejecting.",
    wrongOptionExplanations: "B, C, and D misunderstand the rules or payoffs.",
    formulaTags: "ultimatum,fairness",
    estimatedSteps: "Connect payoff to social preferences.",
    sourceInspiration: "Ultimatum game intuition",
    isReviewed: true,
    reviewStatus: "APPROVED",
  },
  {
    topicSlug: "oligopoly",
    subtopicSlug: "cournot",
    questionType: "OPEN_ENDED",
    difficulty: 5,
    prompt:
      "AI-generated practice. Two identical Cournot firms face P = 60 - Q, where Q = q1 + q2, and each has MC = 12. Derive firm 1's best response.",
    correctAnswer: "q1 = 24 - 0.5q2",
    explanation:
      "Firm 1 profit is (60 - q1 - q2 - 12)q1 = (48 - q1 - q2)q1. Expanding gives 48q1 - q1^2 - q1q2. The derivative with respect to q1 is 48 - 2q1 - q2. Set equal to zero: q1 = 24 - 0.5q2.",
    formulaTags: "Cournot,best response",
    estimatedSteps: "Write profit, expand, differentiate, solve for q1.",
    sourceInspiration: "Cournot derivation",
    isReviewed: true,
    reviewStatus: "APPROVED",
  },
  {
    topicSlug: "oligopoly",
    subtopicSlug: "bertrand",
    questionType: "MCQ",
    difficulty: 3,
    prompt:
      "AI-generated practice. In homogeneous-product Bertrand competition with identical constant marginal cost and no capacity constraints, what is the usual equilibrium price?",
    options: [
      {
        label: "A",
        text: "Price equals marginal cost.",
        isCorrect: true,
        rationale: "Any price above MC can be profitably undercut.",
      },
      {
        label: "B",
        text: "Price equals monopoly price.",
        isCorrect: false,
        rationale: "A firm can undercut the monopoly price and capture the market.",
      },
      {
        label: "C",
        text: "Price is always zero.",
        isCorrect: false,
        rationale: "If MC is positive, pricing below MC is not profitable.",
      },
      {
        label: "D",
        text: "Price equals average fixed cost.",
        isCorrect: false,
        rationale: "Average fixed cost does not determine Bertrand equilibrium price.",
      },
    ],
    correctAnswer: "A",
    explanation:
      "The undercutting incentive continues until price reaches marginal cost. At P = MC, undercutting would mean selling below cost.",
    wrongOptionExplanations: "B ignores undercutting; C ignores MC; D uses the wrong cost concept.",
    formulaTags: "Bertrand,MC",
    estimatedSteps: "Apply undercutting logic.",
    sourceInspiration: "Bertrand trap",
    isReviewed: true,
    reviewStatus: "APPROVED",
  },
  {
    topicSlug: "oligopoly",
    subtopicSlug: "capacity-constraints",
    questionType: "EXPLAIN_INTUITION",
    difficulty: 4,
    prompt:
      "AI-generated practice. Why can capacity constraints weaken the standard Bertrand trap?",
    correctAnswer:
      "If a firm cannot serve the whole market after undercutting, price cuts are less powerful. Rivals may still sell residual demand, so prices can stay above marginal cost.",
    explanation:
      "Standard Bertrand logic assumes the lowest-price firm can supply all demand. Capacity limits break that assumption and reduce the reward from undercutting.",
    formulaTags: "Bertrand,capacity constraints",
    estimatedSteps: "State standard assumption, explain capacity violation, derive pricing implication.",
    sourceInspiration: "Capacity-constrained Bertrand",
    isReviewed: true,
    reviewStatus: "APPROVED",
  },
  {
    topicSlug: "innovation-patents",
    subtopicSlug: "patent-incentives",
    questionType: "COMPARE_OUTCOMES",
    difficulty: 3,
    prompt:
      "AI-generated practice. Compare the benefit and cost of granting a patent to an innovating firm.",
    correctAnswer:
      "The benefit is stronger innovation incentive because the firm can capture returns. The cost is market power after innovation, which can raise prices and create deadweight loss.",
    explanation:
      "Patents trade static efficiency against dynamic incentives. The course logic is not that patents are always good or bad, but that they change both innovation and market outcomes.",
    formulaTags: "patents,welfare,monopoly",
    estimatedSteps: "State incentive effect, state market-power cost, conclude tradeoff.",
    sourceInspiration: "Innovation policy explanation",
    isReviewed: true,
    reviewStatus: "APPROVED",
  },
  {
    topicSlug: "innovation-patents",
    subtopicSlug: "complements-substitutes",
    questionType: "MCQ",
    difficulty: 3,
    prompt:
      "AI-generated practice. If innovation A makes innovation B more valuable to users, how should A and B be classified?",
    options: [
      {
        label: "A",
        text: "Complementary innovations.",
        isCorrect: true,
        rationale: "Each innovation raises the value of the other.",
      },
      {
        label: "B",
        text: "Substitute innovations.",
        isCorrect: false,
        rationale: "Substitutes reduce each other's value or replace each other.",
      },
      {
        label: "C",
        text: "Dominant strategies.",
        isCorrect: false,
        rationale: "This is a game theory term, not an innovation classification.",
      },
      {
        label: "D",
        text: "Deadweight losses.",
        isCorrect: false,
        rationale: "Deadweight loss is lost surplus, not a relationship between innovations.",
      },
    ],
    correctAnswer: "A",
    explanation:
      "The innovations are complements because adoption or improvement of one increases the value of the other.",
    wrongOptionExplanations: "B reverses the relationship; C and D are unrelated concepts.",
    formulaTags: "complements,substitutes",
    estimatedSteps: "Classify based on how value changes.",
    sourceInspiration: "Innovation classification",
    isReviewed: true,
    reviewStatus: "APPROVED",
  },
  {
    topicSlug: "network-effects-standards",
    subtopicSlug: "network-effects",
    questionType: "NUMERICAL",
    difficulty: 3,
    prompt:
      "AI-generated practice. A technology gives benefit = qn - p. If q = 3 and p = 18, what is the minimum network size n needed for non-negative net benefit?",
    correctAnswer: "n >= 6",
    explanation:
      "Set qn - p >= 0. With q = 3 and p = 18, 3n - 18 >= 0, so n >= 6.",
    formulaTags: "network effects",
    estimatedSteps: "Set inequality, substitute, solve.",
    sourceInspiration: "Network effects threshold",
    isReviewed: true,
    reviewStatus: "APPROVED",
  },
  {
    topicSlug: "network-effects-standards",
    subtopicSlug: "lock-in",
    questionType: "EXPLAIN_INTUITION",
    difficulty: 3,
    prompt:
      "AI-generated practice. Explain why a technically superior platform may fail to replace an incumbent platform with a large installed base.",
    correctAnswer:
      "Network effects and switching costs can make the incumbent more valuable in practice. Users care about compatibility and other users, not only technical quality.",
    explanation:
      "With network effects, value depends on the number of adopters. A superior entrant may need enough users at once to overcome the incumbent's installed-base advantage.",
    formulaTags: "network effects,lock-in",
    estimatedSteps: "Mention installed base, switching/compatibility, conclusion.",
    sourceInspiration: "Lock-in explanation",
    isReviewed: true,
    reviewStatus: "APPROVED",
  },
  {
    topicSlug: "exam-technique",
    subtopicSlug: "open-ended-structure",
    questionType: "FIND_THE_MISTAKE",
    difficulty: 2,
    prompt:
      "AI-generated practice. A student writes only: 'Q = 15 and P = 25.' The numbers are correct, but the open-ended answer receives limited credit. Why?",
    correctAnswer:
      "The answer does not show formula, setup, substitution, calculation, or economic interpretation, so the grader cannot award full step-by-step partial credit.",
    explanation:
      "For this exam style, clear steps matter. A complete answer should show MR, MC, the equality used, the demand substitution for price, and a short interpretation.",
    formulaTags: "exam technique,partial credit",
    estimatedSteps: "Identify missing work and describe exam-quality structure.",
    sourceInspiration: "Open-ended grading style",
    isReviewed: true,
    reviewStatus: "APPROVED",
  },
  {
    topicSlug: "price-discrimination",
    subtopicSlug: "uniform-vs-discriminating",
    questionType: "WHICH_STATEMENT_CORRECT",
    difficulty: 4,
    prompt:
      "AI-generated practice. Which statement about first-degree price discrimination is correct?",
    options: [
      {
        label: "A",
        text: "It can increase total surplus by selling units that uniform monopoly pricing would not sell.",
        isCorrect: true,
        rationale: "Perfect discrimination can expand output to the efficient level.",
      },
      {
        label: "B",
        text: "It necessarily gives consumers more surplus than uniform pricing.",
        isCorrect: false,
        rationale: "It can extract consumer surplus.",
      },
      {
        label: "C",
        text: "It requires all consumers to pay the same price.",
        isCorrect: false,
        rationale: "That is uniform pricing.",
      },
      {
        label: "D",
        text: "It always creates more deadweight loss than monopoly uniform pricing.",
        isCorrect: false,
        rationale: "It can reduce or eliminate DWL if all efficient units are sold.",
      },
    ],
    correctAnswer: "A",
    explanation:
      "First-degree price discrimination can make output more efficient while transferring much or all consumer surplus to the seller.",
    wrongOptionExplanations: "B ignores surplus extraction; C defines uniform pricing; D reverses the efficiency effect.",
    formulaTags: "price discrimination,welfare",
    estimatedSteps: "Separate total surplus from distribution.",
    sourceInspiration: "Price discrimination welfare",
    isReviewed: true,
    reviewStatus: "APPROVED",
  },
];

export const defaultRubricDimensions = [
  "Correct formula",
  "Correct setup",
  "Correct calculations",
  "Correct final answer",
  "Economic interpretation",
  "Explanation clarity",
  "Step-by-step reasoning",
  "Use of relevant terminology",
];
