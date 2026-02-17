import type { DashboardSummaryDTO, WorkspaceDTO, DeclineType, RecoveryStatus } from "@/types/domain";
import { DEFAULT_WORKSPACE_ID, DEFAULT_WORKSPACE_NAME } from "@/lib/constants";

export function getDemoWorkspace(
  workspaceId = DEFAULT_WORKSPACE_ID,
): WorkspaceDTO {
  return {
    id: workspaceId,
    name:
      workspaceId === DEFAULT_WORKSPACE_ID
        ? DEFAULT_WORKSPACE_NAME
        : `Demo Workspace (${workspaceId})`,
    ownerUserId: "demo-owner",
    timezone: "UTC",
    billingPlan: "starter",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function getDemoDashboardSummary(
  workspaceId = DEFAULT_WORKSPACE_ID,
  window: DashboardSummaryDTO["window"] = "month",
): DashboardSummaryDTO {
  return {
    workspaceId,
    window,
    failedRevenueCents: 12800,
    recoveredRevenueCents: 6400,
    recoveryRate: 50,
    atRiskCount: 3,
    activeSequences: 1,
    generatedAt: new Date().toISOString(),
  };
}

type RecoveryAttemptLike = {
  id: string;
  workspaceId: string;
  stripeInvoiceId: string;
  stripeCustomerId: string;
  declineType: DeclineType;
  status: RecoveryStatus;
  amountDueCents: number;
  recoveredAmountCents: number | null;
  startedAt: Date;
  endedAt: Date | null;
  outcomes: Array<{
    id: string;
    workspaceId: string;
    recoveryAttemptId: string;
    outcome: "recovered" | "failed" | "abandoned";
    reasonCode: string | null;
    occurredAt: Date;
  }>;
};

export function getDemoRecoveryAttempts(): RecoveryAttemptLike[] {
  const startedAt = new Date();
  const resolved = new Date(startedAt.getTime() + 24 * 60 * 60 * 1000);

  return [
    {
      id: `demo-recovery-${DEFAULT_WORKSPACE_ID}-1`,
      workspaceId: DEFAULT_WORKSPACE_ID,
      stripeInvoiceId: "in_1N9K0ABCDE0001",
      stripeCustomerId: "cus_ABC123XYZ",
      declineType: "soft",
      status: "recovered",
      amountDueCents: 12900,
      recoveredAmountCents: 12900,
      startedAt,
      endedAt: resolved,
      outcomes: [
        {
          id: `demo-recovery-outcome-${DEFAULT_WORKSPACE_ID}-1`,
          workspaceId: DEFAULT_WORKSPACE_ID,
          recoveryAttemptId: `demo-recovery-${DEFAULT_WORKSPACE_ID}-1`,
          outcome: "recovered",
          reasonCode: null,
          occurredAt: resolved,
        },
      ],
    },
    {
      id: `demo-recovery-${DEFAULT_WORKSPACE_ID}-2`,
      workspaceId: DEFAULT_WORKSPACE_ID,
      stripeInvoiceId: "in_1N9K0ABCDE0002",
      stripeCustomerId: "cus_DEF456UVW",
      declineType: "hard",
      status: "failed",
      amountDueCents: 8900,
      recoveredAmountCents: null,
      startedAt: new Date(startedAt.getTime() - 2 * 24 * 60 * 60 * 1000),
      endedAt: null,
      outcomes: [
        {
          id: `demo-recovery-outcome-${DEFAULT_WORKSPACE_ID}-2`,
          workspaceId: DEFAULT_WORKSPACE_ID,
          recoveryAttemptId: `demo-recovery-${DEFAULT_WORKSPACE_ID}-2`,
          outcome: "failed",
          reasonCode: "insufficient_funds",
          occurredAt: new Date(startedAt.getTime() - 24 * 60 * 60 * 1000),
        },
      ],
    },
  ];
}

export function getDemoSequence(workspaceId = DEFAULT_WORKSPACE_ID) {
  return {
    id: `demo-sequence-${workspaceId}`,
    workspaceId,
    name: "Default Recovery Sequence",
    isEnabled: true,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    steps: [
      {
        id: `demo-step-${workspaceId}-1`,
        stepOrder: 1,
        delayHours: 0,
        subjectTemplate: "Action needed: update your payment details",
        bodyTemplate:
          "We could not process your recent payment. Please update your payment method to avoid subscription interruption.",
        status: "scheduled",
      },
      {
        id: `demo-step-${workspaceId}-2`,
        stepOrder: 2,
        delayHours: 72,
        subjectTemplate: "Reminder: your payment is still pending",
        bodyTemplate:
          "Your subscription is still at risk because payment details were not updated. Please review and update now.",
        status: "scheduled",
      },
      {
        id: `demo-step-${workspaceId}-3`,
        stepOrder: 3,
        delayHours: 168,
        subjectTemplate: "Final reminder before access is affected",
        bodyTemplate:
          "Please update your payment method now to keep your subscription active.",
        status: "scheduled",
      },
    ],
  };
}

export function getDemoConnectedStripeAccount(workspaceId = DEFAULT_WORKSPACE_ID) {
  return {
    id: `demo-connected-account-${workspaceId}`,
    workspaceId,
    stripeAccountId: "acct_demo_000000000000",
    livemode: false,
    scopes: ["read_write"],
    connectedAt: new Date(),
    disconnectedAt: null,
  };
}
