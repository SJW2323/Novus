"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

// Four chromosome pairs, each with a fixed column position at the
// metaphase plate and a colour so a viewer can track a pair as it splits.
const PAIRS = [
  { column: 95, color: "var(--glow-blue)" },
  { column: 130, color: "var(--glow-purple)" },
  { column: 170, color: "oklch(0.75 0.15 25)" },
  { column: 205, color: "oklch(0.78 0.14 165)" },
];

// Loose, deterministic scatter offsets for the interphase/chromatin look.
const JITTER = [
  { dx: -14, dy: -18, rot: 20 },
  { dx: 12, dy: 16, rot: -18 },
  { dx: -10, dy: -22, rot: 26 },
  { dx: 16, dy: 20, rot: -12 },
];

const PHASES = [
  { label: "Interphase", start: 0, end: 0.14 },
  { label: "Prophase", start: 0.16, end: 0.34 },
  { label: "Metaphase", start: 0.36, end: 0.54 },
  { label: "Anaphase", start: 0.56, end: 0.74 },
  { label: "Telophase", start: 0.76, end: 1 },
];

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// Piecewise-linear sample across a set of (t, value) keyframes.
function sample(keyframes: [number, number][], t: number) {
  for (let i = 0; i < keyframes.length - 1; i++) {
    const [t0, v0] = keyframes[i];
    const [t1, v1] = keyframes[i + 1];
    if (t >= t0 && t <= t1) {
      const local = t1 === t0 ? 0 : (t - t0) / (t1 - t0);
      return lerp(v0, v1, local);
    }
  }
  return keyframes[keyframes.length - 1][1];
}

function chromatidTransform(
  pairIndex: number,
  side: "A" | "B",
  t: number,
): { x: number; y: number; rotate: number; opacity: number; scale: number } {
  const { column } = PAIRS[pairIndex];
  const jitter = JITTER[pairIndex];
  const sign = side === "A" ? -1 : 1;
  const plateY = 170;
  const poleY = side === "A" ? 78 : 262;
  const converge = column + (150 - column) * 0.55;

  const x = sample(
    [
      [0, column + jitter.dx * (side === "A" ? 1 : -0.8)],
      [0.15, column + jitter.dx * (side === "A" ? 1 : -0.8)],
      [0.35, column],
      [0.55, column],
      [0.75, converge],
      [1, converge],
    ],
    t,
  );

  const y = sample(
    [
      [0, plateY + jitter.dy * (side === "A" ? 1 : -0.8)],
      [0.15, plateY + jitter.dy * (side === "A" ? 1 : -0.8)],
      [0.35, plateY],
      [0.55, plateY],
      [0.75, poleY],
      [1, poleY],
    ],
    t,
  );

  const rotate = sample(
    [
      [0, jitter.rot],
      [0.15, jitter.rot],
      [0.35, sign * 45],
      [0.55, sign * 45],
      [0.75, 90],
      [1, 90],
    ],
    t,
  );

  const opacity = sample(
    [
      [0, 0.4],
      [0.15, 0.4],
      [0.3, 1],
      [0.75, 1],
      [1, 0.55],
    ],
    t,
  );

  const scale = sample(
    [
      [0, 0.55],
      [0.15, 0.55],
      [0.3, 1],
      [1, 1],
    ],
    t,
  );

  return { x, y, rotate, opacity, scale };
}

