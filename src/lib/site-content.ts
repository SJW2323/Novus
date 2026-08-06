import type { SupabaseClient } from "@supabase/supabase-js";

export const CONTENT_FIELDS = [
  {
    key: "hero_subheadline",
    label: "Homepage subheadline",
    default:
      "Novus is a face you talk to, not a chatbot you type at. Every conversation feels like a live one-on-one lesson — one that remembers exactly where you left off, whenever you're stuck.",
  },
  {
    key: "about_body",
    label: "Our story body (separate paragraphs with a blank line)",
    default:
      "Novus was started by two students who did well enough in A-level Biology to end up tutoring other students through it — and kept running into the same wall, no matter who they were helping.\n\nAlmost every tutoring resource out there is written for \"A-level Biology\" in the abstract, not for the exam board actually sitting in front of a student. Past papers that don't quite match the spec. Mark schemes phrased differently to how your board asks the question. Hours lost translating a generic explanation into something that actually answers what your syllabus wants.\n\nSo they built the tutor they wished had existed: one that starts from your exam board's specification, not a generic syllabus, and that's cheap and available enough to actually talk to every week — not just the night before a mock.",
  },
  {
    key: "pricing_bronze_blurb",
    label: "Bronze plan blurb",
    default: "Try Novus out with a weekly check-in.",
  },
  {
    key: "pricing_silver_blurb",
    label: "Silver plan blurb",
    default: "Steady, regular tutoring through the term.",
  },
  {
    key: "pricing_gold_blurb",
    label: "Gold plan blurb",
    default: "As much time with Novus as you want.",
  },
] as const;

export type ContentKey = (typeof CONTENT_FIELDS)[number]["key"];

export async function getSiteContent(
  supabase: SupabaseClient,
): Promise<Record<ContentKey, string>> {
  const { data } = await supabase.from("site_content").select("key, value");
  const stored = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));

  return Object.fromEntries(
    CONTENT_FIELDS.map((f) => [f.key, stored[f.key] ?? f.default]),
  ) as Record<ContentKey, string>;
}
