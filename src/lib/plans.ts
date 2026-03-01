import type { BillingPlan } from "@prisma/client";

export interface PlanTier {
  id: BillingPlan;
  name: string;
  earlyMonthly: number;
  fullMonthly: number;
  earlyAnnualPerMonth: number;
  fullAnnualPerMonth: number;
  cap: string;
  description: string;
}

export const PLAN_TIERS: PlanTier[] = [
  {
    id: "starter",
    name: "Starter",
    earlyMonthly: 29,
    fullMonthly: 49,
    earlyAnnualPerMonth: 23,
    fullAnnualPerMonth: 39,
    cap: "Up to $10k MRR",
    description: "For early-stage SaaS teams recovering their first failed payments.",
  },
  {
    id: "pro",
    name: "Pro",
    earlyMonthly: 99,
    fullMonthly: 149,
    earlyAnnualPerMonth: 79,
    fullAnnualPerMonth: 124,
    cap: "Up to $50k MRR",
    description: "For growing teams that need full control over their dunning strategy.",
  },
  {
    id: "growth",
    name: "Scale",
    earlyMonthly: 199,
    fullMonthly: 299,
    earlyAnnualPerMonth: 159,
    fullAnnualPerMonth: 249,
    cap: "Up to $200k MRR",
    description: "For established SaaS businesses maximizing every dollar of revenue.",
  },
];

export function getPlanTier(id: BillingPlan): PlanTier {
  return PLAN_TIERS.find((t) => t.id === id) ?? PLAN_TIERS[0];
}
