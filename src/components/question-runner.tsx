"use client";

import { useMemo, useState } from "react";
import { Badge, Card, ProgressBar } from "@/components/ui";

type PublicQuestion = {
  id: string;
  topic: string;
  topicSlug: string;
  subtopic: string | null;
  sourceType: string;
  questionType: string;
  difficulty: number;
  prompt: string;
  formulaTags: string | null;
  options: Array<{ id: string; label: string; text: string }>;
};

type AttemptResult = {
  isCorrect: boolean;
  score: number;
  maxScore: number;
  feedback: string;
  correctAnswer: string;
  explanation: string;
  mistakeType?: string | null;
  rubricDimensions?: Array<{ name: string; score: number; max: number; note: string }> | null;
  readiness: number;
};

const styles = [
  ["hint", "Hint"],
  ["step", "Step-by-step"],
  ["intuition", "Intuition"],
  ["formula", "Formula first"],
  ["wrong", "Why wrong"],
  ["options", "MC options"],
  ["similar", "Similar"],
  ["harder", "Harder"],
  ["easier", "Easier"],
];

const structuredTypes = new Set([
  "OPEN_ENDED",
  "DERIVATION",
  "EXPLAIN_INTUITION",
  "COMPARE_OUTCOMES",
  "FIND_THE_MISTAKE",
]);

const structuredFields = [
  ["formula", "Formula or concept"],
  ["setup", "Setup"],
  ["calculation", "Calculation or derivation"],
  ["final", "Final answer"],
  ["interpretation", "Economic interpretation"],
] as const;

type StructuredAnswer = Record<(typeof structuredFields)[number][0], string>;

const emptyStructuredAnswer: StructuredAnswer = {
  formula: "",
  setup: "",
  calculation: "",
  final: "",
  interpretation: "",
};

