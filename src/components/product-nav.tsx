"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tutor", label: "Talk to Novus" },
  { href: "/flashcards", label: "Flashcards" },
  { href: "/profile", label: "Profile" },
];

export function ProductNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/dashboard">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-muted-foreground transition-colors hover:text-foreground",
                pathname.startsWith(link.href) && "font-medium text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </header>
  );
}
