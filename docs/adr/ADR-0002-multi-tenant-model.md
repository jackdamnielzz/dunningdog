# ADR-0002: Multi-Tenant Workspace Isolation Model

- Owner: Founding Engineer
- Status: Accepted
- Last Reviewed: 2026-02-17
- Linked ADRs: [ADR-0001](./ADR-0001-tech-stack.md), [ADR-0003](./ADR-0003-job-orchestration.md)
- Linked API References: [OpenAPI v1](../api/openapi.yaml), [Webhook Contracts](../api/webhook-contracts.md)

## Context
DunningDog processes sensitive billing events for many independent businesses. Tenant boundaries must be explicit and enforced by data model and service logic.

## Decision
Use a strict workspace model:
1. Every business account maps to one `Workspace`.
2. Every record includes `workspace_id` unless globally shared.
3. Stripe connected account mapping is unique per workspace.
4. API authorization resolves workspace membership before any query.
5. Background jobs carry `workspace_id` in payload and idempotency key.

## Data Isolation Rules
1. No cross-workspace joins in runtime query paths.
2. Dashboard metrics are calculated only from workspace-scoped records.
3. Stripe webhook processing first resolves workspace via Stripe account ID.
4. Disconnecting Stripe revokes token and blocks new jobs for that workspace.

## Consequences
- Predictable tenant isolation and easier incident containment.
- Slight schema verbosity due to required tenant keys on domain tables.

## Rejected Alternatives
1. Shared global event tables without workspace keys.
2. Single-user model without workspaces.

## Acceptance Criteria
1. Domain and data model docs show `workspace_id` on tenant-bound entities.
2. API contracts and webhook handling describe workspace resolution.
3. Test strategy includes cross-tenant isolation tests.

## Non-Goals
1. Multi-region data residency policy for MVP.
2. Complex role matrix beyond owner and admin roles.