// The SVG diagram itself, parameterized by a progress value in [0, 1]. Takes
// any MotionValue<number> - a scroll-linked one (below, for the marketing
// page) or a spring animated toward a target (for the conversation-driven
// version shown next to the tutor avatar) both work identically here.
export function MitosisDiagram({ progress }: { progress: MotionValue<number> }) {
  const chromatidRefs = useRef<(SVGGElement | null)[]>([]);

  useMotionValueEvent(progress, "change", (latest) => {
    const t = clamp01(latest);
    let i = 0;
    for (let pairIndex = 0; pairIndex < PAIRS.length; pairIndex++) {
      for (const side of ["A", "B"] as const) {
        const el = chromatidRefs.current[i];
        i++;
        if (!el) continue;
        const { x, y, rotate, opacity, scale } = chromatidTransform(
          pairIndex,
          side,
          t,
        );
        el.setAttribute(
          "transform",
          `translate(${x} ${y}) rotate(${rotate}) scale(${scale})`,
        );
        el.style.opacity = String(opacity);
      }
    }
  });

  const nucleusOpacity = useTransform(progress, [0, 0.13, 0.3], [1, 1, 0]);
  const spindleOpacity = useTransform(
    progress,
    [0, 0.34, 0.42, 0.75, 0.85, 1],
    [0, 0, 1, 1, 0, 0],
  );
  const membraneOpacity = useTransform(progress, [0.78, 0.9], [1, 0]);
  const daughterOpacity = useTransform(progress, [0.78, 0.9], [0, 1]);
  const daughterSpread = useTransform(progress, [0.78, 1], [0, 1]);
  const topDaughterY = useTransform(daughterSpread, (v) => -18 * v);
  const bottomDaughterY = useTransform(daughterSpread, (v) => 18 * v);

  return (
    <svg viewBox="0 0 300 340" className="mx-auto w-full max-w-sm" aria-hidden>
      <motion.circle
        cx={150}
        cy={170}
        r={100}
        fill="none"
        stroke="var(--border)"
        strokeWidth={2}
        style={{ opacity: membraneOpacity }}
      />
      <motion.circle
        cx={150}
        cy={170}
        r={62}
        fill="color-mix(in oklch, var(--glow-blue), transparent 88%)"
        stroke="var(--glow-blue)"
        strokeOpacity={0.4}
        strokeWidth={1.5}
        style={{ opacity: nucleusOpacity }}
      />

      <motion.g style={{ opacity: daughterOpacity, y: topDaughterY }}>
        <circle
          cx={150}
          cy={78}
          r={58}
          fill="none"
          stroke="var(--border)"
          strokeWidth={2}
        />
      </motion.g>
      <motion.g style={{ opacity: daughterOpacity, y: bottomDaughterY }}>
        <circle
          cx={150}
          cy={262}
          r={58}
          fill="none"
          stroke="var(--border)"
          strokeWidth={2}
        />
      </motion.g>

      <motion.g style={{ opacity: spindleOpacity }} strokeWidth={1}>
        {PAIRS.map((pair, i) => (
          <g key={i}>
            <line
              x1={150}
              y1={78}
              x2={pair.column}
              y2={170}
              stroke="var(--muted-foreground)"
              strokeOpacity={0.5}
            />
            <line
              x1={150}
              y1={262}
              x2={pair.column}
              y2={170}
              stroke="var(--muted-foreground)"
              strokeOpacity={0.5}
            />
          </g>
        ))}
      </motion.g>

      {PAIRS.map((pair, pairIndex) =>
        (["A", "B"] as const).map((side) => (
          <g
            key={`${pairIndex}-${side}`}
            ref={(el) => {
              chromatidRefs.current[pairIndex * 2 + (side === "A" ? 0 : 1)] = el;
            }}
          >
            <rect x={-16} y={-5} width={32} height={10} rx={5} fill={pair.color} />
          </g>
        )),
      )}
    </svg>
  );
}

export function MitosisScroll() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section ref={containerRef} className="relative h-[400vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden bg-secondary/20">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-10 px-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium tracking-wide text-primary uppercase">
              Watch and learn
            </p>
            <h2 className="mt-2 font-heading text-3xl font-semibold text-balance">
              Mitosis, frame by frame
            </h2>
            <div className="relative mt-6 h-28">
              {PHASES.map((phase) => (
                <PhaseLabel
                  key={phase.label}
                  label={phase.label}
                  start={phase.start}
                  end={phase.end}
                  progress={scrollYProgress}
                />
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Keep scrolling — one cell becomes two, with an identical set of
              chromosomes in each.
            </p>
          </div>

          <MitosisDiagram progress={scrollYProgress} />
        </div>
      </div>
    </section>
  );
}

function PhaseLabel({
  label,
  start,
  end,
  progress,
}: {
  label: string;
  start: number;
  end: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  // Span the full [0,1] domain explicitly so no input ever needs
  // out-of-range clamping/extrapolation, and never repeat an x-value
  // with a different y-value at that same point - both of these
  // produced erratic results from useTransform when tried.
  const breakpoints: number[] = [0];
  const values: number[] = [start <= 0 ? 1 : 0];

  if (start > 0) {
    breakpoints.push(start - 0.01, start);
    values.push(0, 1);
  }
  if (end < 1) {
    breakpoints.push(end, end + 0.01);
    values.push(1, 0);
  }

  breakpoints.push(1);
  values.push(end >= 1 ? 1 : 0);

  const opacity = useTransform(progress, breakpoints, values);

  return (
    <motion.p
      style={{ opacity }}
      className="absolute inset-x-0 top-0 font-heading text-2xl font-semibold"
    >
      {label}
    </motion.p>
  );
}
