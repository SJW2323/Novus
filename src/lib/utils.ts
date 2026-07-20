import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Supabase's untyped query builder infers embedded to-one resources as an
// array shape; this normalizes either shape to a single topic name.
export function extractTopicName(
  syllabusTopics: { topic_name: string } | { topic_name: string }[] | null,
): string {
  if (!syllabusTopics) return "Unknown topic";
  if (Array.isArray(syllabusTopics)) {
    return syllabusTopics[0]?.topic_name ?? "Unknown topic";
  }
  return syllabusTopics.topic_name;
}
