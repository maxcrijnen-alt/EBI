import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const reviewSchema = z.object({
  flashcardId: z.string(),
  rating: z.enum(["AGAIN", "HARD", "GOOD", "EASY"]),
});

function nextInterval(rating: string, current: number) {
  if (rating === "AGAIN") return 0;
  if (rating === "HARD") return Math.max(1, Math.ceil(current * 1.2));
  if (rating === "GOOD") return Math.max(2, Math.ceil(current * 2.2));
  return Math.max(4, Math.ceil(current * 3.5));
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = reviewSchema.parse(await request.json());
  const card = await prisma.flashcard.findFirst({
    where: {
      id: parsed.flashcardId,
      OR: [{ userId: user.id }, { userId: null }],
    },
  });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const intervalDays = nextInterval(parsed.rating, card.intervalDays || 1);
  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + intervalDays);

  await prisma.flashcardReview.create({
    data: {
      userId: user.id,
      flashcardId: card.id,
      rating: parsed.rating,
      nextDueAt: dueAt,
    },
  });

  await prisma.flashcard.update({
    where: { id: card.id },
    data: {
      intervalDays,
      dueAt,
      easeFactor:
        parsed.rating === "EASY"
          ? card.easeFactor + 0.2
          : parsed.rating === "AGAIN"
            ? Math.max(1.3, card.easeFactor - 0.25)
            : card.easeFactor,
    },
  });

  return NextResponse.json({ ok: true, nextDueAt: dueAt });
}
