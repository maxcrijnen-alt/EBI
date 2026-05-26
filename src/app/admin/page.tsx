import { createDraftQuestionAction, reviewQuestionAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, SubmitButton } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ingestionPipeline } from "@/lib/ingestion";

export default async function AdminPage() {
  const user = await requireAdmin();
  const [questions, drafts, topics, sources] = await Promise.all([
    prisma.question.findMany({
      include: { topic: true, subtopic: true, options: true },
      orderBy: [{ reviewStatus: "asc" }, { createdAt: "desc" }],
      take: 30,
    }),
    prisma.questionDraft.findMany({
      include: { topic: true, subtopic: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.topic.findMany({ orderBy: { orderIndex: "asc" } }),
    prisma.sourceDocument.findMany({ orderBy: { filename: "asc" } }),
  ]);

  return (
    <AppShell user={user}>
      <section className="grid gap-2">
        <h1 className="text-3xl font-semibold">Admin review</h1>
        <p className="text-[color:var(--muted)]">
          Review AI-generated questions, fix answer keys, manage drafts, and track source ingestion placeholders.
        </p>
      </section>

      <Card>
        <form action={createDraftQuestionAction} className="flex flex-wrap items-end gap-3">
          <label className="grid gap-2 text-sm font-medium">
            Draft topic
            <select
              className="min-h-11 rounded-md border border-[color:var(--line)] bg-[color:var(--panel)] px-3"
              name="topicId"
            >
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </select>
          </label>
          <SubmitButton>Create AI draft placeholder</SubmitButton>
        </form>
      </Card>

      <section className="grid gap-4">
        <h2 className="text-xl font-semibold">Question review queue</h2>
        {questions.map((question) => (
          <Card key={question.id}>
            <div className="grid gap-3">
              <div className="flex flex-wrap gap-2">
                <Badge>{question.reviewStatus}</Badge>
                <Badge>{question.sourceType}</Badge>
                <Badge>{question.topic.title}</Badge>
                {question.subtopic ? <Badge>{question.subtopic.title}</Badge> : null}
                <Badge>Level {question.difficulty}</Badge>
              </div>
              <p className="font-medium">{question.prompt}</p>
              <p className="text-sm text-[color:var(--muted)]">Answer: {question.correctAnswer}</p>
              <p className="text-sm text-[color:var(--muted)]">{question.explanation}</p>
              <div className="flex flex-wrap gap-2">
                <form action={reviewQuestionAction}>
                  <input type="hidden" name="id" value={question.id} />
                  <input type="hidden" name="status" value="APPROVED" />
                  <SubmitButton>Approve</SubmitButton>
                </form>
                <form action={reviewQuestionAction}>
                  <input type="hidden" name="id" value={question.id} />
                  <input type="hidden" name="status" value="REJECTED" />
                  <SubmitButton variant="secondary">Reject</SubmitButton>
                </form>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-xl font-semibold">AI-generated drafts</h2>
          <div className="grid gap-3">
            {drafts.map((draft) => (
              <div key={draft.id} className="rounded-md border border-[color:var(--line)] p-3">
                <div className="flex flex-wrap gap-2">
                  <Badge>{draft.status}</Badge>
                  <Badge>{draft.topic.title}</Badge>
                </div>
                <p className="mt-2 text-sm">{draft.prompt}</p>
                <p className="mt-2 text-xs text-[color:var(--muted)]">{draft.notes}</p>
              </div>
            ))}
            {!drafts.length ? <p className="text-sm text-[color:var(--muted)]">No drafts yet.</p> : null}
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 text-xl font-semibold">Source ingestion placeholders</h2>
          <div className="mb-4 grid gap-2">
            {ingestionPipeline.map((stage) => (
              <div key={stage.stage} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[color:var(--line)] p-2 text-xs">
                <span>{stage.stage.replaceAll("_", " ")}</span>
                <span className="text-[color:var(--muted)]">{stage.outputFolder} - {stage.status}</span>
              </div>
            ))}
          </div>
          <div className="grid gap-2">
            {sources.map((source) => (
              <div key={source.id} className="rounded-md border border-[color:var(--line)] p-3 text-sm">
                <div className="flex flex-wrap gap-2">
                  <Badge>{source.kind}</Badge>
                  <Badge>{source.status}</Badge>
                </div>
                <p className="mt-2 font-medium">{source.filename}</p>
                <p className="text-[color:var(--muted)]">{source.path}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
