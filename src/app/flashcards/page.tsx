import { AppShell } from "@/components/app-shell";
import { FlashcardReviewer } from "@/components/flashcard-reviewer";
import { Badge, Card } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function FlashcardsPage() {
  const user = await requireUser();
  const cards = await prisma.flashcard.findMany({
    where: {
      OR: [{ userId: user.id }, { userId: null }],
      dueAt: { lte: new Date() },
    },
    include: { topic: true },
    orderBy: [{ sourceType: "desc" }, { dueAt: "asc" }],
    take: 30,
  });

  const allCount = await prisma.flashcard.count({
    where: { OR: [{ userId: user.id }, { userId: null }] },
  });
  const mistakeCards = await prisma.flashcard.count({
    where: { userId: user.id, sourceType: "MISTAKE_GENERATED" },
  });

  return (
    <AppShell user={user}>
      <section className="grid gap-2">
        <h1 className="text-3xl font-semibold">Flashcards</h1>
        <p className="text-[color:var(--muted)]">
          Spaced repetition for definitions, formulas, traps, procedures, concept comparisons, and your own mistakes.
        </p>
      </section>
      <div className="flex flex-wrap gap-2">
        <Badge>{cards.length} due now</Badge>
        <Badge>{allCount} total cards</Badge>
        <Badge>{mistakeCards} mistake-generated</Badge>
      </div>
      {cards.length ? (
        <FlashcardReviewer cards={cards} />
      ) : (
        <Card>
          <h2 className="text-xl font-semibold">No cards due</h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            New cards are created automatically when mistakes are saved.
          </p>
        </Card>
      )}
    </AppShell>
  );
}
