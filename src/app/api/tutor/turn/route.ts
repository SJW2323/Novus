import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildSystemPromptForStudent } from "@/lib/tutor-context";
import { getTutorReply } from "@/lib/claude";

// Sessions aren't otherwise time-boxed once started (only the free trial has
// a clock), so this is what stops a single session from becoming an
// unbounded number of paid Claude API calls if a script hammers this route
// directly instead of going through the actual call UI.
const MAX_TURNS_PER_SESSION = 60;

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

  const { count: turnCount } = await supabase
    .from("session_messages")
    .select("id", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .eq("role", "student");

  if ((turnCount ?? 0) >= MAX_TURNS_PER_SESSION) {
    return NextResponse.json(
      { error: "This session has reached its length limit. Start a new session to keep going." },
      { status: 429 },
    );
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
