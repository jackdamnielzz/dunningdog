"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });
      const payload = (await response.json()) as { portalUrl?: string; detail?: string };
      if (response.ok && payload.portalUrl) {
        window.location.assign(payload.portalUrl);
      } else {
        setError(payload.detail ?? "Could not open billing portal.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button variant="outline" onClick={handleClick} disabled={loading}>
        {loading ? "Opening..." : "Manage Subscription"}
      </Button>
      {error && <Alert variant="error">{error}</Alert>}
    </div>
  );
}
