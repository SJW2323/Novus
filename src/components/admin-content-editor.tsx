"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function AdminContentEditor({
  fields,
}: {
  fields: { key: string; label: string; value: string }[];
}) {
  const [values, setValues] = useState(
    Object.fromEntries(fields.map((f) => [f.key, f.value])),
  );
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  async function save(key: string) {
    setSavingKey(key);
    setSavedKey(null);
    try {
      await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: values[key] }),
      });
      setSavedKey(key);
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className="space-y-6">
      {fields.map((field) => (
        <Card key={field.key} className="border-border/70 p-6">
          <Label htmlFor={field.key}>{field.label}</Label>
          <textarea
            id={field.key}
            value={values[field.key]}
            onChange={(e) =>
              setValues((v) => ({ ...v, [field.key]: e.target.value }))
            }
            rows={field.key.includes("body") ? 8 : 3}
            className="mt-2 w-full rounded-md border border-border bg-transparent p-3 text-sm"
          />
          <div className="mt-3 flex items-center gap-3">
            <Button
              size="sm"
              disabled={savingKey !== null}
              onClick={() => save(field.key)}
            >
              {savingKey === field.key ? "Saving…" : "Save"}
            </Button>
            {savedKey === field.key && (
              <span className="text-sm text-muted-foreground">Saved</span>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
