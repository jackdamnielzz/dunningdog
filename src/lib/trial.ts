import { db } from "@/lib/db";
import { ProblemError } from "@/lib/problem";
import { TRIAL_DURATION_DAYS } from "@/lib/constants";

export type TrialStatus =
  | { state: "trialing"; daysRemaining: number; endsAt: Date }
  | { state: "expired" }
  | { state: "paid" }
  | { state: "none" };

export function getTrialStatus(workspace: {
  billingStatus: string | null;
  trialEndsAt: Date | string | null;
}): TrialStatus {
  if (workspace.billingStatus === "active") {
    return { state: "paid" };
  }

  if (!workspace.trialEndsAt) {
    return { state: "none" };
  }

  const endsAt = workspace.trialEndsAt instanceof Date
    ? workspace.trialEndsAt
    : new Date(workspace.trialEndsAt);

  const now = new Date();
  if (now < endsAt) {
    const msRemaining = endsAt.getTime() - now.getTime();
    const daysRemaining = Math.ceil(msRemaining / (24 * 60 * 60 * 1000));
    return {
      state: "trialing",
      daysRemaining: Math.min(daysRemaining, TRIAL_DURATION_DAYS),
      endsAt,
    };
  }

  return { state: "expired" };
}

export function isWorkspaceAccessible(status: TrialStatus): boolean {
  return status.state === "trialing" || status.state === "paid" || status.state === "none";
}

export async function requireActiveWorkspace(workspaceId: string): Promise<void> {
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    select: { billingStatus: true, trialEndsAt: true },
  });

  if (!workspace) return;

  const status = getTrialStatus(workspace);
  if (!isWorkspaceAccessible(status)) {
    throw new ProblemError({
      title: "Trial expired",
      status: 403,
      code: "TRIAL_EXPIRED",
      detail: "Your free trial has ended. Please choose a plan to continue.",
    });
  }
}
