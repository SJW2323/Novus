import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Called once, right after a new signup gets a session (from /auth/callback
// or the immediate-session branch of the signup form). Resolves the ref
// code stashed in signUp's user metadata to an actual referrer and grants
// the new user's signup bonus. The referrer's own bonus is granted later,
// from the Stripe webhook, once the referred friend actually subscribes -
// that keeps the reward tied to a real signal instead of a free signup.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const refCode = (user.user_metadata?.ref_code as string | undefined)?.trim();
  if (!refCode || refCode.length < 4) {
    return NextResponse.json({ ok: true, claimed: false });
  }

  const admin = createAdminClient();

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("referred_by")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfile?.referred_by) {
    return NextResponse.json({ ok: true, claimed: false });
  }

  const { data: referrer } = await admin
    .from("profiles")
    .select("id")
    .eq("referral_code", refCode.toLowerCase())
    .neq("id", user.id)
    .maybeSingle();

  if (!referrer) {
    return NextResponse.json({ ok: true, claimed: false });
  }

  await admin
    .from("profiles")
    .update({ referred_by: referrer.id, bonus_sessions: 1 })
    .eq("id", user.id);

  return NextResponse.json({ ok: true, claimed: true });
}
