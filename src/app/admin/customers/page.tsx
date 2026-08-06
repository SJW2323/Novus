import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/card";

export default async function AdminCustomersPage() {
  const admin = createAdminClient();

  const [{ data: profiles }, { data: subscriptions }] = await Promise.all([
    admin
      .from("profiles")
      .select("id, full_name, exam_board, bonus_sessions, is_admin, created_at")
      .order("created_at", { ascending: false }),
    admin.from("subscriptions").select("student_id, tier, status"),
  ]);

  const subByStudent = new Map((subscriptions ?? []).map((s) => [s.student_id, s]));

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-heading text-3xl font-semibold">Customers</h1>
      <p className="mt-1 text-muted-foreground">
        {(profiles ?? []).length} student{(profiles ?? []).length === 1 ? "" : "s"}
      </p>

      <Card className="mt-8 overflow-hidden border-border/70 p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-border/70 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Exam board</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Bonus</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map((p) => {
              const sub = subByStudent.get(p.id);
              return (
                <tr key={p.id} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-3">
                    {p.full_name ?? "(no name)"}
                    {p.is_admin && (
                      <span className="ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                        admin
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.exam_board ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">
                    {sub?.status === "active" ? sub.tier : "none"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.bonus_sessions}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/customers/${p.id}`}
                      className="font-medium text-foreground underline underline-offset-4"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
