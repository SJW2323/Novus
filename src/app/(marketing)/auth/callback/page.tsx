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
    let settled = false;

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && !settled) {
        settled = true;
        router.replace(next);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session && !settled) {
        settled = true;
        router.replace(next);
      }
    });

    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        router.replace("/login?error=confirmation_failed");
      }
    }, 5000);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router, searchParams]);

  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center text-muted-foreground">
      Confirming…
    </div>
  );
}
