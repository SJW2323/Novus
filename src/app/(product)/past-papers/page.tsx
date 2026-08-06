import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { PastPaperView, type PastPaperSummary } from "@/components/past-paper-view";

export default async function PastPapersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("tier, status")
    .eq("student_id", user.id)
    .maybeSingle();

  const isGold = subscription?.status === "active" && subscription.tier === "gold";

  if (!isGold) {
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <h1 className="font-heading text-3xl font-semibold">Past papers</h1>
        <p className="mt-3 text-muted-foreground">
          Available on the Gold plan — Novus writes exam-style past papers
          tailored to your weak topics, with model answers, on demand.
        </p>
        <Button className="mt-6" render={<Link href="/pricing" />}>
          View plans
        </Button>
      </div>
    );
  }

  const { data: papers } = await supabase
    .from("past_papers")
    .select("id, exam_board, questions, created_at")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });

  const summaries: PastPaperSummary[] = (papers ?? []).map((p) => ({
    id: p.id,
    examBoard: p.exam_board,
    createdAt: p.created_at,
    questions: p.questions,
  }));

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-heading text-3xl font-semibold">Past papers</h1>
      <p className="mt-1 text-muted-foreground">
        Tailored to your weak topics, generated on demand.
      </p>

      <div className="mt-8">
        <PastPaperView papers={summaries} />
      </div>
    </div>
  );
}
