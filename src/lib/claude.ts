import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Sonnet 5 balances tutoring quality with the response latency a live call needs.
// Swap to claude-haiku-4-5 if turn latency ends up hurting the "live call" feel.
export const TUTOR_MODEL = "claude-sonnet-5";

// Claude sometimes wraps JSON responses in ```json fences, or adds a
// stray sentence before/after the object, despite being told not to.
// Strip fences first, then fall back to extracting the outermost {...}
// block rather than failing silently on the whole response.
function parseJsonResponse<T>(raw: string, context: string): T | null {
  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "");

  try {
    return JSON.parse(stripped) as T;
  } catch {
    // fall through to bracket extraction below
  }

  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    try {
      return JSON.parse(stripped.slice(start, end + 1)) as T;
    } catch {
      // fall through to logging below
    }
  }

  console.error(`[claude] failed to parse JSON response for ${context}:`, raw.slice(0, 500));
  return null;
}

export interface MasteryRow {
  topicName: string;
  masteryLevel: number;
}

export interface LearningProfile {
  styleNotes: Record<string, unknown>;
  pacingNotes: string | null;
  engagementNotes: string | null;
  rawSummary: string | null;
}

export function buildTutorSystemPrompt({
  studentName,
  examBoard,
  learningProfile,
  masteryRows,
}: {
  studentName: string;
  examBoard: string;
  learningProfile: LearningProfile | null;
  masteryRows: MasteryRow[];
}): string {
  const weakTopics = masteryRows
    .filter((row) => row.masteryLevel < 0.6)
    .map((row) => row.topicName);
  const strongTopics = masteryRows
    .filter((row) => row.masteryLevel >= 0.8)
    .map((row) => row.topicName);

  return `You are the voice of Novus, an AI tutor having a live spoken phone call with ${studentName}, an A-level Biology student sitting the ${examBoard} specification.

CONVERSATION FORMAT
This is a live spoken conversation, not an essay or a lecture. Keep almost every reply to one or two short sentences - three at most, and only when the student explicitly asks for a fuller explanation. No markdown, no bullet lists, no headers, no numbered steps read aloud as "one, two, three." Ask one question at a time, then stop talking and let them think.

REACT BEFORE YOU MOVE ON
Never jump straight to the next question without acknowledging what the student just said. React like a person would - "right, exactly", "hmm, not quite", "okay yeah that's the idea" - and vary it; do not reuse the same acknowledgement every turn, and do not praise every single answer as "great question" or "good job." Save real enthusiasm for when it is earned.

SOUND LIKE A PERSON, NOT A SCRIPT
Use contractions always (it's, that's, you're, don't). Speak plainly, the way a sharp final-year student explaining something to a friend would, not like a textbook. Light, occasional fillers ("so", "okay", "I mean") and a short "..." pause before a tricky point are good in moderation - do not force one into every line, and never let a filler get in the way of a precise answer. Vary your sentence openers; do not start every turn with the student's name or the same stock phrase.

TEACHING STYLE
- Default to the Socratic method: ask guiding questions before giving the answer outright.
- If the student is close but not quite right, nudge them rather than correcting immediately.
- If they're genuinely stuck after a couple of nudges, explain clearly and concisely in one or two sentences, then check understanding with a short follow-up question.
- Use concrete analogies for abstract mechanisms (e.g. enzyme active sites, membrane transport) when it helps, but keep them brief - one line, not a story.
- Keep the science precise and exam-accurate for ${examBoard} A-level Biology - don't oversimplify to the point of being wrong.

${
  learningProfile?.rawSummary
    ? `What you know about this student from past sessions: ${learningProfile.rawSummary}`
    : "You have no prior session history with this student yet - this is a fresh start, so get a feel for their level early on."
}
${learningProfile?.pacingNotes ? `Pacing notes: ${learningProfile.pacingNotes}` : ""}
${learningProfile?.engagementNotes ? `Engagement notes: ${learningProfile.engagementNotes}` : ""}
${weakTopics.length > 0 ? `Topics they've struggled with previously: ${weakTopics.join(", ")}.` : ""}
${strongTopics.length > 0 ? `Topics they've shown strong mastery in: ${strongTopics.join(", ")}.` : ""}

Start the conversation by greeting ${studentName} warmly and briefly, then either continue what you last worked on together or ask what they want to focus on today.`;
}

export async function getTutorReply({
  systemPrompt,
  history,
}: {
  systemPrompt: string;
  history: { role: "user" | "assistant"; content: string }[];
}): Promise<string> {
  const response = await anthropic.messages.create({
    model: TUTOR_MODEL,
    max_tokens: 400,
    system: systemPrompt,
    messages: history.length > 0 ? history : [{ role: "user", content: "(the student has just joined the call)" }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock && textBlock.type === "text" ? textBlock.text : "";
}

export interface SessionSummaryResult {
  summary: string;
  topicsCovered: { topicName: string; masteryDelta: number }[];
  styleNotes: Record<string, unknown>;
  pacingNotes: string;
  engagementNotes: string;
}

export async function summarizeSession({
  transcript,
  existingProfile,
  knownTopics,
}: {
  transcript: { role: "user" | "assistant"; content: string }[];
  existingProfile: LearningProfile | null;
  knownTopics: string[];
}): Promise<SessionSummaryResult> {
  const transcriptText = transcript
    .map((m) => `${m.role === "user" ? "Student" : "Tutor"}: ${m.content}`)
    .join("\n");

  const response = await anthropic.messages.create({
    model: TUTOR_MODEL,
    max_tokens: 800,
    system: `You analyse A-level Biology tutoring transcripts and extract structured learning signals. Respond with ONLY valid JSON matching this exact shape, no prose, no markdown fences:
{
  "summary": string (2-3 sentences on how this session went, written to brief a tutor who will teach this student next),
  "topicsCovered": [{ "topicName": string, "masteryDelta": number between -0.2 and 0.2 }],
  "styleNotes": object (free-form observations like respondsToAnalogies, prefersDiagrams, needsRepetitionOn, etc, only include what you actually observed),
  "pacingNotes": string (how fast/slow to go next time),
  "engagementNotes": string (energy, confidence, engagement observations)
}
Known syllabus topics you can reference in topicsCovered: ${knownTopics.join(", ")}.`,
    messages: [
      {
        role: "user",
        content: `Existing learning profile: ${JSON.stringify(existingProfile) || "none"}

Transcript:
${transcriptText}`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  const raw = textBlock && textBlock.type === "text" ? textBlock.text : "{}";

  const parsed = parseJsonResponse<SessionSummaryResult>(raw, "summarizeSession");
  return (
    parsed ?? {
      summary: raw.slice(0, 500),
      topicsCovered: [],
      styleNotes: {},
      pacingNotes: "",
      engagementNotes: "",
    }
  );
}

export interface GeneratedFlashcard {
  front: string;
  back: string;
  topicName: string;
}

export async function generateFlashcards({
  transcript,
  knownTopics,
}: {
  transcript: { role: "user" | "assistant"; content: string }[];
  knownTopics: string[];
}): Promise<GeneratedFlashcard[]> {
  const transcriptText = transcript
    .map((m) => `${m.role === "user" ? "Student" : "Tutor"}: ${m.content}`)
    .join("\n");

  const response = await anthropic.messages.create({
    model: TUTOR_MODEL,
    max_tokens: 1000,
    system: `You turn A-level Biology tutoring transcripts into revision flashcards. Respond with ONLY valid JSON, no prose, no markdown fences:
{
  "cards": [{ "front": string (a short question or prompt), "back": string (a concise, exam-accurate answer, 1-3 sentences), "topicName": string }]
}
Only generate cards for concepts actually discussed in the transcript - do not invent content that was not covered. Produce 3-8 cards depending on how much ground the session covered. Keep answers precise and exam-accurate for A-level Biology.
Known syllabus topics you can reference in topicName: ${knownTopics.join(", ")}.`,
    messages: [{ role: "user", content: `Transcript:\n${transcriptText}` }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  const raw = textBlock && textBlock.type === "text" ? textBlock.text : "{}";

  const parsed = parseJsonResponse<{ cards: GeneratedFlashcard[] }>(raw, "generateFlashcards");
  return parsed?.cards ?? [];
}
