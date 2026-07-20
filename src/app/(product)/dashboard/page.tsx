import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { extractTopicName } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: mastery }, { data: sessions }] =
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
    ]);

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

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
