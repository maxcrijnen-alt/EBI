import { AppShell } from "@/components/app-shell";
import { Badge, ButtonLink, Card, ProgressBar } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ensureMasteryRecords } from "@/lib/scoring";

export default async function DashboardPage() {
  const user = await requireUser();
  await ensureMasteryRecords(user.id);

  const [mastery, attempts, mistakes, dueCards, rubricScores] = await Promise.all([
    prisma.userMastery.findMany({
      where: { userId: user.id, subtopicId: null },
      include: { topic: true },
      orderBy: { topic: { orderIndex: "asc" } },
    }),
    prisma.attempt.findMany({
      where: { userId: user.id },
      include: { question: { include: { topic: true } } },
      orderBy: { createdAt: "desc" },
      take: 120,
    }),
    prisma.mistake.findMany({
      where: { userId: user.id, fixedLater: false },
      include: { topic: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.flashcard.count({
      where: {
        OR: [{ userId: user.id }, { userId: null }],
        dueAt: { lte: new Date() },
      },
    }),
    prisma.rubricScore.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  const totalMastery = Math.round(
    mastery.reduce((sum, item) => sum + item.mastery, 0) / Math.max(1, mastery.length),
  );
  const accuracy = attempts.length
    ? Math.round((attempts.filter((attempt) => attempt.isCorrect).length / attempts.length) * 100)
    : 0;
  const openAvg = rubricScores.length
    ? Math.round(
        (rubricScores.reduce((sum, item) => sum + item.totalScore / item.maxScore, 0) / rubricScores.length) *
          100,
      )
    : 0;
  const weakest = [...mastery].sort((a, b) => a.mastery - b.mastery).slice(0, 5);
  const nextTopic = weakest[0]?.topic;

  const typeStats = attempts.reduce<Record<string, { total: number; correct: number }>>((acc, attempt) => {
    const type = attempt.question.questionType.replaceAll("_", " ");
    acc[type] ??= { total: 0, correct: 0 };
    acc[type].total += 1;
    acc[type].correct += attempt.isCorrect ? 1 : 0;
    return acc;
  }, {});

  return (
    <AppShell user={user}>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2">
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-[color:var(--muted)]">
            Goal: {user.goalGrade}. The next action is based on weak topics, mistakes, and recent accuracy.
          </p>
        </div>
        <ButtonLink href={nextTopic ? `/practice?topic=${nextTopic.slug}` : "/diagnostic"}>
          What should I study now?
        </ButtonLink>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-[color:var(--muted)]">Exam readiness</p>
          <p className="mt-2 text-3xl font-semibold">{user.examReadinessScore}%</p>
          <ProgressBar value={user.examReadinessScore} />
        </Card>
        <Card>
          <p className="text-sm text-[color:var(--muted)]">Overall mastery</p>
          <p className="mt-2 text-3xl font-semibold">{totalMastery}%</p>
          <ProgressBar value={totalMastery} />
        </Card>
        <Card>
          <p className="text-sm text-[color:var(--muted)]">Recent accuracy</p>
          <p className="mt-2 text-3xl font-semibold">{accuracy}%</p>
          <ProgressBar value={accuracy} />
        </Card>
        <Card>
          <p className="text-sm text-[color:var(--muted)]">Open-ended rubric</p>
          <p className="mt-2 text-3xl font-semibold">{openAvg}%</p>
          <ProgressBar value={openAvg} />
        </Card>
      </section>

      {!user.diagnosticCompleted ? (
        <Card className="border-[color:var(--accent)]/40">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Diagnostic not complete</h2>
              <p className="text-sm text-[color:var(--muted)]">
                Start with 10 adaptive mixed questions so the system can estimate weak areas.
              </p>
            </div>
            <ButtonLink href="/diagnostic">Start diagnostic</ButtonLink>
          </div>
        </Card>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <Card>
          <h2 className="mb-4 text-xl font-semibold">Mastery by topic</h2>
          <div className="grid gap-4">
            {mastery.map((item) => (
              <div key={item.id} className="grid gap-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">{item.topic.title}</span>
                  <span className="text-[color:var(--muted)]">{Math.round(item.mastery)}% - {item.status.replaceAll("_", " ")}</span>
                </div>
                <ProgressBar value={item.mastery} />
              </div>
            ))}
          </div>
        </Card>
        <div className="grid gap-5">
          <Card>
            <h2 className="mb-4 text-xl font-semibold">Weakest topics</h2>
            <div className="grid gap-2">
              {weakest.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-md border border-[color:var(--line)] p-3">
                  <span className="text-sm">{item.topic.title}</span>
                  <Badge>{Math.round(item.mastery)}%</Badge>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="mb-4 text-xl font-semibold">Study signals</h2>
            <div className="grid gap-3 text-sm">
              <p>Questions answered: {attempts.length}</p>
              <p>Active mistakes: {mistakes.length}</p>
              <p>Flashcards due: {dueCards}</p>
              <p>Study streak: {user.studyTimePerWeek > 0 ? user.studyTimePerWeek : 0} planned hours/week</p>
            </div>
          </Card>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-xl font-semibold">Accuracy by question type</h2>
          <div className="grid gap-3">
            {Object.entries(typeStats).length ? (
              Object.entries(typeStats).map(([type, stat]) => {
                const value = Math.round((stat.correct / stat.total) * 100);
                return (
                  <div key={type} className="grid gap-2">
                    <div className="flex justify-between text-sm">
                      <span>{type}</span>
                      <span>{value}%</span>
                    </div>
                    <ProgressBar value={value} />
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-[color:var(--muted)]">Answer practice questions to build this breakdown.</p>
            )}
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 text-xl font-semibold">Recent mistakes</h2>
          <div className="grid gap-2">
            {mistakes.slice(0, 5).map((mistake) => (
              <div key={mistake.id} className="rounded-md border border-[color:var(--line)] p-3 text-sm">
                <div className="flex flex-wrap gap-2">
                  <Badge>{mistake.topic.title}</Badge>
                  <Badge>{mistake.mistakeType}</Badge>
                </div>
                <p className="mt-2 line-clamp-2">{mistake.questionSnapshot}</p>
              </div>
            ))}
            {!mistakes.length ? <p className="text-sm text-[color:var(--muted)]">No unresolved mistakes yet.</p> : null}
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