export function QuestionRunner({
  initialQuestion,
  mode,
  topicSlug,
}: Readonly<{ initialQuestion: PublicQuestion | null; mode: string; topicSlug?: string }>) {
  const [question, setQuestion] = useState(initialQuestion);
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [structuredAnswer, setStructuredAnswer] = useState<StructuredAnswer>(emptyStructuredAnswer);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [answered, setAnswered] = useState(0);

  const progress = useMemo(() => {
    if (mode === "diagnostic") return Math.min(100, (answered / 10) * 100);
    if (mode === "mock") return Math.min(100, (answered / 24) * 100);
    return Math.min(100, answered * 10);
  }, [answered, mode]);

  async function loadNext() {
    setLoading(true);
    setResult(null);
    setExplanation("");
    setSelectedOptionId("");
    setAnswerText("");
    setStructuredAnswer(emptyStructuredAnswer);
    const params = new URLSearchParams({ mode });
    if (topicSlug) params.set("topic", topicSlug);
    const response = await fetch(`/api/practice/next?${params.toString()}`);
    const data = await response.json();
    setQuestion(data.question);
    setLoading(false);
  }

  async function submit() {
    if (!question) return;
    const answer = buildAnswerText();
    setLoading(true);
    const response = await fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: question.id,
        answerText: answer,
        selectedOptionId: selectedOptionId || null,
        mode,
      }),
    });
    const data = await response.json();
    setResult(data);
    setAnswered((value) => value + 1);
    setLoading(false);
  }

  async function getExplanation(style: string) {
    if (!question) return;
    const answer = buildAnswerText();
    setLoading(true);
    const response = await fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: question.id,
        style,
        userAnswer: answer,
      }),
    });
    const data = await response.json();
    setExplanation(data.explanation);
    setLoading(false);
  }

  function usesStructuredAnswer() {
    return question ? structuredTypes.has(question.questionType) && question.options.length === 0 : false;
  }

  function buildAnswerText() {
    if (!usesStructuredAnswer()) return answerText;
    return structuredFields
      .map(([key, label]) => `${label}: ${structuredAnswer[key].trim() || "(blank)"}`)
      .join("\n");
  }

  function hasAnswer() {
    if (selectedOptionId || answerText.trim()) return true;
    return usesStructuredAnswer() && Object.values(structuredAnswer).some((value) => value.trim().length > 0);
  }

  if (!question) {
    return (
      <Card>
        <div className="grid gap-3">
          <h2 className="text-xl font-semibold">No question available</h2>
          <p className="text-sm text-[color:var(--muted)]">
            The seeded bank has no matching question left for this mode. Try adaptive practice or review the admin panel.
          </p>
          <button
            className="w-fit rounded-md bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white"
            onClick={loadNext}
          >
            Try another question
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-5">
      <Card>
        <div className="grid gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{question.sourceType === "AI_GENERATED" ? "AI-generated practice" : question.sourceType}</Badge>
            <Badge>{question.topic}</Badge>
            {question.subtopic ? <Badge>{question.subtopic}</Badge> : null}
            <Badge>Level {question.difficulty}</Badge>
            <Badge>{question.questionType.replaceAll("_", " ")}</Badge>
          </div>
          <ProgressBar value={progress} />
          <h1 className="text-xl font-semibold leading-8">{question.prompt}</h1>
          {question.formulaTags ? (
            <p className="text-sm text-[color:var(--muted)]">Formula tags: {question.formulaTags}</p>
          ) : null}

          {question.options.length > 0 ? (
            <div className="grid gap-2">
              {question.options.map((option) => (
                <label
                  key={option.id}
                  className="flex cursor-pointer gap-3 rounded-md border border-[color:var(--line)] p-3 hover:border-[color:var(--accent)]"
                >
                  <input
                    type="radio"
                    name="option"
                    value={option.id}
                    checked={selectedOptionId === option.id}
                    onChange={() => {
                      setSelectedOptionId(option.id);
                      setAnswerText(option.label);
                    }}
                  />
                  <span>
                    <strong>{option.label}.</strong> {option.text}
                  </span>
                </label>
              ))}
            </div>
          ) : usesStructuredAnswer() ? (
            <div className="grid gap-3">
              {structuredFields.map(([key, label]) => (
                <label key={key} className="grid gap-2 text-sm font-medium">
                  {label}
                  <textarea
                    className="min-h-24 rounded-md border border-[color:var(--line)] bg-[color:var(--panel)] p-3 outline-none focus:border-[color:var(--accent)]"
                    value={structuredAnswer[key]}
                    onChange={(event) =>
                      setStructuredAnswer((current) => ({ ...current, [key]: event.target.value }))
                    }
                    placeholder={
                      key === "interpretation"
                        ? "Add the economic meaning, welfare/intuitive implication, or common trap."
                        : "Write this step as you would show it on the exam."
                    }
                  />
                </label>
              ))}
            </div>
          ) : (
            <label className="grid gap-2 text-sm font-medium">
              Your answer
              <textarea
                className="min-h-36 rounded-md border border-[color:var(--line)] bg-[color:var(--panel)] p-3 outline-none focus:border-[color:var(--accent)]"
                value={answerText}
                onChange={(event) => setAnswerText(event.target.value)}
                placeholder="Show formula, setup, substitution, calculation, final answer, and economic interpretation."
              />
            </label>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-md bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              disabled={loading || !hasAnswer()}
              onClick={submit}
            >
              Submit answer
            </button>
            <button
              className="rounded-md border border-[color:var(--line)] px-4 py-2 text-sm font-semibold"
              disabled={loading}
              onClick={() => getExplanation("hint")}
            >
              Hint
            </button>
            <button
              className="rounded-md border border-[color:var(--line)] px-4 py-2 text-sm font-semibold"
              disabled={loading}
              onClick={loadNext}
            >
              Skip / next
            </button>
          </div>
        </div>
      </Card>

      {result ? (
        <Card className={result.isCorrect ? "border-emerald-500/40" : "border-[color:var(--warning)]/50"}>
          <div className="grid gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{result.isCorrect ? "Correct" : "Needs work"}</Badge>
              <Badge>
                Score {result.score}/{result.maxScore}
              </Badge>
              <Badge>Readiness {result.readiness}%</Badge>
              {result.mistakeType ? <Badge>{result.mistakeType}</Badge> : null}
            </div>
            <p className="text-sm">{result.feedback}</p>
            {result.rubricDimensions?.length ? (
              <div className="grid gap-2">
                {result.rubricDimensions.map((dimension) => (
                  <div
                    key={dimension.name}
                    className="grid gap-1 rounded-md border border-[color:var(--line)] p-3 text-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{dimension.name}</span>
                      <span className="text-[color:var(--muted)]">
                        {dimension.score}/{dimension.max}
                      </span>
                    </div>
                    <p className="text-[color:var(--muted)]">{dimension.note}</p>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="rounded-md bg-black/[.04] p-4 text-sm dark:bg-white/[.06]">
              <p className="font-semibold">Correct answer</p>
              <p>{result.correctAnswer}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {styles.map(([value, label]) => (
                <button
                  key={value}
                  className="rounded-md border border-[color:var(--line)] px-3 py-2 text-xs font-semibold hover:border-[color:var(--accent)]"
                  disabled={loading}
                  onClick={() => getExplanation(value)}
                >
                  {label}
                </button>
              ))}
              <button
                className="rounded-md bg-[color:var(--accent)] px-4 py-2 text-xs font-semibold text-white"
                disabled={loading}
                onClick={loadNext}
              >
                Next adaptive question
              </button>
            </div>
          </div>
        </Card>
      ) : null}

      {explanation ? (
        <Card>
          <h2 className="mb-3 text-lg font-semibold">Tutor explanation</h2>
          <pre className="whitespace-pre-wrap text-sm leading-7">{explanation}</pre>
        </Card>
      ) : null}
    </div>
  );
}
