import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { getSiteTheme, themeToCssVars } from "@/lib/site-content";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const description =
  "Novus is an AI tutor you talk to face-to-face, like a video call. It learns how you learn and adapts every session to help you master A-level Biology.";

export const metadata: Metadata = {
  metadataBase: new URL("https://novus-murex.vercel.app"),
  title: "Novus — Your A-Level Biology Tutor",
  description,
  openGraph: {
    title: "Novus — Your A-Level Biology Tutor",
    description,
    url: "/",
    siteName: "Novus",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Novus" }],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Novus — Your A-Level Biology Tutor",
    description,
    images: ["/og-image.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const theme = await getSiteTheme(supabase);

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} dark h-full antialiased`}
      style={themeToCssVars(theme)}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
