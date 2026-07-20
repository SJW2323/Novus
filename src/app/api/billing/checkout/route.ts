import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe, TIERS, type Tier } from "@/lib/stripe";

export async function POST(request: Request) {
  const { tier } = (await request.json()) as { tier?: Tier };

  if (!tier || !TIERS[tier]) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("student_id", user.id)
    .maybeSingle();

  let customerId = existing?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { studentId: user.id },
    });
    customerId = customer.id;

    await admin.from("subscriptions").upsert(
      { student_id: user.id, stripe_customer_id: customerId },
      { onConflict: "student_id" },
    );
  }

  const origin = new URL(request.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: TIERS[tier].priceId, quantity: 1 }],
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/pricing?checkout=cancelled`,
    metadata: { studentId: user.id, tier },
    subscription_data: { metadata: { studentId: user.id, tier } },
  });

  return NextResponse.json({ url: session.url });
}
