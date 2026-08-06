import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generatePastPaper } from "@/lib/claude";
import { extractTopicName } from "@/lib/utils";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const [{ data: subscription }, { data: profile }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("tier, status")
      .eq("student_id", user.id)
      .maybeSingle(),
    supabase.from("profiles").select("exam_board").eq("id", user.id).single(),
  ]);

  if (subscription?.tier !== "gold" || subscription.status !== "active") {
    return NextResponse.json(
      { error: "Tailored past papers are a Gold plan feature.", code: "NOT_GOLD" },
      { status: 402 },
    );
  }

  const examBoard = profile?.exam_board ?? "AQA";

  const { data: masteryRows } = await supabase
    .from("student_topic_mastery")
    .select("mastery_level, syllabus_topics(topic_name)")
    .eq("student_id", user.id);

  const weakTopics = (masteryRows ?? [])
    .filter((r) => (r.mastery_level ?? 0) < 0.6)
    .map((r) => extractTopicName(r.syllabus_topics));
  const strongTopics = (masteryRows ?? [])
    .filter((r) => (r.mastery_level ?? 0) >= 0.8)
    .map((r) => extractTopicName(r.syllabus_topics));

  const questions = await generatePastPaper({ examBoard, weakTopics, strongTopics });

  if (questions.length === 0) {
    return NextResponse.json({ error: "Failed to generate a paper" }, { status: 502 });
  }

  const admin = createAdminClient();
  const { data: paper, error } = await admin
    .from("past_papers")
    .insert({ student_id: user.id, exam_board: examBoard, questions })
    .select("id, exam_board, questions, created_at")
    .single();

  if (error || !paper) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to save paper" },
      { status: 500 },
    );
  }

  return NextResponse.json({ paper });
}
