import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { extractTopicName } from "@/lib/utils";
import { TIERS, type Tier } from "@/lib/stripe";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: mastery }, { data: sessions }, { data: subscription }] =
    await Promise.all([
      supabase.from("profiles").select("full_name, exam_board").eq("id", user.id).single(),
      supabase
        .from("student_topic_mastery")
        .select("mastery_level, times_covered, last_reviewed_at, syllabus_topics(topic_name)")
        .eq("student_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(8),
      supabase
        .from("sessions")
        .select("id, status, started_at, ended_at")
        .eq("student_id", user.id)
        .order("started_at", { ascending: false })
        .limit(5),
      supabase
        .from("subscriptions")
        .select("tier, status, current_period_start")
        .eq("student_id", user.id)
        .maybeSingle(),
    ]);

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  const isActive = subscription?.status === "active" && subscription.tier;
  const tierConfig = isActive ? TIERS[subscription!.tier as Tier] : null;

  let sessionsThisPeriod = 0;
  if (isActive && subscription!.current_period_start) {
    const { count } = await supabase
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("student_id", user.id)
      .gte("started_at", subscription!.current_period_start);
    sessionsThisPeriod = count ?? 0;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold">
            Hi {firstName}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {profile?.exam_board ?? "AQA"} Biology · ready when you are.
          </p>
        </div>
        <Button size="lg" render={<Link href="/tutor" />}>
          Start a session
        </Button>
      </div>

      {isActive && tierConfig ? (
        <p className="mt-6 text-sm text-muted-foreground">
          {tierConfig.label} plan ·{" "}
          {tierConfig.sessionsPerWeek === null
            ? "unlimited sessions this week"
            : `${sessionsThisPeriod} of ${tierConfig.sessionsPerWeek} session${tierConfig.sessionsPerWeek === 1 ? "" : "s"} used this week`}
        </p>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">
          You don&apos;t have an active plan yet —{" "}
          <Link href="/pricing" className="font-medium text-foreground underline">
            choose one
          </Link>{" "}
          to start a session.
        </p>
      )}

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <Card className="border-border/70 p-6">
          <h2 className="font-heading text-lg font-semibold">
            Topic mastery
          </h2>
          {mastery && mastery.length > 0 ? (
            <ul className="mt-4 space-y-4">
              {mastery.map((row, i) => {
                const topicName = extractTopicName(row.syllabus_topics);
                const level = Math.round((row.mastery_level ?? 0) * 100);
                return (
                  <li key={i}>
                    <div className="flex items-center justify-between text-sm">
                      <span>{topicName}</span>
                      <span className="text-muted-foreground">{level}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${level}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No topics tracked yet — they&apos;ll show up here after your
              first session.
            </p>
          )}
        </Card>

        <Card className="border-border/70 p-6">
          <h2 className="font-heading text-lg font-semibold">
            Recent sessions
          </h2>
          {sessions && sessions.length > 0 ? (
            <ul className="mt-4 space-y-3 text-sm">
              {sessions.map((session) => (
                <li
                  key={session.id}
                  className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0"
                >
                  <span>
                    {new Date(session.started_at).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "short", year: "numeric" },
                    )}
                  </span>
                  <span className="text-muted-foreground capitalize">
                    {session.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              You haven&apos;t had a session yet. Your first one is a click away.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
