"use client";

import { useEffect } from "react";
import { useMotionValue, useSpring } from "framer-motion";
import { MitosisDiagram } from "@/components/mitosis-scroll";

const PHASE_LABELS: [number, string][] = [
  [0.15, "Interphase"],
  [0.35, "Prophase"],
  [0.55, "Metaphase"],
  [0.75, "Anaphase"],
  [1, "Telophase"],
];

function phaseLabelFor(progress: number) {
  for (const [threshold, label] of PHASE_LABELS) {
    if (progress <= threshold) return label;
  }
  return PHASE_LABELS[PHASE_LABELS.length - 1][1];
}

// Same diagram as the marketing page's scroll-driven version, but eased
// toward whatever phase the tutor is currently explaining instead of being
// driven by scroll position.
export function TutorMitosisDiagram({ progress }: { progress: number }) {
  const target = useMotionValue(progress);
  const smoothed = useSpring(target, { stiffness: 40, damping: 18 });

  useEffect(() => {
    target.set(progress);
  }, [progress, target]);

  return (
    <div className="mx-auto w-full max-w-[200px]">
      <p className="text-center text-xs font-medium tracking-wide text-primary uppercase">
        {phaseLabelFor(progress)}
      </p>
      <MitosisDiagram progress={smoothed} />
    </div>
  );
}
