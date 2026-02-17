"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ConnectStripeButtonProps {
  workspaceId: string;
}

export function ConnectStripeButton({ workspaceId }: ConnectStripeButtonProps) {
  const [connecting, setConnecting] = useState(false);

  async function startConnect() {
    setConnecting(true);
    try {
      const response = await fetch("/api/stripe/connect/start", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ workspaceId }),
      });
      if (!response.ok) {
        throw new Error("Could not start Stripe connect flow.");
      }
      const data = (await response.json()) as { redirectUrl: string };
      window.location.href = data.redirectUrl;
    } catch {
      setConnecting(false);
    }
  }

  return (
    <Button onClick={startConnect} disabled={connecting}>
      {connecting ? "Connecting..." : "Connect Stripe"}
    </Button>
  );
}
