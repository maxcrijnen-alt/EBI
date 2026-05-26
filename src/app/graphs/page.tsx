import { AppShell } from "@/components/app-shell";
import { GraphPractice } from "@/components/graph-practice";
import { Card } from "@/components/ui";
import { requireUser } from "@/lib/auth";

export default async function GraphsPage() {
  const user = await requireUser();

  return (
    <AppShell user={user}>
      <section className="grid gap-2">
        <h1 className="text-3xl font-semibold">Graph practice</h1>
        <p className="text-[color:var(--muted)]">
          Practice equilibrium, tax wedges, buyer and seller prices, tax revenue, and deadweight loss.
        </p>
      </section>
      <Card>
        <p className="text-sm text-[color:var(--muted)]">
          This version implements the core demand/supply/tax interaction. The same component structure can extend to monopoly welfare,
          AC/MC/isoprofit curves, Bertrand best responses, and network effects thresholds.
        </p>
      </Card>
      <GraphPractice />
    </AppShell>
  );
}
