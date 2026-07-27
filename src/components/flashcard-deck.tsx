"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FlashcardData {
  id: string;
  front: string;
  back: string;
  topicName: string | null;
}

export function FlashcardDeck({ cards }: { cards: FlashcardData[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = cards[index];

  function go(delta: number) {
    setFlipped(false);
    setIndex((i) => Math.max(0, Math.min(cards.length - 1, i + delta)));
  }

  return (
    <div className="mx-auto max-w-lg">
      <p className="mb-3 text-center text-sm text-muted-foreground">
        Card {index + 1} of {cards.length}
        {card.topicName ? ` · ${card.topicName}` : ""}
      </p>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className={cn(
          "glow-card flex min-h-56 w-full items-center justify-center rounded-2xl border border-border/70 bg-card p-8 text-center text-lg font-medium transition-colors",
        )}
      >
        {flipped ? card.back : card.front}
      </button>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        {flipped ? "Tap to see the question" : "Tap to reveal the answer"}
      </p>

      <div className="mt-6 flex items-center justify-center gap-4">
        <Button variant="outline" onClick={() => go(-1)} disabled={index === 0}>
          Previous
        </Button>
        <Button onClick={() => go(1)} disabled={index === cards.length - 1}>
          Next
        </Button>
      </div>
    </div>
  );
}
