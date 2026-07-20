"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Tier } from "@/lib/stripe";

const TIER_COPY: Record<
  Tier,
  { label: string; price: number; sessions: string; blurb: string; featured?: boolean }
> = {
  bronze: {
    label: "Bronze",
    price: 20,
    sessions: "1 session / week",
    blurb: "Try Novus out with a weekly check-in.",
  },
  silver: {
    label: "Silver",
    price: 40,
    sessions: "3 sessions / week",
    blurb: "Steady, regular tutoring through the term.",
    featured: true,
  },
  gold: {
    label: "Gold",
    price: 60,
    sessions: "Unlimited sessions",
    blurb: "As much time with Novus as you want.",
  },
};

export function PricingCards({
  isLoggedIn,
  currentTier,
}: {
  isLoggedIn: boolean;
  currentTier: Tier | null;
}) {
  const router = useRouter();
  const [loadingTier, setLoadingTier] = useState<Tier | null>(null);

  async function handleSelect(tier: Tier) {
    if (!isLoggedIn) {
      router.push("/signup");
      return;
    }

    setLoadingTier(tier);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoadingTier(null);
    }
  }

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {(Object.keys(TIER_COPY) as Tier[]).map((tier) => {
        const copy = TIER_COPY[tier];
        const isCurrent = currentTier === tier;
        return (
          <Card
            key={tier}
            className={cn(
              "flex flex-col border-border/70 p-6",
              copy.featured && "border-primary/60 ring-1 ring-primary/30",
            )}
          >
            <h2 className="font-heading text-xl font-semibold">{copy.label}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{copy.blurb}</p>
            <p className="mt-6 text-3xl font-semibold">
              £{copy.price}
              <span className="text-base font-normal text-muted-foreground">
                /week
              </span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{copy.sessions}</p>

            <Button
              size="lg"
              className="mt-8"
              variant={copy.featured ? "default" : "outline"}
              disabled={loadingTier !== null || isCurrent}
              onClick={() => handleSelect(tier)}
            >
              {isCurrent
                ? "Current plan"
                : loadingTier === tier
                  ? "Redirecting…"
                  : isLoggedIn
                    ? "Choose plan"
                    : "Sign up to subscribe"}
            </Button>
          </Card>
        );
      })}
    </div>
  );
}
