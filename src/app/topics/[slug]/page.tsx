import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge, ButtonLink, Card, ProgressBar } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function TopicPage({
  params,
}: Readonly<{ params: Promise<{ slug: string }> }>) {
  const user = await requireUser();
  const { slug } = await params;
  const topic = await prisma.topic.findUnique({
    where: { slug },
    include: {
      subtopics: { orderBy: { orderIndex: "asc" } },
      formulas: true,
      flashcards: { take: 6 },
      questions: { where: { reviewStatus: "APPROVED" }, take: 3 },
      masteryScores: { where: { userId: user.id, subtopicId: null } },
    },
  });

  if (!topic) notFound();

  const mastery = topic.masteryScores[0]?.mastery ?? 0;

  return (
    <AppShell user={user}>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2">
          <div className="flex flex-wrap gap-2">
            <Badge>{Math.round(mastery)}% mastery</Badge>
            <Badge>{topic.weight}% course weight signal</Badge>
          </div>
          <h1 className="text-3xl font-semibold">{topic.title}</h1>
          <p className="max-w-3xl text-[color:var(--muted)]">{topic.description}</p>
          <ProgressBar value={mastery} />
        </div>
        <div className="flex gap-2">
          <ButtonLink href={`/practice?topic=${topic.slug}`}>Practice</ButtonLink>
          <ButtonLink href="/flashcards" variant="secondary">Flashcards</ButtonLink>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_.9fr]">
        <Card>
          <h2 className="mb-3 text-xl font-semibold">Short explanation</h2>
          <p className="text-sm leading-7 text-[color:var(--muted)]">
            Start by naming the economic object, then write the exact formula or equilibrium condition.
            For exam-style answers, keep each step visible and finish with one sentence interpreting the result.
          </p>
          <div className="mt-5 grid gap-2">
            {topic.subtopics.map((subtopic) => (
              <div key={subtopic.id} className="rounded-md border border-[color:var(--line)] p-3">
                <p className="font-medium">{subtopic.title}</p>
                <p className="text-sm text-[color:var(--muted)]">{subtopic.description}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-xl font-semibold">Visual intuition</h2>
          <div className="relative h-60 overflow-hidden rounded-md border border-[color:var(--line)] bg-black/[.03] dark:bg-white/[.04]">
            <div className="absolute bottom-8 left-10 h-[1px] w-[78%] bg-[color:var(--muted)]" />
            <div className="absolute bottom-8 left-10 h-[78%] w-[1px] bg-[color:var(--muted)]" />
            <div className="absolute bottom-16 left-16 h-[2px] w-[70%] -rotate-12 bg-[color:var(--accent)]" />
            <div className="absolute bottom-24 left-20 h-[2px] w-[62%] rotate-12 bg-[color:var(--accent-2)]" />
            <div className="absolute bottom-28 left-[46%] size-3 rounded-full bg-[color:var(--warning)]" />
            <span className="absolute bottom-2 right-8 text-xs text-[color:var(--muted)]">Quantity</span>
            <span className="absolute left-2 top-4 text-xs text-[color:var(--muted)]">Price / cost</span>
          </div>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <Card>
          <h2 className="mb-3 text-xl font-semibold">Key formulas</h2>
          <div className="grid gap-3">
            {topic.formulas.map((formula) => (
              <div key={formula.id} className="rounded-md border border-[color:var(--line)] p-3">
                <p className="font-medium">{formula.title}</p>
                <p className="font-mono text-sm">{formula.formula}</p>
                <p className="mt-2 text-sm text-[color:var(--muted)]">{formula.whenToUse}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 text-xl font-semibold">Common traps</h2>
          <div className="grid gap-3 text-sm text-[color:var(--muted)]">
            {topic.formulas.slice(0, 4).map((formula) => (
              <p key={formula.id} className="rounded-md border border-[color:var(--line)] p-3">
                {formula.trap}
              </p>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 text-xl font-semibold">Worked example</h2>
          <div className="grid gap-3 text-sm leading-7 text-[color:var(--muted)]">
            {topic.questions[0] ? (
              <>
                <p>{topic.questions[0].prompt}</p>
                <p className="font-medium text-[color:var(--foreground)]">Answer: {topic.questions[0].correctAnswer}</p>
                <p>{topic.questions[0].explanation}</p>
              </>
            ) : (
              <p>Practice questions for this topic will appear here after review.</p>
            )}
          </div>
        </Card>
      </section>

      <Card>
        <h2 className="mb-3 text-xl font-semibold">AI tutor for this topic</h2>
        <p className="text-sm text-[color:var(--muted)]">
          Use the practice screen explanation styles for quick answer, hint, step-by-step solution,
          intuition first, formula first, wrong-answer repair, similar examples, and easier or harder variants.
        </p>
      </Card>
    </AppShell>
  );
}
