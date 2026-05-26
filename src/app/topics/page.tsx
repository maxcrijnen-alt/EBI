import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, ProgressBar } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function TopicsPage() {
  const user = await requireUser();
  const topics = await prisma.topic.findMany({
    orderBy: { orderIndex: "asc" },
    include: {
      subtopics: { orderBy: { orderIndex: "asc" } },
      masteryScores: { where: { userId: user.id, subtopicId: null } },
    },
  });

  return (
    <AppShell user={user}>
      <section className="grid gap-2">
        <h1 className="text-3xl font-semibold">Topic overview</h1>
        <p className="text-[color:var(--muted)]">
          Each topic page connects concepts, formulas, traps, worked examples, flashcards, mistakes, and practice.
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {topics.map((topic) => {
          const mastery = topic.masteryScores[0]?.mastery ?? 0;
          return (
            <Link key={topic.id} href={`/topics/${topic.slug}`}>
              <Card className="h-full transition hover:border-[color:var(--accent)]">
                <div className="grid gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-semibold">{topic.title}</h2>
                    <Badge>{Math.round(mastery)}%</Badge>
                  </div>
                  <p className="text-sm leading-6 text-[color:var(--muted)]">{topic.description}</p>
                  <ProgressBar value={mastery} />
                  <p className="text-xs text-[color:var(--muted)]">
                    {topic.subtopics.map((subtopic) => subtopic.title).join(" / ")}
                  </p>
                </div>
              </Card>
            </Link>
          );
        })}
      </section>
    </AppShell>
  );
}
