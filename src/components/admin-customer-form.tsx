"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Tier = "bronze" | "silver" | "gold";

export function AdminCustomerForm({
  studentId,
  currentTier,
  currentStatus,
  currentBonus,
  currentIsAdmin,
}: {
  studentId: string;
  currentTier: Tier | null;
  currentStatus: string | null;
  currentBonus: number;
  currentIsAdmin: boolean;
}) {
  const router = useRouter();
  const [tier, setTier] = useState<Tier>(currentTier ?? "bronze");
  const [status, setStatus] = useState(currentStatus ?? "active");
  const [bonusDelta, setBonusDelta] = useState(1);
  const [isAdmin, setIsAdmin] = useState(currentIsAdmin);
  const [loading, setLoading] = useState<string | null>(null);

  async function patch(body: Record<string, unknown>, key: string) {
    setLoading(key);
    try {
      await fetch(`/api/admin/customers/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/70 p-6">
        <h2 className="font-heading text-lg font-semibold">Subscription</h2>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label>Tier</Label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as Tier)}
              className="h-9 rounded-md border border-border bg-transparent px-3 text-sm"
            >
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-9 rounded-md border border-border bg-transparent px-3 text-sm"
            >
              <option value="active">Active</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
          <Button
            disabled={loading !== null}
            onClick={() => patch({ tier, status }, "sub")}
          >
            {loading === "sub" ? "Saving…" : "Save"}
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Manually granted plans use a placeholder billing record, not a real
          Stripe subscription — use this for comps/support, not to replace a
          real checkout.
        </p>
      </Card>

      <Card className="border-border/70 p-6">
        <h2 className="font-heading text-lg font-semibold">Bonus sessions</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Currently: {currentBonus}
        </p>
        <div className="mt-4 flex items-end gap-4">
          <div className="space-y-2">
            <Label>Add / remove</Label>
            <Input
              type="number"
              value={bonusDelta}
              onChange={(e) => setBonusDelta(Number(e.target.value))}
              className="w-28"
            />
          </div>
          <Button
            disabled={loading !== null}
            onClick={() => patch({ bonusSessionsDelta: bonusDelta }, "bonus")}
          >
            {loading === "bonus" ? "Saving…" : "Apply"}
          </Button>
        </div>
      </Card>

      <Card className="border-border/70 p-6">
        <h2 className="font-heading text-lg font-semibold">Admin access</h2>
        <div className="mt-4 flex items-center gap-4">
          <select
            value={isAdmin ? "yes" : "no"}
            onChange={(e) => setIsAdmin(e.target.value === "yes")}
            className="h-9 rounded-md border border-border bg-transparent px-3 text-sm"
          >
            <option value="no">Not an admin</option>
            <option value="yes">Admin</option>
          </select>
          <Button
            variant="outline"
            disabled={loading !== null}
            onClick={() => patch({ isAdmin }, "admin")}
          >
            {loading === "admin" ? "Saving…" : "Save"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
