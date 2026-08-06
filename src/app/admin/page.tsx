import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/card";

export default async function AdminOverviewPage() {
  const admin = createAdminClient();

  const [{ count: studentCount }, { data: subscriptions }, { data: recentProfiles }] =
    await Promise.all([
      admin.from("profiles").select("id", { count: "exact", head: true }),
      admin.from("subscriptions").select("tier, status"),
      admin
        .from("profiles")
        .select("id, full_name, exam_board, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

  const active = (subscriptions ?? []).filter((s) => s.status === "active");
  const byTier = { bronze: 0, silver: 0, gold: 0 } as Record<string, number>;
  for (const s of active) {
    if (s.tier && s.tier in byTier) byTier[s.tier]++;
  }

  const stats = [
    { label: "Total students", value: studentCount ?? 0 },
    { label: "Active subscriptions", value: active.length },
    { label: "Bronze", value: byTier.bronze },
    { label: "Silver", value: byTier.silver },
    { label: "Gold", value: byTier.gold },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-heading text-3xl font-semibold">Overview</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/70 p-5">
            <p className="text-2xl font-semibold">{stat.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-8 border-border/70 p-6">
        <h2 className="font-heading text-lg font-semibold">Recent signups</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {(recentProfiles ?? []).map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0"
            >
              <span>{p.full_name ?? "(no name)"}</span>
              <span className="text-muted-foreground">
                {p.exam_board ?? "—"} ·{" "}
                {new Date(p.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
