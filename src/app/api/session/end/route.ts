import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { summarizeSession, generateFlashcards, type LearningProfile } from "@/lib/claude";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export async function POST(request: Request) {
  const { sessionId } = (await request.json()) as { sessionId?: string };

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
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

  const admin = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("exam_board")
    .eq("id", user.id)
    .single();

  const [{ data: messages }, { data: existingProfile }, { data: topics }, { data: subscription }] =
    await Promise.all([
      supabase
        .from("session_messages")
        .select("role, content")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true }),
      supabase
        .from("learning_profile")
        .select("style_notes, pacing_notes, engagement_notes, raw_summary")
        .eq("student_id", user.id)
        .maybeSingle(),
      supabase
        .from("syllabus_topics")
        .select("id, topic_name")
        .eq("exam_board", profile?.exam_board ?? "AQA"),
      supabase
        .from("subscriptions")
        .select("tier")
        .eq("student_id", user.id)
        .maybeSingle(),
    ]);

  if (!messages || messages.length === 0) {
    await admin
      .from("sessions")
      .update({ status: "completed", ended_at: new Date().toISOString() })
      .eq("id", sessionId);
    return NextResponse.json({ ok: true, skipped: "empty session" });
  }

  const transcript = messages.map((m) => ({
    role: m.role === "student" ? ("user" as const) : ("assistant" as const),
    content: m.content,
  }));

  const existingLearningProfile: LearningProfile | null = existingProfile
    ? {
        styleNotes: (existingProfile.style_notes as Record<string, unknown>) ?? {},
        pacingNotes: existingProfile.pacing_notes,
        engagementNotes: existingProfile.engagement_notes,
        rawSummary: existingProfile.raw_summary,
      }
    : null;

  const summary = await summarizeSession({
    transcript,
    existingProfile: existingLearningProfile,
    knownTopics: (topics ?? []).map((t) => t.topic_name),
  });

  await admin.from("learning_profile").upsert(
    {
      student_id: user.id,
      style_notes: {
        ...(existingLearningProfile?.styleNotes ?? {}),
        ...summary.styleNotes,
      },
      pacing_notes: summary.pacingNotes || existingLearningProfile?.pacingNotes || null,
      engagement_notes:
        summary.engagementNotes || existingLearningProfile?.engagementNotes || null,
      raw_summary: summary.summary,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "student_id" },
  );

  for (const covered of summary.topicsCovered) {
    const topic = (topics ?? []).find(
      (t) => t.topic_name.toLowerCase() === covered.topicName.toLowerCase(),
    );
    if (!topic) continue;

    const { data: existingMastery } = await admin
      .from("student_topic_mastery")
      .select("mastery_level, confidence, times_covered")
      .eq("student_id", user.id)
      .eq("topic_id", topic.id)
      .maybeSingle();

    const newMastery = clamp(
      (existingMastery?.mastery_level ?? 0.4) + covered.masteryDelta,
      0,
      1,
    );
    const newConfidence = clamp((existingMastery?.confidence ?? 0.3) + 0.15, 0, 1);

    await admin.from("student_topic_mastery").upsert(
      {
        student_id: user.id,
        topic_id: topic.id,
        mastery_level: newMastery,
        confidence: newConfidence,
        times_covered: (existingMastery?.times_covered ?? 0) + 1,
        last_reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "student_id,topic_id" },
    );
  }

  if (subscription?.tier === "silver" || subscription?.tier === "gold") {
    const cards = await generateFlashcards({
      transcript,
      knownTopics: (topics ?? []).map((t) => t.topic_name),
    });

    if (cards.length > 0) {
      await admin.from("flashcards").insert(
        cards.map((card) => ({
          student_id: user.id,
          session_id: sessionId,
          topic_name: card.topicName,
          front: card.front,
          back: card.back,
        })),
      );
    }
  }

  await admin.from("session_summaries").insert({
    session_id: sessionId,
    summary: summary.summary,
    topics_covered: summary.topicsCovered,
    mastery_deltas: Object.fromEntries(
      summary.topicsCovered.map((t) => [t.topicName, t.masteryDelta]),
    ),
  });

  await admin
    .from("sessions")
    .update({ status: "completed", ended_at: new Date().toISOString() })
    .eq("id", sessionId);

  return NextResponse.json({ ok: true });
}
