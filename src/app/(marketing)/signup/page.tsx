"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const EXAM_BOARDS = ["AQA", "OCR", "Edexcel", "WJEC"] as const;

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [examBoard, setExamBoard] =
    useState<(typeof EXAM_BOARDS)[number]>("AQA");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        data: {
          full_name: fullName,
          exam_board: examBoard,
          ...(refCode ? { ref_code: refCode } : {}),
        },
      },
    });

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    // If email confirmation is disabled on the Supabase project, signUp
    // returns an active session immediately and we can create the profile
    // row now. Otherwise the row should be created on first login instead.
    if (data.session && data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: fullName,
        exam_board: examBoard,
      });

      if (profileError) {
        setLoading(false);
        setError(profileError.message);
        return;
      }

      await fetch("/api/referral/claim", { method: "POST" }).catch(() => {});

      router.push("/dashboard");
      router.refresh();
      return;
    }

    setLoading(false);
    router.push("/login?next=/dashboard");
  }

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-6 py-20">
      <h1 className="font-heading text-3xl font-semibold">
        Create your account
      </h1>
      <p className="mt-2 text-muted-foreground">
        {refCode
          ? "Free to start — and you'll get a bonus session for signing up via a friend's link."
          : "Free to start. Your first session is a couple of minutes away."}
      </p>

      <Card className="mt-8 border-border/70 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="examBoard">Exam board</Label>
            <div className="flex gap-2">
              {EXAM_BOARDS.map((board) => (
                <button
                  type="button"
                  key={board}
                  onClick={() => setExamBoard(board)}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
                    examBoard === board
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {board}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account…" : "Start free"}
          </Button>
        </form>
      </Card>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
