import { AppShell } from "@/components/app-shell";
import { QuestionRunner } from "@/components/question-runner";
import { Card } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { pickNextQuestion, publicQuestion } from "@/lib/practice";

export default async function DiagnosticPage() {
  const user = await requireUser();
  const question = await pickNextQuestion(user.id, "diagnostic");

  return (
    <AppShell user={user}>
      <section className="grid gap-2">
        <h1 className="text-3xl font-semibold">Adaptive diagnostic</h1>
        <p className="text-[color:var(--muted)]">
          Mixed conceptual, calculation, and explanation questions. After 10 answers, topic mastery and readiness update.
        </p>
      </section>
      <Card>
        <div className="grid gap-2 text-sm text-[color:var(--muted)]">
          <p>Current diagnostic score: {user.diagnosticScore}%</p>
          <p>The engine watches for concept gaps, formula confusion, algebra slips, graph interpretation issues, MC traps, weak intuition, and incomplete reasoning.</p>
        </div>
      </Card>
      <QuestionRunner initialQuestion={publicQuestion(question)} mode="diagnostic" />
    </AppShell>
  );
}
