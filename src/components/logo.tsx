import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/icon-transparent.png"
        alt=""
        className="h-7 w-7 shrink-0"
      />
      <span className="font-heading text-xl font-semibold tracking-tight text-foreground">
        Novus
      </span>
    </span>
  );
}
