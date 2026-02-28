"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const plans = [
  { id: "starter", label: "Starter" },
  { id: "pro", label: "Pro" },
  { id: "growth", label: "Scale (Growth)" },
] as const;

interface AdminPlanSwitcherProps {
  workspaceId: string;
  currentPlan: string;
}

export function AdminPlanSwitcher({ workspaceId, currentPlan }: AdminPlanSwitcherProps) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedPlan === currentPlan) return;

    setStatus("saving");
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/set-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, plan: selectedPlan }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? "Failed to update plan");
      }

      setStatus("success");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Unknown error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {plans.map((plan) => (
          <label
            key={plan.id}
            className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-3 transition-colors ${
              selectedPlan === plan.id
                ? "border-emerald-500 bg-emerald-50"
                : "border-zinc-200 hover:border-zinc-300"
            }`}
          >
            <input
              type="radio"
              name="plan"
              value={plan.id}
              checked={selectedPlan === plan.id}
              onChange={() => {
                setSelectedPlan(plan.id);
                setStatus("idle");
              }}
              className="accent-emerald-500"
            />
            <span className="text-sm font-medium text-zinc-900">{plan.label}</span>
            {currentPlan === plan.id && (
              <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500">
                Current
              </span>
            )}
          </label>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={selectedPlan === currentPlan || status === "saving"}
        >
          {status === "saving" ? "Switching..." : "Switch plan"}
        </Button>

        {status === "success" && (
          <span className="text-sm font-medium text-emerald-600">
            Plan updated successfully.
          </span>
        )}
        {status === "error" && (
          <span className="text-sm font-medium text-red-600">{errorMessage}</span>
        )}
      </div>
    </form>
  );
}
