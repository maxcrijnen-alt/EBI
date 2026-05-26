"use client";

import { useState } from "react";
import { Badge, Card } from "@/components/ui";

type CardItem = {
  id: string;
  category: string;
  front: string;
  back: string;
  example: string | null;
  trap: string | null;
  topic: { title: string } | null;
};

const ratings = ["AGAIN", "HARD", "GOOD", "EASY"] as const;

export function FlashcardReviewer({ cards }: Readonly<{ cards: CardItem[] }>) {
  const [index, setIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [done, setDone] = useState(0);

  const card = cards[index];

  async function rate(rating: (typeof ratings)[number]) {
    if (!card) return;
    await fetch("/api/flashcards/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flashcardId: card.id, rating }),
    });
    setDone((value) => value + 1);
    setShowBack(false);
    setIndex((value) => value + 1);
  }

  if (!card) {
    return (
      <Card>
        <h2 className="text-xl font-semibold">Flashcard sprint complete</h2>
        <p className="mt-2 text-sm text-[color:var(--muted)]">Reviewed {done} cards in this session.</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="grid gap-5">
        <div className="flex flex-wrap gap-2">
          <Badge>{card.category}</Badge>
          {card.topic ? <Badge>{card.topic.title}</Badge> : null}
          <Badge>
            {index + 1}/{cards.length}
          </Badge>
        </div>
        <div className="min-h-48 rounded-lg border border-[color:var(--line)] p-5">
          <p className="text-lg font-semibold leading-8">{card.front}</p>
          {showBack ? (
            <div className="mt-5 grid gap-3 text-sm leading-7">
              <p>{card.back}</p>
              {card.example ? <p>Example: {card.example}</p> : null}
              {card.trap ? <p className="text-[color:var(--warning)]">Trap: {card.trap}</p> : null}
            </div>
          ) : null}
        </div>
        {showBack ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ratings.map((rating) => (
              <button
                key={rating}
                className="rounded-md border border-[color:var(--line)] px-4 py-3 text-sm font-semibold hover:border-[color:var(--accent)]"
                onClick={() => rate(rating)}
              >
                {rating[0] + rating.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        ) : (
          <button
            className="w-fit rounded-md bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white"
            onClick={() => setShowBack(true)}
          >
            Show answer
          </button>
        )}
      </div>
    </Card>
  );
}
