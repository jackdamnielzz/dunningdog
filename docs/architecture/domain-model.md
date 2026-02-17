# Domain Model (TypeScript Contracts)

- Owner: Founding Engineer
- Status: Draft v1
- Last Reviewed: 2026-02-17
- Linked ADRs: [ADR-0002](../adr/ADR-0002-multi-tenant-model.md), [ADR-0003](../adr/ADR-0003-job-orchestration.md)
- Linked API References: [OpenAPI v1](../api/openapi.yaml), [Error Model](../api/error-model.md)

## Shared Enums (Stable v1)
```ts
export type DeclineType = "soft" | "hard";
export type RecoveryStatus = "pending" | "recovered" | "failed" | "abandoned";
export type DunningStepStatus = "scheduled" | "sent" | "opened" | "clicked" | "converted";
```

## Core Types (Stable v1)
```ts
export interface Workspace {
  id: string;
  name: string;
  ownerUserId: string;
  timezone: string; // IANA timezone, default UTC
  billingPlan: "starter" | "pro" | "growth";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectedStripeAccount {
  id: string;
  workspaceId: string;
  stripeAccountId: string;
  livemode: boolean;
  scopes: string[];
  connectedAt: string;
  disconnectedAt?: string;
}

export interface SubscriptionAtRisk {
  id: string;
  workspaceId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  reason: "card_expiring" | "payment_failed";
  riskDetectedAt: string;
  expirationDate?: string;
  activeRecoveryAttemptId?: string;
}

export interface DunningSequence {
  id: string;
  workspaceId: string;
  name: string;
  isEnabled: boolean;
  steps: DunningSequenceStep[];
  createdAt: string;
  updatedAt: string;
}

export interface DunningSequenceStep {
  id: string;
  delayHours: number;
  subjectTemplate: string;
  bodyTemplate: string;
  status: DunningStepStatus;
}

export interface RecoveryAttempt {
  id: string;
  workspaceId: string;
  stripeInvoiceId: string;
  stripeCustomerId: string;
  declineType: DeclineType;
  status: RecoveryStatus;
  amountDueCents: number;
  recoveredAmountCents?: number;
  startedAt: string;
  endedAt?: string;
}

export interface RecoveryOutcome {
  id: string;
  workspaceId: string;
  recoveryAttemptId: string;
  outcome: "recovered" | "failed" | "abandoned";
  reasonCode?: string;
  occurredAt: string;
}

export interface MetricSnapshot {
  id: string;
  workspaceId: string;
  periodStart: string;
  periodEnd: string;
  failedRevenueCents: number;
  recoveredRevenueCents: number;
  recoveryRate: number;
  atRiskCount: number;
  generatedAt: string;
}
```

## Domain Invariants
1. `RecoveryAttempt` belongs to exactly one workspace.
2. At most one active `RecoveryAttempt` per invoice at a time.
3. `MetricSnapshot` is immutable once published.
4. Sequence steps are versioned when edited during active attempts.

## Acceptance Criteria
1. OpenAPI schemas are structurally aligned with these contracts.
2. Testing strategy includes coverage for each enum transition.

## Non-Goals
1. Public SDK type publishing in MVP.
2. Cross-workspace aggregate domain objects in MVP.
