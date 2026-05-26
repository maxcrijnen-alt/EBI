import { markMistakeFixedAction, markMistakeReviewedAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { Badge, ButtonLink, Card, SubmitButton } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function MistakesPage() {
  const user = await requireUser();
  const mistakes = await prisma.mistake.findMany({
    where: { userId: user.id },
    include: { topic: true, subtopic: true },
    orderBy: [{ fixedLater: "asc" }, { reviewed: "asc" }, { createdAt: "desc" }],
  });

  const active = mistakes.filter((mistake) => !mistake.fixedLater);
  const categories = active.reduce<Record<string, number>>((acc, mistake) => {
    acc[mistake.mistakeType] = (acc[mistake.mistakeType] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <AppShell user={user}>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2">
          <h1 className="text-3xl font-semibold">Mistake notebook</h1>
          <p className="text-[color:var(--muted)]">
            Wrong or weak answers are saved automatically with mistake type, formula tags, and repair status.
          </p>
        </div>
        <ButtonLink href="/practice?mode=mistakes">Practice past mistakes</ButtonLink>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {Object.entries(categories).map(([category, count]) => (
          <Card key={category}>
            <p className="text-sm text-[color:var(--muted)]">{category}</p>
            <p className="mt-2 text-3xl font-semibold">{count}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-4">
        {mistakes.map((mistake) => (
          <Card key={mistake.id}>
            <div className="grid gap-4">
              <div className="flex flex-wrap gap-2">
                <Badge>{mistake.topic.title}</Badge>
                {mistake.subtopic ? <Badge>{mistake.subtopic.title}</Badge> : null}
                <Badge>{mistake.mistakeType}</Badge>
                <Badge>Level {mistake.difficulty}</Badge>
                <Badge>{mistake.fixedLater ? "Fixed" : mistake.reviewed ? "Reviewed" : "Open"}</Badge>
              </div>
              <div className="grid gap-2 text-sm leading-6">
                <p className="font-medium">{mistake.questionSnapshot}</p>
                <p><strong>Your answer:</strong> {mistake.userAnswer}</p>
                <p><strong>Correct answer:</strong> {mistake.correctAnswer}</p>
                <p className="text-[color:var(--muted)]">{mistake.explanation}</p>
                {mistake.formula ? <p><strong>Formula:</strong> {mistake.formula}</p> : null}
              </div>
              {!mistake.fixedLater ? (
                <div className="flex flex-wrap gap-2">
                  <form action={markMistakeReviewedAction}>
                    <input type="hidden" name="id" value={mistake.id} />
                    <SubmitButton variant="secondary">Mark reviewed</SubmitButton>
                  </form>
                  <form action={markMistakeFixedAction}>
                    <input type="hidden" name="id" value={mistake.id} />
                    <SubmitButton>Mark fixed</SubmitButton>
                  </form>
                </div>
              ) : null}
            </div>
          </Card>
        ))}
        {!mistakes.length ? (
          <Card>
            <p className="text-sm text-[color:var(--muted)]">No mistakes yet. Practice will populate this automatically.</p>
          </Card>
        ) : null}
      </section>
    </AppShell>
  );
}
