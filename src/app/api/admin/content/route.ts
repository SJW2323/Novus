import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { CONTENT_FIELDS, THEME_FIELDS } from "@/lib/site-content";

const VALID_KEYS = new Set([
  ...CONTENT_FIELDS.map((f) => f.key),
  ...THEME_FIELDS.map((f) => f.key),
]);

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { key, value } = (await request.json()) as { key?: string; value?: string };

  if (!key || !VALID_KEYS.has(key as never) || typeof value !== "string") {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  const db = createAdminClient();
  await db
    .from("site_content")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

  return NextResponse.json({ ok: true });
}
