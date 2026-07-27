import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DnaHelix } from "@/components/decorative";

const PILLARS = [
  {
    title: "Mapped to your exam board",
    body: "Not \"A-level Biology\" in general — your specification, unit by unit. Novus tracks mastery against the syllabus you're actually sitting, so nothing you cover is off-spec.",
  },
  {
    title: "Available when you're actually stuck",
    body: "Not booked a week in advance, not limited to term time. Open a call at 11pm before a mock and talk it through there and then.",
  },
  {
    title: "Priced to use every week",
    body: "A tutor you can only justify before exams isn't much of a tutor. Novus is built to be affordable enough to lean on regularly, not just in a panic.",
  },
];

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden">
      <DnaHelix className="animate-float-slow pointer-events-none absolute -top-10 -right-6 hidden h-96 w-20 opacity-30 md:block" />

      <div className="relative mx-auto max-w-3xl px-6 py-20">
        <p className="text-xs font-medium tracking-wide text-primary uppercase">
          Our story
        </p>
        <h1 className="mt-2 font-heading text-4xl font-semibold text-balance">
          Two Biology students, one shared problem.
        </h1>

        <div className="mt-6 space-y-5 text-lg text-muted-foreground text-pretty">
          <p>
            Novus was started by two students who did well enough in A-level
            Biology to end up tutoring other students through it — and kept
            running into the same wall, no matter who they were helping.
          </p>
          <p>
            Almost every tutoring resource out there is written for
            &ldquo;A-level Biology&rdquo; in the abstract, not for the exam
            board actually sitting in front of a student. Past papers that
            don&apos;t quite match the spec. Mark schemes phrased differently
            to how your board asks the question. Hours lost translating a
            generic explanation into something that actually answers what
            your syllabus wants.
          </p>
          <p>
            So they built the tutor they wished had existed: one that starts
            from your exam board&apos;s specification, not a generic
            syllabus, and that&apos;s cheap and available enough to actually
            talk to every week — not just the night before a mock.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {PILLARS.map((pillar) => (
            <Card key={pillar.title} className="border-border/70 p-6">
              <h2 className="font-heading text-lg font-semibold">
                {pillar.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground text-pretty">
                {pillar.body}
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
    </div>
  );
}
