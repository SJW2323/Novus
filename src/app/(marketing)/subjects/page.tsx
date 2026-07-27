"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const AQA_UNITS = [
  {
    code: "3.1",
    title: "Biological molecules",
    topics: [
      "Monomers and polymers",
      "Carbohydrates",
      "Lipids",
      "Proteins",
      "Nucleic acids",
      "Enzymes",
      "Biological membranes",
      "Cell division, diversity and organisation",
    ],
  },
  {
    code: "3.2",
    title: "Cells",
    topics: [
      "Cell structure",
      "Transport across cell membranes",
      "Cell recognition and the immune system",
    ],
  },
  {
    code: "3.3",
    title: "Organisms exchange substances with their environment",
    topics: [
      "Surface area to volume ratio",
      "Gas exchange",
      "Digestion and absorption",
      "Mass transport in animals",
      "Mass transport in plants",
    ],
  },
  {
    code: "3.4",
    title: "Genetic information, variation and relationships between organisms",
    topics: [
      "DNA, genes and chromosomes",
      "DNA and protein synthesis",
      "Genetic diversity from meiosis and random fertilisation",
      "Genetic diversity and adaptation",
      "Species and taxonomy",
      "Biodiversity within a community",
      "Investigating diversity",
    ],
  },
  {
    code: "3.5",
    title: "Energy transfers in and between organisms",
    topics: [
      "Photosynthesis",
      "Respiration",
      "Energy and ecosystems",
      "Nutrient cycles",
    ],
  },
  {
    code: "3.6",
    title: "Organisms respond to changes in their internal and external environments",
    topics: [
      "Stimuli, detection and response",
      "Nervous coordination and muscles",
      "Homeostasis",
    ],
  },
  {
    code: "3.7",
    title: "Genetics, populations, evolution and ecosystems",
    topics: [
      "Inheritance",
      "Populations",
      "Evolution may lead to speciation",
      "Populations in ecosystems",
    ],
  },
  {
    code: "3.8",
    title: "The control of gene expression",
    topics: [
      "Mutation and protein structure",
      "Genome and transcriptome",
      "Gene expression and cancer",
      "Using genome sequencing",
      "Gene technologies",
    ],
  },
];

const WJEC_UNITS = [
  {
    code: "1",
    title: "Basic Biochemistry and Cell Organisation",
    topics: [
      "Chemical elements joined to form biological compounds",
      "Cell structure and organisation",
      "Cell membranes and transport",
      "Biological reactions are regulated by enzymes",
      "Nucleic acids and their functions",
      "Genetic information is copied and passed on to daughter cells",
    ],
  },
  {
    code: "2",
    title: "Biodiversity and Physiology of Body Systems",
    topics: [
      "All organisms are related through their evolutionary history",
      "Adaptations for gas exchange",
      "Adaptations for transport",
      "Adaptations for nutrition",
    ],
  },
  {
    code: "3",
    title: "Energy, Homeostasis and the Environment",
    topics: [
      "Importance of ATP",
      "Photosynthesis uses light energy to synthesise organic molecules",
      "Respiration releases chemical energy in biological processes",
      "Microbiology",
      "Population size and ecosystems",
      "Human impact on the environment",
      "Homeostasis and the kidney",
      "The nervous system",
    ],
  },
  {
    code: "4",
    title: "Variation, Inheritance and Options",
    topics: [
      "Sexual reproduction in humans",
      "Sexual reproduction in plants",
      "Inheritance",
      "Variation and evolution",
      "Application of reproduction and genetics",
      "Option: Immunology and Disease",
      "Option: Human Musculoskeletal Anatomy",
      "Option: Neurobiology and Behaviour",
    ],
  },
];

const BOARDS = {
  AQA: AQA_UNITS,
  WJEC: WJEC_UNITS,
};

export default function SubjectsPage() {
  const [board, setBoard] = useState<keyof typeof BOARDS>("AQA");
  const units = BOARDS[board];

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <div className="max-w-2xl">
        <h1 className="font-heading text-4xl font-semibold text-balance">
          A-level Biology, fully mapped.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground text-pretty">
          Novus tracks your progress topic by topic against your exam
          board&apos;s specification. OCR and Edexcel mappings are on the
          roadmap.
        </p>
      </div>

      <div className="mt-8 flex gap-2">
        {(Object.keys(BOARDS) as (keyof typeof BOARDS)[]).map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => setBoard(b)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              board === b
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {b}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {units.map((unit) => (
          <Card key={unit.code} className="border-border/70 p-6">
            <p className="text-xs font-medium tracking-wide text-primary uppercase">
              Unit {unit.code}
            </p>
            <h2 className="mt-1 font-heading text-lg font-semibold">
              {unit.title}
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              {unit.topics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <div className="mt-14">
        <Button size="lg" render={<Link href="/signup" />}>
          Start free
        </Button>
      </div>
    </div>
  );
}
