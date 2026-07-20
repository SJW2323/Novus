import { cn } from "@/lib/utils";

// A stylised double helix used as ambient background decoration. Not
// biologically literal — two mirrored sine strands with cross-rungs, tuned
// for a soft neon look rather than scientific accuracy.
export function DnaHelix({ className }: { className?: string }) {
  const rungs = [50, 150, 250, 350];

  return (
    <svg
      viewBox="0 0 100 400"
      fill="none"
      className={cn("pointer-events-none", className)}
      aria-hidden
    >
      <defs>
        <filter id="dna-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter="url(#dna-glow)" strokeLinecap="round">
        {rungs.map((y, i) => {
          const leftFirst = i % 2 === 0;
          return (
            <line
              key={y}
              x1={leftFirst ? 90 : 10}
              y1={y}
              x2={leftFirst ? 10 : 90}
              y2={y}
              stroke="var(--glow-purple)"
              strokeOpacity={0.35}
              strokeWidth={2}
            />
          );
        })}

        <path
          d="M 50 0 C 90 25, 90 75, 50 100 C 10 125, 10 175, 50 200 C 90 225, 90 275, 50 300 C 10 325, 10 375, 50 400"
          stroke="var(--glow-blue)"
          strokeOpacity={0.8}
          strokeWidth={3.5}
        />
        <path
          d="M 50 0 C 10 25, 10 75, 50 100 C 90 125, 90 175, 50 200 C 10 225, 10 275, 50 300 C 90 325, 90 375, 50 400"
          stroke="var(--glow-purple)"
          strokeOpacity={0.8}
          strokeWidth={3.5}
        />
      </g>
    </svg>
  );
}

// A faint hex-lattice of dots and connecting lines, evoking a molecular
// network. Used as low-opacity section texture, not a focal element.
export function MoleculeField({ className }: { className?: string }) {
  const cols = 6;
  const rows = 4;
  const spacingX = 100 / cols;
  const spacingY = 100 / rows;

  const points: { x: number; y: number }[] = [];
  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= cols; col++) {
      const offset = row % 2 === 0 ? 0 : spacingX / 2;
      points.push({ x: col * spacingX + offset, y: row * spacingY });
    }
  }

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={cn("pointer-events-none", className)}
      aria-hidden
    >
      <g stroke="var(--glow-blue)" strokeOpacity={0.25} strokeWidth={0.15}>
        {points.map((p, i) =>
          points
            .slice(i + 1)
            .filter((q) => Math.hypot(q.x - p.x, q.y - p.y) < spacingX * 1.05)
            .map((q, j) => (
              <line key={`${i}-${j}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} />
            )),
        )}
      </g>
      <g fill="var(--glow-purple)" fillOpacity={0.4}>
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={0.55} />
        ))}
      </g>
    </svg>
  );
}
