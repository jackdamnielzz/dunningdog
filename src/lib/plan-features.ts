import type { BillingPlan } from "@prisma/client";
import { db } from "@/lib/db";
import { ProblemError } from "@/lib/problem";

export type PlanFeature =
  | "unlimited_steps"
  | "email_branding"
  | "notifications"
  | "white_label"
  | "api_access"
  | "csv_export";

export const PLAN_FEATURES: Record<BillingPlan, PlanFeature[]> = {
  starter: ["csv_export"],
  pro: ["csv_export", "unlimited_steps", "email_branding", "notifications"],
  growth: [
    "csv_export",
    "unlimited_steps",
    "email_branding",
    "notifications",
    "white_label",
    "api_access",
  ],
};

export function planHasFeature(
  plan: BillingPlan,
  feature: PlanFeature,
): boolean {
  return PLAN_FEATURES[plan]?.includes(feature) ?? false;
}

export function maxSequenceSteps(plan: BillingPlan): number {
  return planHasFeature(plan, "unlimited_steps") ? 20 : 3;
}

const FEATURE_LABELS: Record<PlanFeature, string> = {
  unlimited_steps: "Unlimited sequence steps",
  email_branding: "Custom email branding",
  notifications: "Slack & Discord alerts",
  white_label: "White-label payment page",
  api_access: "API access",
  csv_export: "Analytics & CSV exports",
};

function minimumPlanForFeature(feature: PlanFeature): string {
  if (PLAN_FEATURES.starter.includes(feature)) return "Starter";
  if (PLAN_FEATURES.pro.includes(feature)) return "Pro";
  return "Scale";
}

export async function requireFeature(
  workspaceId: string,
  feature: PlanFeature,
): Promise<void> {
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    select: { billingPlan: true },
  });

  if (!workspace) {
    throw new ProblemError({
      title: "Workspace not found",
      status: 404,
      code: "WORKSPACE_NOT_FOUND",
      detail: `Workspace ${workspaceId} does not exist.`,
    });
  }

  if (!planHasFeature(workspace.billingPlan, feature)) {
    const minPlan = minimumPlanForFeature(feature);
    throw new ProblemError({
      title: "Feature not available",
      status: 403,
      code: "FEATURE_NOT_AVAILABLE",
      detail: `${FEATURE_LABELS[feature]} requires the ${minPlan} plan or higher. Current plan: ${workspace.billingPlan}.`,
    });
  }
}
