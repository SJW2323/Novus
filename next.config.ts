import type { NextConfig } from "next";

const securityHeaders = [
  // HTTPS only, including subdomains - Vercel always serves over HTTPS anyway,
  // this just stops a browser from ever trying plain HTTP.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Nothing on this site is meant to be framed by another origin.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  // Stops the browser from guessing content-types (MIME-sniffing) on responses.
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Mic is used for live tutor calls (same-origin only); nothing else needs
  // camera, location, or the browsing-topics API.
  { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
