import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DnaHelix, MoleculeField } from "@/components/decorative";
import { MitosisScroll } from "@/components/mitosis-scroll";

const TUTOR_FACE_URL =
  "https://newgxnc1uqs0jnqm.public.blob.vercel-storage.com/avatars/stock/olivia.webp";

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
      <section className="bg-hero-glow relative overflow-hidden">
        <DnaHelix className="animate-float-slow pointer-events-none absolute -top-10 -left-4 hidden h-[520px] w-24 opacity-60 md:block" />
        <DnaHelix className="animate-float-slow pointer-events-none absolute -right-6 -bottom-16 hidden h-[420px] w-20 opacity-40 lg:block" />

        <div className="relative mx-auto grid max-w-6xl gap-16 px-6 pt-16 pb-20 md:grid-cols-2 md:items-center md:pt-24">
          <div className="space-y-6">
            <Badge
              variant="secondary"
              className="rounded-full px-3 py-1 text-xs font-medium tracking-wide uppercase"
            >
              Live · Face-to-face · AQA · WJEC
            </Badge>
            <h1 className="font-heading text-4xl leading-[1.1] font-semibold text-balance sm:text-5xl">
              The tutor who never gets tired of{" "}
              <span className="text-gradient-brand">
                &ldquo;wait, can you explain that again?&rdquo;
              </span>
            </h1>
            <p className="max-w-md text-lg text-muted-foreground text-pretty">
              Novus is a face you talk to, not a chatbot you type at. Every
              conversation feels like a live one-on-one lesson — one that
              remembers exactly where you left off, whenever you&rsquo;re stuck.
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
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-border/70 bg-secondary/30">
        <MoleculeField className="absolute inset-0 h-full w-full opacity-70" />
        <div className="relative mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-heading text-center text-3xl font-semibold">
            How a session works
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {HOW_IT_WORKS.map((item) => (
              <Card
                key={item.step}
                className="glow-card border-border/70 bg-card/80 p-6 backdrop-blur"
              >
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

      <MitosisScroll />

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="space-y-4">
            <h2 className="font-heading text-3xl font-semibold text-balance">
              Full A-level Biology coverage, mapped to your exam board.
            </h2>
            <p className="text-muted-foreground text-pretty">
              Novus tracks your mastery topic by topic against the AQA and
              WJEC specifications, so revision time goes exactly where you
              need it. OCR and Edexcel mappings are on the roadmap.
            </p>
            <Button variant="outline" render={<Link href="/subjects" />}>
              Browse the syllabus
            </Button>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {SYLLABUS_UNITS.map((unit) => (
              <li
                key={unit}
                className="flex items-center gap-2.5 rounded-lg border border-border/70 bg-card px-4 py-3 text-sm"
              >
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--glow-blue), var(--glow-purple))",
                  }}
                />
                {unit}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className="relative overflow-hidden text-primary-foreground"
        style={{
          backgroundImage:
            "linear-gradient(120deg, var(--glow-blue), var(--glow-purple))",
        }}
      >
        <DnaHelix className="pointer-events-none absolute -top-16 right-8 hidden h-72 w-16 opacity-30 md:block" />
        <div className="relative mx-auto max-w-6xl px-6 py-16 text-center">
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
      <div className="glow-ring overflow-hidden rounded-3xl border border-border/70 bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="size-2 animate-pulse-glow rounded-full bg-primary" />
            Live with Novus
          </div>
          <span className="text-xs text-muted-foreground">12:04</span>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-secondary to-secondary/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={TUTOR_FACE_URL}
            alt="Novus tutor avatar"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-x-6 bottom-4 flex items-end justify-center gap-1">
            {[6, 10, 16, 9, 13, 7].map((h, i) => (
              <span
                key={i}
                className="w-1.5 rounded-full bg-primary/80 shadow-[0_0_8px_var(--glow-blue)]"
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
