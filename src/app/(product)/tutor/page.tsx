"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createClient as createAnamClient,
  AnamEvent,
  MessageRole,
  type AnamClient,
} from "@anam-ai/js-sdk";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, PhoneOff } from "lucide-react";

const VIDEO_ELEMENT_ID = "novus-avatar-video";

type CallStatus = "idle" | "connecting" | "live" | "ended" | "error";

interface TranscriptLine {
  id: string;
  role: "student" | "tutor";
  content: string;
}

export default function TutorPage() {
  const router = useRouter();
  const [status, setStatus] = useState<CallStatus>("idle");
  const [muted, setMuted] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [needsSubscription, setNeedsSubscription] = useState(false);

  const clientRef = useRef<AnamClient | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const startedRef = useRef(false);

  const endCall = useCallback(
    async (redirect: boolean) => {
      const client = clientRef.current;
      clientRef.current = null;
      if (client) {
        try {
          await client.stopStreaming();
        } catch {
          // already stopped
        }
      }

      const sessionId = sessionIdRef.current;
      if (sessionId) {
        await fetch("/api/session/end", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        }).catch(() => {});
      }

      setStatus("ended");
      if (redirect) router.push("/dashboard");
    },
    [router],
  );

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    async function start() {
      setStatus("connecting");
      try {
        const res = await fetch("/api/session/start", { method: "POST" });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          if (body.code === "NO_SUBSCRIPTION" || body.code === "LIMIT_REACHED") {
            setNeedsSubscription(true);
          }
          throw new Error(body.error ?? "Failed to start session");
        }
        const { sessionToken, sessionId } = (await res.json()) as {
          sessionToken: string;
          sessionId: string;
        };
        sessionIdRef.current = sessionId;

        const client = createAnamClient(sessionToken);
        clientRef.current = client;

        client.addListener(AnamEvent.SESSION_READY, () => setStatus("live"));

        client.addListener(AnamEvent.CONNECTION_CLOSED, () => {
          setStatus((s) => (s === "ended" ? s : "ended"));
        });

        client.addListener(AnamEvent.MESSAGE_STREAM_EVENT_RECEIVED, (event) => {
          if (!event.endOfSpeech || !event.content.trim()) return;

          if (event.role === MessageRole.USER) {
            setTranscript((prev) => [
              ...prev,
              { id: event.id, role: "student", content: event.content },
            ]);
            handleStudentUtterance(client, sessionId, event.content);
          }
        });

        await client.streamToVideoElement(VIDEO_ELEMENT_ID);
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
        setStatus("error");
      }
    }

    async function handleStudentUtterance(
      client: AnamClient,
      sessionId: string,
      studentUtterance: string,
    ) {
      try {
        const res = await fetch("/api/tutor/turn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, studentUtterance }),
        });
        const { reply } = (await res.json()) as { reply: string };
        if (reply) {
          setTranscript((prev) => [
            ...prev,
            { id: `${Date.now()}`, role: "tutor", content: reply },
          ]);
          await client.talk(reply);
        }
      } catch {
        // a dropped turn shouldn't kill the call - the student can just keep talking
      }
    }

    start();

    return () => {
      if (clientRef.current) {
        clientRef.current.stopStreaming().catch(() => {});
      }
    };
  }, []);

  function toggleMute() {
    const client = clientRef.current;
    if (!client) return;
    if (muted) {
      client.unmuteInputAudio();
      setMuted(false);
    } else {
      client.muteInputAudio();
      setMuted(true);
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-6 py-8">
      <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`size-2 rounded-full ${
                status === "live"
                  ? "bg-primary"
                  : status === "error"
                    ? "bg-destructive"
                    : "bg-muted-foreground"
              }`}
            />
            <span className="text-muted-foreground">
              {status === "connecting" && "Connecting…"}
              {status === "live" && "Live with Novus"}
              {status === "ended" && "Call ended"}
              {status === "error" && "Couldn't connect"}
              {status === "idle" && "Starting…"}
            </span>
          </div>
        </div>

        <div className="relative aspect-video w-full bg-secondary/40">
          <video
            id={VIDEO_ELEMENT_ID}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
          {status !== "live" && status !== "error" && (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary/60 text-muted-foreground">
              Connecting to your tutor…
            </div>
          )}
          {status === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-secondary/60 px-6 text-center text-sm text-destructive">
              {errorMessage}
              {needsSubscription && (
                <Button size="sm" render={<Link href="/pricing" />}>
                  View plans
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 px-4 py-4">
          <Button
            variant={muted ? "secondary" : "outline"}
            size="icon"
            onClick={toggleMute}
            disabled={status !== "live"}
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => endCall(true)}
            disabled={status === "ended"}
            aria-label="End call"
          >
            <PhoneOff className="size-4" />
          </Button>
        </div>
      </div>

      {transcript.length > 0 && (
        <div className="max-h-64 space-y-2 overflow-y-auto rounded-2xl border border-border/70 bg-card p-4 text-sm">
          {transcript.map((line) => (
            <p key={line.id}>
              <span className="font-medium">
                {line.role === "student" ? "You: " : "Novus: "}
              </span>
              <span className="text-muted-foreground">{line.content}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
