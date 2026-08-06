"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Question {
  questionText: string;
  marks: number;
  topicName: string;
  modelAnswer: string;
}

export interface PastPaperSummary {
  id: string;
  examBoard: string;
  createdAt: string;
  questions: Question[];
}

export function PastPaperView({ papers }: { papers: PastPaperSummary[] }) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(papers[0]?.id ?? null);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/past-papers/generate", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to generate a paper");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  }

  const selected = papers.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="grid gap-8 md:grid-cols-[220px_1fr]">
      <div>
        <Button onClick={handleGenerate} disabled={generating} className="w-full">
          {generating ? "Generating…" : "Generate new paper"}
        </Button>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

        <div className="mt-6 space-y-2">
          {papers.map((paper, i) => (
            <button
              key={paper.id}
              type="button"
              onClick={() => {
                setSelectedId(paper.id);
                setRevealed({});
              }}
              className={`block w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                selectedId === paper.id
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Paper {papers.length - i}
              <span className="block text-xs text-muted-foreground">
                {new Date(paper.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {!selected ? (
          <Card className="border-border/70 p-8 text-center text-sm text-muted-foreground">
            No papers yet — generate your first tailored past paper.
          </Card>
        ) : (
          selected.questions.map((q, i) => (
            <Card key={i} className="border-border/70 p-6">
              <div className="flex items-start justify-between gap-4">
                <p className="font-medium">
                  {i + 1}. {q.questionText}
                </p>
                <span className="shrink-0 text-xs text-muted-foreground">
                  [{q.marks} mark{q.marks === 1 ? "" : "s"}]
                </span>
              </div>
              <p className="mt-1 text-xs text-primary">{q.topicName}</p>

              {revealed[i] ? (
                <p className="mt-4 rounded-lg bg-secondary/40 p-3 text-sm whitespace-pre-line text-muted-foreground">
                  {q.modelAnswer}
                </p>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setRevealed((r) => ({ ...r, [i]: true }))}
                >
                  Reveal model answer
                </Button>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
