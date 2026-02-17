export type DeclineType = "soft" | "hard";
export type RecoveryStatus = "pending" | "recovered" | "failed" | "abandoned";
export type DunningStepStatus =
  | "scheduled"
  | "sent"
  | "opened"
  | "clicked"
  | "converted";

export interface WorkspaceDTO {
  id: string;
  name: string;
  ownerUserId: string;
  timezone: string;
  billingPlan: "starter" | "pro" | "growth";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectedStripeAccountDTO {
  id: string;
  workspaceId: string;
  stripeAccountId: string;
  livemode: boolean;
  scopes: string[];
  connectedAt: string;
  disconnectedAt?: string;
}

export interface DashboardSummaryDTO {
  workspaceId: string;
  window: "7d" | "30d" | "90d" | "month" | "lifetime";
  failedRevenueCents: number;
  recoveredRevenueCents: number;
  recoveryRate: number;
  atRiskCount: number;
  activeSequences: number;
  generatedAt: string;
}
