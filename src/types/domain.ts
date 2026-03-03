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
  stripeCustomerId: string | null;
  billingSubscriptionId: string | null;
  billingStatus: string | null;
  trialEndsAt: string | null;
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

export interface DeclineBreakdownDTO {
  soft: { count: number; amountCents: number };
  hard: { count: number; amountCents: number };
}

export interface DashboardSummaryDTO {
  workspaceId: string;
  window: "7d" | "30d" | "90d" | "month" | "lifetime";
  failedRevenueCents: number;
  recoveredRevenueCents: number;
  recoveryRate: number;
  atRiskCount: number;
  activeSequences: number;
  declineBreakdown?: DeclineBreakdownDTO;
  generatedAt: string;
}

export interface ApiKeyDTO {
  id: string;
  prefix: string;
  label: string;
  scopes: string[];
  lastUsedAt: string | null;
  createdAt: string;
}

export interface ApiKeyCreateResponseDTO extends ApiKeyDTO {
  key: string;
}
