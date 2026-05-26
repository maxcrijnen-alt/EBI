import { AppShell } from "@/components/app-shell";
import { QuestionRunner } from "@/components/question-runner";
import { Badge, ButtonLink, Card } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { pickNextQuestion, publicQuestion } from "@/lib/practice";

export default async function PracticePage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ topic?: string; mode?: string }> }>) {
  const user = await requireUser();
  const params = await searchParams;
  const mode = params.mode === "mistakes" ? "mistakes" : "adaptive";
  const question = await pickNextQuestion(user.id, mode, params.topic);
  const topics = await prisma.topic.findMany({ orderBy: { orderIndex: "asc" } });

  return (
    <AppShell user={user}>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2">
          <h1 className="text-3xl font-semibold">Adaptive practice</h1>
          <p className="text-[color:var(--muted)]">
            Questions adapt to your weak topics, difficulty reached, and mistake history.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/practice" variant="secondary">Adaptive</ButtonLink>
          <ButtonLink href="/practice?mode=mistakes" variant="secondary">Past mistakes</ButtonLink>
        </div>
      </section>
      <Card>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <a
              key={topic.id}
              href={`/practice?topic=${topic.slug}`}
              className="rounded-md border border-[color:var(--line)] px-3 py-2 text-sm hover:border-[color:var(--accent)]"
            >
              {topic.title}
            </a>
          ))}
          {params.topic ? <Badge>Filtered: {params.topic}</Badge> : null}
        </div>
      </Card>
      <QuestionRunner initialQuestion={publicQuestion(question)} mode={mode} topicSlug={params.topic} />
    </AppShell>
  );
}
