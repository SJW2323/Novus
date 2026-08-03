import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-secondary/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Logo />
          <p className="max-w-sm text-sm text-muted-foreground">
            A tutor that remembers how you learn. Built for A-level Biology.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground">
          <Link href="/about" className="hover:text-foreground">
            Our story
          </Link>
          <Link href="/press" className="hover:text-foreground">
            Press kit
          </Link>
          <Link href="/how-it-works" className="hover:text-foreground">
            How it works
          </Link>
          <Link href="/subjects" className="hover:text-foreground">
            Biology syllabus
          </Link>
          <Link href="/login" className="hover:text-foreground">
            Log in
          </Link>
        </nav>
      </div>
      <div className="border-t border-border/70 px-6 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Novus. All rights reserved.
      </div>
    </footer>
  );
}
