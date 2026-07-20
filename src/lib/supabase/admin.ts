import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client for server-only orchestration routes (session start/turn/end,
// summarization writes). Bypasses RLS — never import this from client components.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
