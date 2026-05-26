import { AppShell } from "@/components/app-shell";
import { PanicPlanner } from "@/components/panic-planner";
import { Card } from "@/components/ui";
import { requireUser } from "@/lib/auth";

export default async function PanicPage() {
  const user = await requireUser();

  return (
    <AppShell user={user}>
      <section className="grid gap-2">
        <h1 className="text-3xl font-semibold">Panic mode</h1>
        <p className="text-[color:var(--muted)]">
          A focused last-minute plan based on time available, goal, weak topics, formulas, traps, mistakes, and open-ended structure.
        </p>
      </section>
      <Card>
        <p className="text-sm text-[color:var(--muted)]">
          Panic mode does not force a timer. It turns remaining time into a high-yield sequence of formula review,
          mistake repair, flashcard sprint, mini mock sets, and step-by-step open-ended practice.
        </p>
      </Card>
      <PanicPlanner />
    </AppShell>
  );
}
