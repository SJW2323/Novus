"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ReferralCard({
  referralCode,
  bonusSessions,
}: {
  referralCode: string;
  bonusSessions: number;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const link = `${window.location.origin}/signup?ref=${referralCode}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Card className="mt-8 border-border/70 p-6">
      <h2 className="font-heading text-lg font-semibold">Refer a friend</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Share your link — they get a bonus session to try Novus, and you get
        one too once they subscribe.
        {bonusSessions > 0 && (
          <span className="mt-1 block font-medium text-foreground">
            You have {bonusSessions} bonus session
            {bonusSessions === 1 ? "" : "s"} ready to use.
          </span>
        )}
      </p>
      <Button variant="outline" className="mt-4" onClick={handleCopy}>
        {copied ? "Link copied" : "Copy referral link"}
      </Button>
    </Card>
  );
}
