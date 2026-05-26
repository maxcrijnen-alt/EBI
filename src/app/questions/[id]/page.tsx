import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { QuestionRunner } from "@/components/question-runner";
import { Badge, Card } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { findQuestionById, publicQuestion } from "@/lib/practice";

export default async function QuestionPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const user = await requireUser();
  const { id } = await params;
  const question = await findQuestionById(id);
  if (!question) notFound();

  return (
    <AppShell user={user}>
      <section className="grid gap-2">
        <div className="flex flex-wrap gap-2">
          <Badge>{question.sourceType}</Badge>
          <Badge>{question.topic.title}</Badge>
          <Badge>Level {question.difficulty}</Badge>
        </div>
        <h1 className="text-3xl font-semibold">Question screen</h1>
        <p className="text-[color:var(--muted)]">
          Answer, request hints, then switch explanation styles after submission.
        </p>
      </section>
      <Card>
        <p className="text-sm text-[color:var(--muted)]">
          Generated practice is original and labeled separately from future course-material imports.
        </p>
      </Card>
      <QuestionRunner initialQuestion={publicQuestion(question)} mode="adaptive" />
    </AppShell>
  );
}
