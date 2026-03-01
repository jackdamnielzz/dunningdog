import type { BillingPlan } from "@prisma/client";

export interface PlanTier {
  id: BillingPlan;
  name: string;
  monthly: number;
  annualPerMonth: number;
  cap: string;
  description: string;
}

export const PLAN_TIERS: PlanTier[] = [
  {
    id: "starter",
    name: "Starter",
    monthly: 49,
    annualPerMonth: 41,
    cap: "Up to $10k MRR",
    description: "For early-stage SaaS teams recovering their first failed payments.",
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 149,
    annualPerMonth: 125,
    cap: "Up to $50k MRR",
    description: "For growing teams that need full control over their dunning strategy.",
  },
  {
    id: "growth",
    name: "Scale",
    monthly: 199,
    annualPerMonth: 169,
    cap: "Up to $200k MRR",
    description: "For established SaaS businesses maximizing every dollar of revenue.",
  },
];

export function getPlanTier(id: BillingPlan): PlanTier {
  return PLAN_TIERS.find((t) => t.id === id) ?? PLAN_TIERS[0];
}
