import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { id: studentId } = await params;
  const body = (await request.json()) as {
    tier?: "bronze" | "silver" | "gold" | null;
    status?: "active" | "canceled" | null;
    bonusSessionsDelta?: number;
    isAdmin?: boolean;
  };

  const VALID_TIERS = new Set(["bronze", "silver", "gold"]);
  const VALID_STATUSES = new Set(["active", "canceled"]);

  if (body.tier !== undefined && body.tier !== null && !VALID_TIERS.has(body.tier)) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }
  if (body.status !== undefined && body.status !== null && !VALID_STATUSES.has(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  if (body.bonusSessionsDelta !== undefined && !Number.isInteger(body.bonusSessionsDelta)) {
    return NextResponse.json({ error: "Invalid bonusSessionsDelta" }, { status: 400 });
  }
  if (body.isAdmin !== undefined && typeof body.isAdmin !== "boolean") {
    return NextResponse.json({ error: "Invalid isAdmin" }, { status: 400 });
  }

  const db = createAdminClient();

  if (body.tier !== undefined || body.status !== undefined) {
    const { data: existing } = await db
      .from("subscriptions")
      .select("student_id")
      .eq("student_id", studentId)
      .maybeSingle();

    if (existing) {
      await db
        .from("subscriptions")
        .update({
          ...(body.tier !== undefined ? { tier: body.tier } : {}),
          ...(body.status !== undefined ? { status: body.status } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq("student_id", studentId);
    } else {
      await db.from("subscriptions").insert({
        student_id: studentId,
        stripe_customer_id: "admin_grant",
        tier: body.tier ?? "bronze",
        status: body.status ?? "active",
      });
    }
  }

  if (body.bonusSessionsDelta) {
    const { data: profile } = await db
      .from("profiles")
      .select("bonus_sessions")
      .eq("id", studentId)
      .single();
    await db
      .from("profiles")
      .update({
        bonus_sessions: Math.max(0, (profile?.bonus_sessions ?? 0) + body.bonusSessionsDelta),
      })
      .eq("id", studentId);
  }

  if (body.isAdmin !== undefined) {
    await db.from("profiles").update({ is_admin: body.isAdmin }).eq("id", studentId);
  }

  return NextResponse.json({ ok: true });
}
