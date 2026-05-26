import { AppShell } from "@/components/app-shell";
import { Badge, Card } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function FormulaPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ q?: string }> }>) {
  const user = await requireUser();
  const params = await searchParams;
  const query = params.q?.toLowerCase() ?? "";
  const formulas = await prisma.formulaEntry.findMany({
    include: { topic: true },
    orderBy: { title: "asc" },
  });
  const filtered = query
    ? formulas.filter((formula) =>
        [formula.title, formula.formula, formula.meaning, formula.whenToUse, formula.trap, formula.topic?.title]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
    : formulas;

  return (
    <AppShell user={user}>
      <section className="grid gap-2">
        <h1 className="text-3xl font-semibold">Formula bank</h1>
        <p className="text-[color:var(--muted)]">
          Search formulas by meaning, topic, trap, variable, or question type.
        </p>
      </section>
      <Card>
        <form className="flex flex-wrap gap-2">
          <input
            className="min-h-11 min-w-64 flex-1 rounded-md border border-[color:var(--line)] bg-[color:var(--panel)] px-3"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search elasticity, MR, tax, Nash, Cournot..."
          />
          <button className="rounded-md bg-[color:var(--accent)] px-4 text-sm font-semibold text-white">
            Search
          </button>
        </form>
      </Card>
      <section className="grid gap-4 md:grid-cols-2">
        {filtered.map((formula) => (
          <Card key={formula.id}>
            <div className="grid gap-3">
              <div className="flex flex-wrap gap-2">
                {formula.topic ? <Badge>{formula.topic.title}</Badge> : null}
                <Badge>{formula.relatedTypes}</Badge>
              </div>
              <h2 className="text-xl font-semibold">{formula.title}</h2>
              <p className="rounded-md bg-black/[.04] p-3 font-mono text-sm dark:bg-white/[.06]">{formula.formula}</p>
              <p className="text-sm leading-6">{formula.meaning}</p>
              <div className="grid gap-2 text-sm text-[color:var(--muted)]">
                <p><strong>When to use:</strong> {formula.whenToUse}</p>
                <p><strong>Variables:</strong> {formula.variables}</p>
                <p><strong>Example:</strong> {formula.example}</p>
                <p className="text-[color:var(--warning)]"><strong>Trap:</strong> {formula.trap}</p>
              </div>
            </div>
          </Card>
        ))}
      </section>
    </AppShell>
  );
}
