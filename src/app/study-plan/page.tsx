import { createStudyPlanAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, SubmitButton } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function StudyPlanPage() {
  const user = await requireUser();
  const plans = await prisma.studyPlan.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <AppShell user={user}>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2">
          <h1 className="text-3xl font-semibold">Study plan</h1>
          <p className="text-[color:var(--muted)]">
            Plans update from your goal, diagnostic score, weak topics, mistake notebook, and readiness score.
          </p>
        </div>
        <form action={createStudyPlanAction}>
          <SubmitButton>Generate updated plan</SubmitButton>
        </form>
      </section>

      <section className="grid gap-4">
        {plans.map((plan) => {
          const parsed = JSON.parse(plan.planJson) as {
            recommendedRoute?: string[];
            weeklyLoop?: string[];
            blocks?: Array<{ name: string; tasks: string[] }>;
          };

          return (
            <Card key={plan.id}>
              <div className="grid gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-xl font-semibold">{plan.title}</h2>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{plan.goal}</Badge>
                    <Badge>{plan.timeBudget}</Badge>
                    <Badge>{plan.status}</Badge>
                  </div>
                </div>
                {parsed.recommendedRoute ? (
                  <div className="grid gap-2">
                    <h3 className="font-semibold">Recommended route</h3>
                    {parsed.recommendedRoute.map((item) => (
                      <p key={item} className="rounded-md border border-[color:var(--line)] p-3 text-sm text-[color:var(--muted)]">
                        {item}
                      </p>
                    ))}
                  </div>
                ) : null}
                {parsed.weeklyLoop ? (
                  <div className="grid gap-2">
                    <h3 className="font-semibold">Daily loop</h3>
                    <div className="flex flex-wrap gap-2">
                      {parsed.weeklyLoop.map((item) => (
                        <Badge key={item}>{item}</Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
                {parsed.blocks ? (
                  <div className="grid gap-3">
                    {parsed.blocks.map((block) => (
                      <section key={block.name} className="grid gap-2">
                        <h3 className="font-semibold">{block.name}</h3>
                        {block.tasks.map((item) => (
                          <p key={item} className="rounded-md border border-[color:var(--line)] p-3 text-sm text-[color:var(--muted)]">
                            {item}
                          </p>
                        ))}
                      </section>
                    ))}
                  </div>
                ) : null}
              </div>
            </Card>
          );
        })}
        {!plans.length ? (
          <Card>
            <p className="text-sm text-[color:var(--muted)]">No plan yet. Generate one after onboarding or from this page.</p>
          </Card>
        ) : null}
      </section>
    </AppShell>
  );
}
