import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminCustomerForm } from "@/components/admin-customer-form";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const [{ data: profile }, { data: subscription }, { data: authUser }] = await Promise.all([
    admin
      .from("profiles")
      .select("full_name, exam_board, bonus_sessions, is_admin, trial_used, created_at")
      .eq("id", id)
      .maybeSingle(),
    admin
      .from("subscriptions")
      .select("tier, status, current_period_start, current_period_end")
      .eq("student_id", id)
      .maybeSingle(),
    admin.auth.admin.getUserById(id),
  ]);

  if (!profile) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-heading text-3xl font-semibold">
        {profile.full_name ?? "(no name)"}
      </h1>
      <p className="mt-1 text-muted-foreground">
        {authUser.user?.email} · {profile.exam_board ?? "—"} · trial{" "}
        {profile.trial_used ? "used" : "available"} · joined{" "}
        {new Date(profile.created_at).toLocaleDateString("en-GB")}
      </p>

      <div className="mt-8">
        <AdminCustomerForm
          studentId={id}
          currentTier={(subscription?.tier as "bronze" | "silver" | "gold" | null) ?? null}
          currentStatus={subscription?.status ?? null}
          currentBonus={profile.bonus_sessions}
          currentIsAdmin={profile.is_admin}
        />
      </div>
    </div>
  );
}
