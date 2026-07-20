import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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

export default function SubjectsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <div className="max-w-2xl">
        <h1 className="font-heading text-4xl font-semibold text-balance">
          A-level Biology, fully mapped.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground text-pretty">
          Novus tracks your progress against the AQA specification topic by
          topic. OCR and Edexcel mappings are on the roadmap.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {AQA_UNITS.map((unit) => (
          <Card key={unit.code} className="border-border/70 p-6">
            <p className="text-xs font-medium tracking-wide text-primary uppercase">
              {unit.code}
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
