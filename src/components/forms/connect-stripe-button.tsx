"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

interface ConnectStripeButtonProps {
  workspaceId: string;
}

export function ConnectStripeButton({ workspaceId }: ConnectStripeButtonProps) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startConnect() {
    setConnecting(true);
    setError(null);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
      setConnecting(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={startConnect} disabled={connecting}>
        {connecting ? "Connecting..." : "Connect Stripe"}
      </Button>
      {error && <Alert variant="error">{error}</Alert>}
    </div>
  );
}
