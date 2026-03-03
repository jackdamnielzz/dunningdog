"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

type BillingPlan = "starter" | "pro" | "growth";

interface UpgradePlanButtonProps {
  workspaceId: string;
  plan: BillingPlan;
  currentPlan: BillingPlan;
  billingStatus: string | null;
}

function getButtonLabel(plan: BillingPlan, currentPlan: BillingPlan, billingStatus: string | null, loading: boolean) {
  if (loading) {
    return "Redirecting...";
  }
  if (plan === currentPlan && billingStatus === "active") {
    return "Current plan";
  }
  if (plan === currentPlan) {
    return "Subscribe";
  }
  return `Choose ${plan}`;
}

export function UpgradePlanButton({
  workspaceId,
  plan,
  currentPlan,
  billingStatus,
}: UpgradePlanButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isActiveCurrent = plan === currentPlan && billingStatus === "active";

  async function startCheckout() {
    if (isActiveCurrent) {
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
        variant={isActiveCurrent ? "outline" : "default"}
        disabled={loading || isActiveCurrent}
        onClick={startCheckout}
        className="capitalize"
      >
        {getButtonLabel(plan, currentPlan, billingStatus, loading)}
      </Button>
      {error && <Alert variant="error">{error}</Alert>}
    </div>
  );
}
