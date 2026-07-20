import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildSystemPromptForStudent } from "@/lib/tutor-context";
import { createAnamSessionToken } from "@/lib/anam";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const systemPrompt = await buildSystemPromptForStudent(supabase, user.id);

  const admin = createAdminClient();
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
