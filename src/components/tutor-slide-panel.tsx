"use client";

import { TutorMitosisDiagram } from "@/components/tutor-mitosis-diagram";

export interface TutorSlide {
  heading: string;
  bullets: string[];
  diagram: "mitosis" | null;
  diagramProgress: number;
}

export function TutorSlidePanel({ slide }: { slide: TutorSlide }) {
  return (
    <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-5">
      {slide.diagram === "mitosis" && (
        <TutorMitosisDiagram progress={slide.diagramProgress} />
      )}
      <div>
        <h3 className="font-heading text-lg font-semibold text-balance">
          {slide.heading}
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {slide.bullets.map((bullet, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-primary">•</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
