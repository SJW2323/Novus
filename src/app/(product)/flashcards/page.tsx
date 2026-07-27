import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { FlashcardDeck } from "@/components/flashcard-deck";

export default async function FlashcardsPage() {
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

  const tier = subscription?.status === "active" ? subscription.tier : null;

  if (tier !== "silver" && tier !== "gold") {
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <h1 className="font-heading text-3xl font-semibold">Flashcards</h1>
        <p className="mt-3 text-muted-foreground">
          Available on the Silver and Gold plans — Novus turns what you
          covered in each session into revision flashcards automatically.
        </p>
        <Button className="mt-6" render={<Link href="/pricing" />}>
          View plans
        </Button>
      </div>
    );
  }

  let sessionFilter: string | null = null;
  if (tier === "silver") {
    const { data: latestSession } = await supabase
      .from("sessions")
      .select("id")
      .eq("student_id", user.id)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    sessionFilter = latestSession?.id ?? null;
  }

  let query = supabase
    .from("flashcards")
    .select("id, front, back, topic_name")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });

  if (sessionFilter) {
    query = query.eq("session_id", sessionFilter);
  }

  const { data: cards } = await query;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-heading text-3xl font-semibold">Flashcards</h1>
      <p className="mt-1 text-muted-foreground">
        {tier === "gold"
          ? "Generated from every session you have had with Novus."
          : "Generated from your most recent session. Upgrade to Gold for your full history."}
      </p>

      <div className="mt-10">
        {cards && cards.length > 0 ? (
          <FlashcardDeck
            cards={cards.map((c) => ({
              id: c.id,
              front: c.front,
              back: c.back,
              topicName: c.topic_name,
            }))}
          />
        ) : (
          <Card className="border-border/70 p-8 text-center text-sm text-muted-foreground">
            No flashcards yet — they show up here after your next session with
            Novus.
          </Card>
        )}
      </div>
    </div>
  );
}
