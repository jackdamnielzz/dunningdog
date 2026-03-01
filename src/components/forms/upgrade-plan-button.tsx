"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

type BillingPlan = "starter" | "pro" | "growth";

interface UpgradePlanButtonProps {
  workspaceId: string;
  plan: BillingPlan;
  currentPlan: BillingPlan;
}

function getButtonLabel(plan: BillingPlan, currentPlan: BillingPlan, loading: boolean) {
  if (loading) {
    return "Redirecting...";
  }
  if (plan === currentPlan) {
    return "Current plan";
  }
  return `Choose ${plan}`;
}

export function UpgradePlanButton({
  workspaceId,
  plan,
  currentPlan,
}: UpgradePlanButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    if (plan === currentPlan) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          workspaceId,
          plan,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to start billing checkout.");
      }

      const data = (await response.json()) as { checkoutUrl: string };
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant={plan === currentPlan ? "outline" : "default"}
        disabled={loading || plan === currentPlan}
        onClick={startCheckout}
        className="capitalize"
      >
        {getButtonLabel(plan, currentPlan, loading)}
      </Button>
      {error && <Alert variant="error">{error}</Alert>}
    </div>
  );
}
