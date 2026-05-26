import { AppShell } from "@/components/app-shell";
import { QuestionRunner } from "@/components/question-runner";
import { Badge, Card } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { pickNextQuestion, publicQuestion } from "@/lib/practice";

export default async function MockPage() {
  const user = await requireUser();
  const question = await pickNextQuestion(user.id, "mock");
  const mockAttempts = await prisma.attempt.findMany({
    where: { userId: user.id, mode: "MOCK" },
    orderBy: { createdAt: "desc" },
    take: 24,
  });

  const score = mockAttempts.length
    ? Math.round(
        (mockAttempts.reduce((sum, attempt) => sum + attempt.score / Math.max(attempt.maxScore, 1), 0) /
          mockAttempts.length) *
          100,
      )
    : 0;

  return (
    <AppShell user={user}>
      <section className="grid gap-2">
        <h1 className="text-3xl font-semibold">Mock practice</h1>
        <p className="text-[color:var(--muted)]">
          Exam-style structure without forced time pressure: 20 multiple-choice questions and 4 open-ended questions.
        </p>
      </section>
      <Card>
        <div className="flex flex-wrap gap-2">
          <Badge>Untimed mode</Badge>
          <Badge>Soft structure: 20 MC + 4 open</Badge>
          <Badge>Recent mock score: {score}%</Badge>
          <Badge>Answered in latest cycle: {mockAttempts.length}/24</Badge>
        </div>
      </Card>
      <QuestionRunner initialQuestion={publicQuestion(question)} mode="mock" />
    </AppShell>
  );
}
