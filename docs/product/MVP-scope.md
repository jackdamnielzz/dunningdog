# MVP Scope Definition

- Owner: Product + Founding Engineer
- Status: Draft v1
- Last Reviewed: 2026-02-17
- Linked ADRs: [ADR-0001](../adr/ADR-0001-tech-stack.md), [ADR-0003](../adr/ADR-0003-job-orchestration.md)
- Linked API References: [OpenAPI v1](../api/openapi.yaml), [Error Model](../api/error-model.md)

## In Scope (Must Ship)
1. Workspace onboarding and Stripe OAuth connect.
2. Stripe webhook processing for:
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `payment_method.automatically_updated`
3. Pre-dunning detection (14-day expiration window).
4. Dunning sequence management:
   - create sequence,
   - update sequence,
   - send scheduled steps.
5. Hosted update payment session creation.
6. Dashboard: at-risk subscriptions, recovered revenue, recovery rate, active sequences.

## Should Ship (If Capacity Allows)
1. Simple sequence templates for common decline types.
2. Workspace-level sender branding configuration.
3. Recovery report monthly summary email.

## Out Of Scope (Explicitly Deferred)
1. Paddle integration.
2. Lemon Squeezy integration.
3. In-app JavaScript payment update widget.
4. A/B testing engine for sequence copy.
5. Cancellation save and pause flows.

## Scope Guardrails
1. Any new feature not in "Must Ship" requires explicit change request.
2. Scope changes must include impact on launch date and testing matrix.

## Acceptance Criteria
1. Must Ship items map to endpoint contracts in `docs/api/openapi.yaml`.
2. Out-of-scope items are absent from implementation milestones.

## Non-Goals
1. Solving all churn categories (only involuntary failed-payment churn).
2. Building an analytics suite beyond recovery and delivery metrics.
