import {
  approveQuestionDraftAction,
  generateDraftBatchAction,
  rejectQuestionDraftAction,
  reviewQuestionAction,
  updateQuestionDraftAction,
} from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, SubmitButton } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ingestionPipeline } from "@/lib/ingestion";

export default async function AdminPage() {
  const user = await requireAdmin();
  const [questions, drafts, sources, aiInteractions] = await Promise.all([
    prisma.question.findMany({
      include: { topic: true, subtopic: true, options: true },
      orderBy: [{ reviewStatus: "asc" }, { createdAt: "desc" }],
      take: 30,
    }),
    prisma.questionDraft.findMany({
      include: { topic: true, subtopic: true },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    prisma.sourceDocument.findMany({
      orderBy: { filename: "asc" },
      include: { _count: { select: { chunks: true } } },
    }),
    prisma.aIInteraction.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { user: { select: { email: true } } },
    }),
  ]);

  return (
    <AppShell user={user}>
      <section className="grid gap-2">
        <h1 className="text-3xl font-semibold">Admin review</h1>
        <p className="text-[color:var(--muted)]">
          Review AI-generated questions, fix answer keys, manage drafts, and track source ingestion status.
        </p>
      </section>

      <Card>
        <form action={generateDraftBatchAction} className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Focused draft bank</h2>
            <p className="text-sm text-[color:var(--muted)]">
              Creates or updates about 100 original AI-style drafts. Students see only approved questions.
            </p>
          </div>
          <SubmitButton>Generate focused drafts</SubmitButton>
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
                  {draft.subtopic ? <Badge>{draft.subtopic.title}</Badge> : null}
                  <Badge>{draft.questionType.replaceAll("_", " ")}</Badge>
                  <Badge>Level {draft.difficulty}</Badge>
                </div>
                <form action={updateQuestionDraftAction} className="mt-3 grid gap-3">
                  <input type="hidden" name="id" value={draft.id} />
                  <div className="grid gap-3 md:grid-cols-[1fr_120px]">
                    <label className="grid gap-1 text-xs font-medium">
                      Type
                      <input
                        className="min-h-10 rounded-md border border-[color:var(--line)] bg-[color:var(--panel)] px-2"
                        name="questionType"
                        defaultValue={draft.questionType}
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-medium">
                      Difficulty
                      <input
                        className="min-h-10 rounded-md border border-[color:var(--line)] bg-[color:var(--panel)] px-2"
                        name="difficulty"
                        type="number"
                        min="1"
                        max="6"
                        defaultValue={draft.difficulty}
                      />
                    </label>
                  </div>
                  <DraftTextarea name="prompt" label="Prompt" defaultValue={draft.prompt} />
                  <DraftTextarea name="answer" label="Correct answer" defaultValue={draft.answer} />
                  <DraftTextarea name="explanation" label="Explanation" defaultValue={draft.explanation} />
                  <DraftTextarea name="optionsJson" label="Options JSON" defaultValue={draft.optionsJson ?? ""} />
                  <DraftTextarea
                    name="wrongOptionExplanations"
                    label="Wrong-option explanations"
                    defaultValue={draft.wrongOptionExplanations ?? ""}
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="grid gap-1 text-xs font-medium">
                      Formula tags
                      <input
                        className="min-h-10 rounded-md border border-[color:var(--line)] bg-[color:var(--panel)] px-2"
                        name="formulaTags"
                        defaultValue={draft.formulaTags ?? ""}
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-medium">
                      Estimated steps
                      <input
                        className="min-h-10 rounded-md border border-[color:var(--line)] bg-[color:var(--panel)] px-2"
                        name="estimatedSteps"
                        defaultValue={draft.estimatedSteps ?? ""}
                      />
                    </label>
                  </div>
                  <DraftTextarea
                    name="sourceInspiration"
                    label="Source inspiration topic"
                    defaultValue={draft.sourceInspiration ?? ""}
                  />
                  <DraftTextarea name="notes" label="Review notes" defaultValue={draft.notes ?? ""} />
                  <div className="flex flex-wrap gap-2">
                    <SubmitButton variant="secondary">Save edits</SubmitButton>
                  </div>
                </form>
                <div className="mt-3 flex flex-wrap gap-2">
                  <form action={approveQuestionDraftAction}>
                    <input type="hidden" name="id" value={draft.id} />
                    <SubmitButton>Approve into practice</SubmitButton>
                  </form>
                  <form action={rejectQuestionDraftAction}>
                    <input type="hidden" name="id" value={draft.id} />
                    <SubmitButton variant="secondary">Reject</SubmitButton>
                  </form>
                </div>
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
                  <Badge>{source._count.chunks} chunks</Badge>
                </div>
                <p className="mt-2 font-medium">{source.filename}</p>
                <p className="text-[color:var(--muted)]">{source.path}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Card>
        <h2 className="mb-3 text-xl font-semibold">Recent AI activity</h2>
        <div className="grid gap-2">
          {aiInteractions.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[color:var(--line)] p-3 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge>{item.status}</Badge>
                <Badge>{item.purpose}</Badge>
                {item.user ? <Badge>{item.user.email}</Badge> : null}
              </div>
              <span className="text-xs text-[color:var(--muted)]">{item.fallbackReason ?? item.model ?? "logged"}</span>
            </div>
          ))}
          {!aiInteractions.length ? (
            <p className="text-sm text-[color:var(--muted)]">No AI calls logged yet.</p>
          ) : null}
        </div>
      </Card>
    </AppShell>
  );
}

function DraftTextarea({
  name,
  label,
  defaultValue,
}: Readonly<{ name: string; label: string; defaultValue: string }>) {
  return (
    <label className="grid gap-1 text-xs font-medium">
      {label}
      <textarea
        className="min-h-24 rounded-md border border-[color:var(--line)] bg-[color:var(--panel)] p-2"
        name={name}
        defaultValue={defaultValue}
      />
    </label>
  );
}
