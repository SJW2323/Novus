"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const EXAM_BOARDS = ["AQA", "OCR", "Edexcel", "WJEC"] as const;
const TIER_LABELS: Record<string, string> = { bronze: "Bronze", silver: "Silver", gold: "Gold" };

export default function ProfilePage() {
  const [fullName, setFullName] = useState("");
  const [examBoard, setExamBoard] =
    useState<(typeof EXAM_BOARDS)[number]>("AQA");
  const [yearGroup, setYearGroup] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [subscription, setSubscription] = useState<{ tier: string; status: string } | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const [{ data }, { data: sub }] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, exam_board, year_group")
          .eq("id", user.id)
          .single(),
        supabase
          .from("subscriptions")
          .select("tier, status")
          .eq("student_id", user.id)
          .maybeSingle(),
      ]);

      if (data) {
        setFullName(data.full_name ?? "");
        setExamBoard((data.exam_board as (typeof EXAM_BOARDS)[number]) ?? "AQA");
        setYearGroup(data.year_group ?? "");
      }
      if (sub) setSubscription(sub);
      setLoading(false);
    });
  }, []);

  async function handleManageBilling() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string };
      if (data.url) window.location.href = data.url;
    } finally {
      setPortalLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({ full_name: fullName, exam_board: examBoard, year_group: yearGroup })
      .eq("id", user.id);

    setSaving(false);
    setSaved(true);
  }

  if (loading) {
    return <div className="mx-auto max-w-xl px-6 py-12" />;
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <h1 className="font-heading text-3xl font-semibold">Profile</h1>
      <p className="mt-1 text-muted-foreground">
        Keep this accurate — Novus uses it to tailor sessions.
      </p>

      <Card className="mt-8 border-border/70 p-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="yearGroup">Year group</Label>
            <Input
              id="yearGroup"
              placeholder="Year 12"
              value={yearGroup}
              onChange={(e) => setYearGroup(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Exam board</Label>
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

          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
          </Button>
        </form>
      </Card>

      <Card className="mt-6 border-border/70 p-6">
        <h2 className="font-heading text-lg font-semibold">Billing</h2>
        {subscription?.status === "active" ? (
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              {TIER_LABELS[subscription.tier] ?? subscription.tier} plan · active
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={handleManageBilling}
              disabled={portalLoading}
            >
              {portalLoading ? "Loading…" : "Manage billing"}
            </Button>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              No active subscription yet.
            </p>
            <Button className="mt-4" render={<Link href="/pricing" />}>
              View plans
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
