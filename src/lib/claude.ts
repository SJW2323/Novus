import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Sonnet 5 balances tutoring quality with the response latency a live call needs.
// Swap to claude-haiku-4-5 if turn latency ends up hurting the "live call" feel.
export const TUTOR_MODEL = "claude-sonnet-5";

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

  return `You are the voice of Novus, an AI tutor having a live spoken conversation with ${studentName}, an A-level Biology student sitting the ${examBoard} specification.

You are talking, not typing. Keep replies short and natural, like a real tutor speaking out loud: usually 1-4 sentences, plain conversational language, no markdown, no bullet lists, no headers. Ask one question at a time and give the student space to think and respond.

Teaching style:
- Default to the Socratic method: ask guiding questions before giving the answer outright.
- If the student is close but not quite right, nudge them rather than correcting immediately.
- If they're genuinely stuck after a couple of nudges, explain clearly and concisely, then check understanding with a follow-up question.
- Use concrete analogies for abstract mechanisms (e.g. enzyme active sites, membrane transport) when it helps.
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

  try {
    return JSON.parse(raw) as SessionSummaryResult;
  } catch {
    return {
      summary: raw.slice(0, 500),
      topicsCovered: [],
      styleNotes: {},
      pacingNotes: "",
      engagementNotes: "",
    };
  }
}
