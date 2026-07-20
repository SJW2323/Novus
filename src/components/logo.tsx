import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-heading text-xl font-semibold tracking-tight text-foreground",
        className,
      )}
    >
      Novus
    </span>
  );
}
