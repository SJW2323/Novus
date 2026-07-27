import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

const NAV_LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/subjects", label: "Biology syllabus" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "Our story" },
];

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <Button render={<Link href="/dashboard" />}>Dashboard</Button>
          ) : (
            <>
              <Button
                variant="ghost"
                className="hidden sm:inline-flex"
                render={<Link href="/login" />}
              >
                Log in
              </Button>
              <Button render={<Link href="/signup" />}>Start free</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
