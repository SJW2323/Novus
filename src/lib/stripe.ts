import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export type Tier = "bronze" | "silver" | "gold";

export const TIERS: Record<
  Tier,
  { label: string; priceId: string; weeklyPrice: number; sessionsPerWeek: number | null }
> = {
  bronze: {
    label: "Bronze",
    priceId: process.env.STRIPE_PRICE_BRONZE!,
    weeklyPrice: 20,
    sessionsPerWeek: 1,
  },
  silver: {
    label: "Silver",
    priceId: process.env.STRIPE_PRICE_SILVER!,
    weeklyPrice: 40,
    sessionsPerWeek: 3,
  },
  gold: {
    label: "Gold",
    priceId: process.env.STRIPE_PRICE_GOLD!,
    weeklyPrice: 60,
    sessionsPerWeek: null,
  },
};

export function tierFromPriceId(priceId: string): Tier | null {
  const entry = (Object.entries(TIERS) as [Tier, (typeof TIERS)[Tier]][]).find(
    ([, config]) => config.priceId === priceId,
  );
  return entry ? entry[0] : null;
}
