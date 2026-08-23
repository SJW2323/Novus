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

type CallStatus = "idle" | "connecting" | "live" | "ended" | "error" | "trial-ended";

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
  const [trialSecondsLeft, setTrialSecondsLeft] = useState<number | null>(null);

  const clientRef = useRef<AnamClient | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const startedRef = useRef(false);
  const trialTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trialIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTrialTimers = useCallback(() => {
    if (trialTimeoutRef.current) clearTimeout(trialTimeoutRef.current);
    if (trialIntervalRef.current) clearInterval(trialIntervalRef.current);
    trialTimeoutRef.current = null;
    trialIntervalRef.current = null;
  }, []);

  const endCall = useCallback(
    async (redirect: boolean, finalStatus: CallStatus = "ended") => {
      clearTrialTimers();
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

      setStatus(finalStatus);
      if (redirect) router.push("/dashboard");
    },
    [router, clearTrialTimers],
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
        const { sessionToken, sessionId, isTrial, trialSeconds } = (await res.json()) as {
          sessionToken: string;
          sessionId: string;
          isTrial?: boolean;
          trialSeconds?: number;
        };
        sessionIdRef.current = sessionId;

        const client = createAnamClient(sessionToken);
        clientRef.current = client;

        client.addListener(AnamEvent.SESSION_READY, () => {
          setStatus("live");
          if (isTrial && trialSeconds) {
            setTrialSecondsLeft(trialSeconds);
            trialIntervalRef.current = setInterval(() => {
              setTrialSecondsLeft((s) => (s !== null ? Math.max(0, s - 1) : s));
            }, 1000);
            trialTimeoutRef.current = setTimeout(() => {
              endCall(false, "trial-ended");
            }, trialSeconds * 1000);
          }
        });

        client.addListener(AnamEvent.CONNECTION_CLOSED, () => {
          setStatus((s) => (s === "ended" || s === "trial-ended" ? s : "ended"));
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

        if (!res.ok || !res.body) return;

        // Stream text straight into the avatar's speech as it arrives from
        // Claude, instead of waiting for the whole reply - this is what
        // actually makes the call feel live rather than laggy.
        const talkStream = client.createTalkMessageStream();
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullReply = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (!chunk) continue;
          fullReply += chunk;
          await talkStream.streamMessageChunk(chunk, false);
        }
        await talkStream.endMessage();

        if (fullReply) {
          setTranscript((prev) => [
            ...prev,
            { id: `${Date.now()}`, role: "tutor", content: fullReply },
          ]);
        }
      } catch {
        // a dropped turn shouldn't kill the call - the student can just keep talking
      }
    }

    start();

    return () => {
      clearTrialTimers();
      if (clientRef.current) {
        clientRef.current.stopStreaming().catch(() => {});
      }
    };
  }, [endCall, clearTrialTimers]);

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

  const statusLabel =
    trialSecondsLeft !== null && status === "live"
      ? `Live with Novus · trial: ${Math.floor(trialSecondsLeft / 60)}:${String(trialSecondsLeft % 60).padStart(2, "0")}`
      : undefined;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-6 py-8">
      <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`size-2 rounded-full ${
                status === "live"
                  ? "bg-primary"
                  : status === "error" || status === "trial-ended"
                    ? "bg-destructive"
                    : "bg-muted-foreground"
              }`}
            />
            <span className="text-muted-foreground">
              {status === "connecting" && "Connecting…"}
              {status === "live" && (statusLabel ?? "Live with Novus")}
              {status === "ended" && "Call ended"}
              {status === "trial-ended" && "Trial ended"}
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
          {status !== "live" && status !== "error" && status !== "trial-ended" && (
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
          {status === "trial-ended" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-secondary/60 px-6 text-center">
              <p className="font-heading text-xl font-semibold">
                Your free trial has ended
              </p>
              <p className="max-w-xs text-sm text-muted-foreground">
                That was your one free 2-minute session. Subscribe to keep
                talking to Novus whenever you&apos;re stuck.
              </p>
              <Button render={<Link href="/pricing" />}>View plans</Button>
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
            disabled={status === "ended" || status === "trial-ended"}
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
