import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildSystemPromptForStudent } from "@/lib/tutor-context";
import { getTutorReply } from "@/lib/claude";

export async function POST(request: Request) {
  const { sessionId, studentUtterance } = (await request.json()) as {
    sessionId?: string;
    studentUtterance?: string;
  };

  if (!sessionId || !studentUtterance?.trim()) {
    return NextResponse.json({ error: "Missing sessionId or studentUtterance" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: session } = await supabase
    .from("sessions")
    .select("id, student_id, status")
    .eq("id", sessionId)
    .single();

  if (!session || session.student_id !== user.id) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const { data: priorMessages } = await supabase
    .from("session_messages")
    .select("role, content")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  const history = (priorMessages ?? []).map((m) => ({
    role: m.role === "student" ? ("user" as const) : ("assistant" as const),
    content: m.content,
  }));
  history.push({ role: "user", content: studentUtterance });

  const systemPrompt = await buildSystemPromptForStudent(supabase, user.id);
  const reply = await getTutorReply({ systemPrompt, history });

  const admin = createAdminClient();
  await admin.from("session_messages").insert([
    { session_id: sessionId, role: "student", content: studentUtterance },
    { session_id: sessionId, role: "tutor", content: reply },
  ]);

  return NextResponse.json({ reply });
}
