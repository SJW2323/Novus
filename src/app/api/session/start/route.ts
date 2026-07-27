import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildSystemPromptForStudent } from "@/lib/tutor-context";
import { createAnamSessionToken } from "@/lib/anam";
import { TIERS, type Tier } from "@/lib/stripe";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("bonus_sessions")
    .eq("id", user.id)
    .maybeSingle();

  let usingBonusSession = false;

  if (profile && profile.bonus_sessions > 0) {
    const { data: consumed } = await admin
      .from("profiles")
      .update({ bonus_sessions: profile.bonus_sessions - 1 })
      .eq("id", user.id)
      .eq("bonus_sessions", profile.bonus_sessions)
      .select("id")
      .maybeSingle();
    usingBonusSession = !!consumed;
  }

  if (!usingBonusSession) {
    const { data: subscription } = await admin
      .from("subscriptions")
      .select("tier, status, current_period_start")
      .eq("student_id", user.id)
      .maybeSingle();

    if (!subscription || subscription.status !== "active" || !subscription.tier) {
      return NextResponse.json(
        { error: "You need an active subscription to start a session.", code: "NO_SUBSCRIPTION" },
        { status: 402 },
      );
    }

    const tierConfig = TIERS[subscription.tier as Tier];

    if (tierConfig.sessionsPerWeek !== null && subscription.current_period_start) {
      const { count } = await admin
        .from("sessions")
        .select("id", { count: "exact", head: true })
        .eq("student_id", user.id)
        .gte("started_at", subscription.current_period_start);

      if ((count ?? 0) >= tierConfig.sessionsPerWeek) {
        return NextResponse.json(
          {
            error: `You've used all ${tierConfig.sessionsPerWeek} session${tierConfig.sessionsPerWeek === 1 ? "" : "s"} on your ${tierConfig.label} plan this week.`,
            code: "LIMIT_REACHED",
          },
          { status: 402 },
        );
      }
    }
  }

  const systemPrompt = await buildSystemPromptForStudent(supabase, user.id);

  const { data: session, error: sessionError } = await admin
    .from("sessions")
    .insert({ student_id: user.id, status: "active" })
    .select("id")
    .single();

  if (sessionError || !session) {
    return NextResponse.json(
      { error: sessionError?.message ?? "Failed to create session" },
      { status: 500 },
    );
  }

  try {
    const sessionToken = await createAnamSessionToken({ systemPrompt });
    return NextResponse.json({ sessionToken, sessionId: session.id });
  } catch (err) {
    await admin.from("sessions").update({ status: "error" }).eq("id", session.id);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to start Anam session" },
      { status: 502 },
    );
  }
}
