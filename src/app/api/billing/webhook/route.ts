import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe, tierFromPriceId } from "@/lib/stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err instanceof Error ? err.message : "unknown"}` },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  async function syncSubscription(subscription: Stripe.Subscription) {
    const studentId = subscription.metadata?.studentId;
    if (!studentId) return;

    const priceId = subscription.items.data[0]?.price.id;
    const tier = priceId ? tierFromPriceId(priceId) : null;
    const item = subscription.items.data[0];

    await admin.from("subscriptions").upsert(
      {
        student_id: studentId,
        stripe_customer_id: subscription.customer as string,
        stripe_subscription_id: subscription.id,
        tier,
        status: subscription.status,
        current_period_start: item
          ? new Date(item.current_period_start * 1000).toISOString()
          : null,
        current_period_end: item
          ? new Date(item.current_period_end * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "student_id" },
    );
  }

  // Rewards the referrer with a bonus session the first time their
  // referred friend actually subscribes - tied to a checkout completing
  // (not just signing up) so the reward can't be farmed with fake accounts.
  async function rewardReferrerIfNeeded(studentId: string) {
    const { data: profile } = await admin
      .from("profiles")
      .select("referred_by, referral_reward_granted")
      .eq("id", studentId)
      .maybeSingle();

    if (!profile?.referred_by || profile.referral_reward_granted) return;

    const { data: referrer } = await admin
      .from("profiles")
      .select("bonus_sessions")
      .eq("id", profile.referred_by)
      .maybeSingle();

    if (!referrer) return;

    await admin
      .from("profiles")
      .update({ bonus_sessions: referrer.bonus_sessions + 1 })
      .eq("id", profile.referred_by);

    await admin
      .from("profiles")
      .update({ referral_reward_granted: true })
      .eq("id", studentId);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );
        await syncSubscription(subscription);
        const studentId = subscription.metadata?.studentId;
        if (studentId) await rewardReferrerIfNeeded(studentId);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.created": {
      await syncSubscription(event.data.object as Stripe.Subscription);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const studentId = subscription.metadata?.studentId;
      if (studentId) {
        await admin
          .from("subscriptions")
          .update({ status: "canceled", updated_at: new Date().toISOString() })
          .eq("student_id", studentId);
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
