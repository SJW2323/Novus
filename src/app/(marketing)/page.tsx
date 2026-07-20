import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Start a call",
    body: "Open your browser and talk to your tutor face-to-face, no downloads, no scheduling.",
  },
  {
    step: "02",
    title: "Learn out loud",
    body: "Ask questions, work through past-paper style problems, and think out loud, just like with a real tutor.",
  },
  {
    step: "03",
    title: "Novus remembers",
    body: "After every session, Novus notes what clicked and what didn't, then adapts the next one to you.",
  },
];

const SYLLABUS_UNITS = [
  "Biological molecules",
  "Cells",
  "Genetic information & variation",
  "Energy transfers",
  "Homeostasis & response",
  "Genetics, populations & ecosystems",
];

export default function HomePage() {
  return (
    <>
      <section className="mx-auto grid max-w-6xl gap-16 px-6 pb-20 pt-16 md:grid-cols-2 md:items-center md:pt-24">
        <div className="space-y-6">
          <Badge
            variant="secondary"
            className="rounded-full px-3 py-1 text-xs font-medium tracking-wide uppercase"
          >
            A-level Biology · AI tutor
          </Badge>
          <h1 className="font-heading text-4xl leading-[1.1] font-semibold text-balance sm:text-5xl">
            Meet the tutor who remembers how you learn.
          </h1>
          <p className="max-w-md text-lg text-muted-foreground text-pretty">
            Novus is a face you talk to, not a chatbot you type at. Every
            conversation feels like a video call with a tutor who&rsquo;s paying
            attention, and who gets to know you a little better each time.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="lg" render={<Link href="/signup" />}>
              Start free
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<Link href="/how-it-works" />}
            >
              See how it works
            </Button>
          </div>
        </div>

        <CallPreview />
      </section>

      <section className="border-y border-border/70 bg-secondary/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-heading text-center text-3xl font-semibold">
            How a session works
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {HOW_IT_WORKS.map((item) => (
              <Card key={item.step} className="border-border/70 p-6">
                <span className="font-heading text-sm text-primary">
                  {item.step}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.body}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="space-y-4">
            <h2 className="font-heading text-3xl font-semibold text-balance">
              Full A-level Biology coverage, mapped to your exam board.
            </h2>
            <p className="text-muted-foreground text-pretty">
              Novus tracks your mastery topic by topic against the AQA, OCR,
              and Edexcel specifications, so revision time goes exactly where
              you need it.
            </p>
            <Button variant="outline" render={<Link href="/subjects" />}>
              Browse the syllabus
            </Button>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {SYLLABUS_UNITS.map((unit) => (
              <li
                key={unit}
                className="rounded-lg border border-border/70 bg-card px-4 py-3 text-sm"
              >
                {unit}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <h2 className="font-heading text-3xl font-semibold text-balance">
            Your next session is one call away.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-primary-foreground/80">
            Free to start. No downloads. Just open your browser and talk.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="mt-8"
            render={<Link href="/signup" />}
          >
            Start free
          </Button>
        </div>
      </section>
    </>
  );
}

function CallPreview() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="size-2 rounded-full bg-primary" />
            Live with Novus
          </div>
          <span className="text-xs text-muted-foreground">12:04</span>
        </div>
        <div className="relative flex aspect-[4/5] items-center justify-center bg-gradient-to-b from-secondary to-secondary/40">
          <div className="size-32 rounded-full bg-gradient-to-br from-primary to-primary/60 shadow-lg" />
          <div className="absolute inset-x-6 bottom-6 flex items-end justify-center gap-1">
            {[6, 10, 16, 9, 13, 7].map((h, i) => (
              <span
                key={i}
                className="w-1.5 rounded-full bg-primary/70"
                style={{ height: `${h * 3}px` }}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-sm text-muted-foreground">
            &ldquo;Let&rsquo;s walk through how the sodium-potassium pump works...&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
