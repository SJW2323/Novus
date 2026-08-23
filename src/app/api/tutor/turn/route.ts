import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildSystemPromptForStudent } from "@/lib/tutor-context";
import { streamTutorReply } from "@/lib/claude";

// Sessions aren't otherwise time-boxed once started (only the free trial has
// a clock), so this is what stops a single session from becoming an
// unbounded number of paid Claude API calls if a script hammers this route
// directly instead of going through the actual call UI.
const MAX_TURNS_PER_SESSION = 60;

// How much conversation history actually gets sent to Claude each turn. A
// call approaching the turn cap above would otherwise send a growing
// transcript on every single message, adding latency (and cost) turn over
// turn. Long-term memory across sessions already lives in learning_profile;
// within one call, the last few exchanges are what the model needs to stay
// coherent.
const MAX_HISTORY_MESSAGES = 30;

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
    .select("id, student_id, status, system_prompt")
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

  const allMessages = priorMessages ?? [];
  const studentTurns = allMessages.filter((m) => m.role === "student").length;

  if (studentTurns >= MAX_TURNS_PER_SESSION) {
    return NextResponse.json(
      { error: "This session has reached its length limit. Start a new session to keep going." },
      { status: 429 },
    );
  }

  const history = allMessages.slice(-MAX_HISTORY_MESSAGES).map((m) => ({
    role: m.role === "student" ? ("user" as const) : ("assistant" as const),
    content: m.content,
  }));
  history.push({ role: "user", content: studentUtterance });

  // Sessions created before this was cached on the row (or if it somehow
  // wasn't set) fall back to recomputing it, rather than failing the call.
  const systemPrompt = session.system_prompt ?? (await buildSystemPromptForStudent(supabase, user.id));

  const admin = createAdminClient();
  const claudeStream = streamTutorReply({ systemPrompt, history });

  const encoder = new TextEncoder();
  let fullReply = "";

  const stream = new ReadableStream({
    async start(controller) {
      claudeStream.on("text", (delta) => {
        fullReply += delta;
        controller.enqueue(encoder.encode(delta));
      });

      try {
        await claudeStream.done();
      } catch (err) {
        console.error("[tutor/turn] Claude stream error:", err);
      }

      if (fullReply) {
        await admin.from("session_messages").insert([
          { session_id: sessionId, role: "student", content: studentUtterance },
          { session_id: sessionId, role: "tutor", content: fullReply },
        ]);
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
