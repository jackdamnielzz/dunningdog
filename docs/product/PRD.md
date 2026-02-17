# Product Requirements Document (PRD): DunningDog MVP

- Owner: Product + Founding Engineer
- Status: Draft v1
- Last Reviewed: 2026-02-17
- Linked ADRs: [ADR-0001](../adr/ADR-0001-tech-stack.md), [ADR-0002](../adr/ADR-0002-multi-tenant-model.md), [ADR-0003](../adr/ADR-0003-job-orchestration.md)
- Linked API References: [OpenAPI v1](../api/openapi.yaml), [Webhook Contracts](../api/webhook-contracts.md)

## Problem Statement
Indie SaaS founders and creators lose measurable recurring revenue to involuntary churn from failed payments. Stripe covers part of recovery, but users need pre-dunning, branded messaging, and clearer recovery analytics.

## Product Goal
Recover failed subscription revenue with a setup flow under 5 minutes and measurable monthly ROI.

## Primary Users
1. Solo/Small SaaS founders using Stripe.
2. Creators with recurring subscription businesses using Stripe.

## MVP Outcomes
1. User can connect Stripe account via OAuth.
2. System automatically detects failed payments and at-risk cards.
3. System sends configurable dunning sequence emails.
4. End customer can update payment method via hosted secure page.
5. Dashboard shows recovery progress and recovered revenue.

## Functional Requirements
1. Stripe OAuth connect/disconnect lifecycle.
2. Webhook ingestion with signature verification and idempotency.
3. Pre-dunning scan for cards expiring in 14 days.
4. Dunning sequence engine with configurable steps.
5. Recovery dashboard with core KPIs.
6. Workspace-level settings for branding and sender identity.

## Non-Functional Requirements
1. Multi-tenant workspace isolation.
2. Idempotent event processing.
3. Auditability for outbound email and retry decisions.
4. Observable runtime with actionable alerts.

## Success Metrics
1. Recovery rate >= 65% on failed payment revenue (target).
2. Time-to-value under 5 minutes.
3. Trial-to-paid >= 25% after MVP launch period.

## Acceptance Criteria
1. All MVP features in `docs/product/MVP-scope.md` are mapped to architecture and API docs.
2. Every user journey has at least one test scenario in `docs/engineering/testing-strategy.md`.
3. Dashboard metric definitions are consistent with `docs/architecture/dashboard-metrics.md`.

## Non-Goals
1. Paddle and Lemon Squeezy support in MVP.
2. Full voluntary churn/cancellation save flows in MVP.
3. Enterprise-grade workflow customization and role matrix in MVP.
