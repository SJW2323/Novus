import type { SupabaseClient } from "@supabase/supabase-js";
import { buildTutorSystemPrompt } from "@/lib/claude";
import { extractTopicName } from "@/lib/utils";

export async function buildSystemPromptForStudent(
  supabase: SupabaseClient,
  studentId: string,
): Promise<string> {
  const [{ data: profile }, { data: learningProfile }, { data: masteryRows }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, exam_board")
        .eq("id", studentId)
        .single(),
      supabase
        .from("learning_profile")
        .select("style_notes, pacing_notes, engagement_notes, raw_summary")
        .eq("student_id", studentId)
        .maybeSingle(),
      supabase
        .from("student_topic_mastery")
        .select("mastery_level, syllabus_topics(topic_name)")
        .eq("student_id", studentId),
    ]);

  return buildTutorSystemPrompt({
    studentName: profile?.full_name?.split(" ")[0] ?? "there",
    examBoard: profile?.exam_board ?? "AQA",
    learningProfile: learningProfile
      ? {
          styleNotes: (learningProfile.style_notes as Record<string, unknown>) ?? {},
          pacingNotes: learningProfile.pacing_notes,
          engagementNotes: learningProfile.engagement_notes,
          rawSummary: learningProfile.raw_summary,
        }
      : null,
    masteryRows: (masteryRows ?? []).map((row) => ({
      topicName: extractTopicName(row.syllabus_topics),
      masteryLevel: row.mastery_level ?? 0,
    })),
  });
}
