import { createClient } from "@/lib/supabase/server";

// Shared guard for every /admin page and /api/admin/* route. Returns the
// authenticated admin user, or null if the caller isn't signed in or isn't
// an admin - callers redirect/403 accordingly. Always re-checks is_admin
// server-side against the DB rather than trusting anything client-supplied.
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, full_name")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return null;

  return { id: user.id, email: user.email, fullName: profile.full_name };
}
