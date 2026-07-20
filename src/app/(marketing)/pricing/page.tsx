import { createClient } from "@/lib/supabase/server";
import { PricingCards } from "@/components/pricing-cards";
import type { Tier } from "@/lib/stripe";

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentTier: Tier | null = null;
  if (user) {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("tier, status")
      .eq("student_id", user.id)
      .maybeSingle();
    if (subscription?.status === "active") {
      currentTier = subscription.tier as Tier;
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <div className="max-w-2xl">
        <h1 className="font-heading text-4xl font-semibold text-balance">
          Pick a plan, start talking to Novus.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground text-pretty">
          All plans include the same tutor — the only difference is how often
          you can talk to them each week. Cancel any time.
        </p>
      </div>

      <div className="mt-12">
        <PricingCards isLoggedIn={!!user} currentTier={currentTier} />
      </div>
    </div>
  );
}
