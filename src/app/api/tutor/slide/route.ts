import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateTutorSlide } from "@/lib/claude";

export async function POST(request: Request) {
  const { sessionId, studentUtterance, tutorReply } = (await request.json()) as {
    sessionId?: string;
    studentUtterance?: string;
    tutorReply?: string;
  };

  if (!sessionId || !tutorReply?.trim()) {
    return NextResponse.json({ error: "Missing sessionId or tutorReply" }, { status: 400 });
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
    .select("id, student_id")
    .eq("id", sessionId)
    .single();

  if (!session || session.student_id !== user.id) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const slide = await generateTutorSlide({
    studentUtterance: studentUtterance ?? "",
    tutorReply,
  });

  if (!slide) {
    return NextResponse.json({ error: "Failed to generate slide" }, { status: 502 });
  }

  return NextResponse.json({ slide });
}
