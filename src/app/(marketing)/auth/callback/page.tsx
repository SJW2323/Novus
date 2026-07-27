"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Confirmation only ever establishes a session here - the signup form's
// direct profile insert never runs when email confirmation is required,
// since signUp() returns no session pre-confirmation. Bootstrap the row
// here instead, from the metadata signUp stashed on the user.
async function ensureProfileExists(supabase: ReturnType<typeof createClient>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return;

  await supabase.from("profiles").insert({
    id: user.id,
    full_name: user.user_metadata?.full_name ?? null,
    exam_board: user.user_metadata?.exam_board ?? "AQA",
    referral_code: user.id.slice(0, 8),
  });
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallbackHandler />
    </Suspense>
  );
}

function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const next = searchParams.get("next") ?? "/dashboard";
    const supabase = createClient();

    async function run() {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const code = searchParams.get("code");

      let ok = false;

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        ok = !error;
      } else if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        ok = !error;
      } else {
        const { data } = await supabase.auth.getSession();
        ok = !!data.session;
      }

      if (ok) {
        await ensureProfileExists(supabase);
        await fetch("/api/referral/claim", { method: "POST" }).catch(() => {});
      }

      router.replace(ok ? next : "/login?error=confirmation_failed");
    }

    run();
  }, [router, searchParams]);

  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center text-muted-foreground">
      Confirming…
    </div>
  );
}
