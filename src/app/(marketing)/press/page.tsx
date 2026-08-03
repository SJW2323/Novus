import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const BOILERPLATE =
  "Novus is a live, face-to-face AI tutor for A-level Biology. Instead of typing into a chatbot, students talk to Novus on a call, mapped exactly to their exam board's specification (AQA, WJEC, with OCR and Edexcel on the roadmap), and it remembers what was covered and how each student learns from one session to the next. Novus was founded by two Biology students who kept running into the same problem while tutoring others: almost every resource is written for \"A-level Biology\" in the abstract, not for the exam board actually in front of a student.";

const COLORS = [
  { name: "Background", hex: "#050E1A" },
  { name: "Blue", hex: "#4C99F8" },
  { name: "Purple", hex: "#A657ED" },
];

const LOGO_ASSETS = [
  { label: "Icon mark (transparent PNG)", href: "/brand/icon-transparent.png" },
  { label: "Full logo lockup (transparent PNG)", href: "/brand/logo-lockup-transparent.png" },
  { label: "Original logo (PNG)", href: "/brand/logo-original.png" },
];

const SOCIAL_ASSETS = [
  { label: "Launch announcement", href: "/social/announce.png" },
  { label: "Pricing", href: "/social/pricing.png" },
  { label: "Referral program", href: "/social/referral.png" },
];

export default function PressPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <p className="text-xs font-medium tracking-wide text-primary uppercase">
        Press & brand kit
      </p>
      <h1 className="mt-2 font-heading text-4xl font-semibold text-balance">
        Novus, at a glance.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground text-pretty">
        Everything you need to write about, link to, or design around Novus —
        boilerplate copy, logo files, brand colours, and product screenshots.
      </p>

      <Button size="lg" className="mt-6" render={<a href="/novus-press-kit.zip" download />}>
        Download everything (.zip)
      </Button>

      <section className="mt-14">
        <h2 className="font-heading text-2xl font-semibold">Boilerplate</h2>
        <Card className="mt-4 border-border/70 p-6">
          <p className="text-muted-foreground text-pretty">{BOILERPLATE}</p>
        </Card>
      </section>

      <section className="mt-14">
        <h2 className="font-heading text-2xl font-semibold">Logo</h2>
        <p className="mt-2 text-muted-foreground">
          Please keep clear space around the mark and don&apos;t recolour it.
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {LOGO_ASSETS.map((asset) => (
            <Card
              key={asset.href}
              className="flex flex-col items-center gap-4 border-border/70 p-6"
            >
              <div className="flex h-28 w-full items-center justify-center rounded-lg bg-secondary/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset.href} alt="" className="max-h-24 max-w-[80%]" />
              </div>
              <a
                href={asset.href}
                download
                className="text-center text-sm font-medium text-foreground underline underline-offset-4"
              >
                {asset.label}
              </a>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-heading text-2xl font-semibold">Social kit</h2>
        <p className="mt-2 text-muted-foreground">
          Ready-to-post graphics (1080×1080) for the launch, pricing, and
          referral program.
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {SOCIAL_ASSETS.map((asset) => (
            <Card
              key={asset.href}
              className="flex flex-col items-center gap-4 border-border/70 p-4"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.href}
                alt=""
                className="aspect-square w-full rounded-lg object-cover"
              />
              <a
                href={asset.href}
                download
                className="text-center text-sm font-medium text-foreground underline underline-offset-4"
              >
                {asset.label}
              </a>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-heading text-2xl font-semibold">Colours</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {COLORS.map((color) => (
            <Card key={color.hex} className="overflow-hidden border-border/70 p-0">
              <div className="h-20" style={{ backgroundColor: color.hex }} />
              <div className="p-4">
                <p className="text-sm font-medium">{color.name}</p>
                <p className="text-sm text-muted-foreground">{color.hex}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-heading text-2xl font-semibold">Screenshots</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <Card className="overflow-hidden border-border/70 p-0">
            <Image
              src="/press/screenshot-home.png"
              alt="Novus landing page"
              width={1280}
              height={800}
              className="h-auto w-full"
            />
          </Card>
          <Card className="overflow-hidden border-border/70 p-0">
            <Image
              src="/press/screenshot-pricing.png"
              alt="Novus pricing page"
              width={1280}
              height={800}
              className="h-auto w-full"
            />
          </Card>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-heading text-2xl font-semibold">Contact</h2>
        <p className="mt-2 text-muted-foreground">
          Press or partnership enquiries:{" "}
          <a
            href="mailto:samjwalters23@gmail.com"
            className="font-medium text-foreground underline underline-offset-4"
          >
            samjwalters23@gmail.com
          </a>
        </p>
      </section>
    </div>
  );
}
