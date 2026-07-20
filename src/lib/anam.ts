const ANAM_API_BASE = "https://api.anam.ai";

// Anam's own LLM is disabled with this special llmId - Claude drives every
// reply instead, pushed to the avatar via the client SDK's talk() method.
const CUSTOM_BRAIN_LLM_ID = "CUSTOMER_CLIENT_V1";

export async function createAnamSessionToken({
  systemPrompt,
}: {
  systemPrompt: string;
}): Promise<string> {
  const avatarId = process.env.ANAM_AVATAR_ID;
  const voiceId = process.env.ANAM_VOICE_ID;

  if (!process.env.ANAM_API_KEY || !avatarId || !voiceId) {
    throw new Error(
      "Missing ANAM_API_KEY, ANAM_AVATAR_ID, or ANAM_VOICE_ID. Find avatar/voice IDs in the Anam dashboard.",
    );
  }

  const res = await fetch(`${ANAM_API_BASE}/v1/auth/session-token`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.ANAM_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personaConfig: {
        name: "Novus",
        avatarId,
        voiceId,
        llmId: CUSTOM_BRAIN_LLM_ID,
        systemPrompt,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anam session-token request failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as { sessionToken: string };
  return data.sessionToken;
}
