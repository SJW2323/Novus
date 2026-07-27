"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
