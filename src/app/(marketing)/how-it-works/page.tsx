import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const STAGES = [
  {
    title: "1. You talk, Novus listens",
    body: "Open a call from your dashboard. Novus greets you, picks up where your last session left off, and asks what you want to work on, or suggests a topic based on your recent mastery scores.",
  },
  {
    title: "2. A real conversation, not a quiz",
    body: "Explain your reasoning out loud, ask 'why' as many times as you need to, and get pushed with follow-up questions when Novus thinks you're close but not quite there. It adapts pace and explanation style to you, in the moment.",
  },
  {
    title: "3. Every session, Novus learns too",
    body: "After you hang up, Novus reviews the conversation: which topics you covered, where you hesitated, what kind of explanation finally made it click. That gets folded into your learning profile.",
  },
  {
    title: "4. Your next call starts smarter",
    body: "Struggled with genetics last time? Novus brings it back around. Learn best with analogies? Expect more of them. Over time, sessions feel less like a generic lesson and more like being taught by someone who actually knows you.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <div className="max-w-2xl">
        <h1 className="font-heading text-4xl font-semibold text-balance">
          A tutor that shows up knowing you.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground text-pretty">
          Novus isn&apos;t a search box or a chatbot. It&apos;s a face and a voice you
          talk to on a call, built specifically to teach A-level Biology, and
          to get better at teaching you specifically the longer you use it.
        </p>
      </div>

      <div className="mt-14 space-y-6">
        {STAGES.map((stage) => (
          <Card key={stage.title} className="border-border/70 p-6">
            <h2 className="font-heading text-xl font-semibold">
              {stage.title}
            </h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              {stage.body}
            </p>
          </Card>
        ))}
      </div>

      <div className="mt-14 flex flex-wrap gap-4">
        <Button size="lg" render={<Link href="/signup" />}>
          Start free
        </Button>
        <Button size="lg" variant="outline" render={<Link href="/subjects" />}>
          See the syllabus
        </Button>
      </div>
    </div>
  );
}
