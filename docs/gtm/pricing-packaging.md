# Pricing And Packaging

- Owner: Founder / Product Marketing
- Status: Draft v1
- Last Reviewed: 2026-02-17
- Linked ADRs: [ADR-0001](../adr/ADR-0001-tech-stack.md)
- Linked API References: [OpenAPI v1](../api/openapi.yaml)

## Plan Structure (MVP)
1. Starter: 29 USD/month, up to 5k MRR tracked.
2. Pro: 49 USD/month, up to 20k MRR tracked.
3. Growth: 79 USD/month, up to 50k MRR tracked.

## Feature Packaging
1. Starter:
   - pre-dunning alerts,
   - 3-step sequence,
   - hosted payment page with DunningDog branding,
   - basic dashboard.
2. Pro:
   - 5-step customizable sequence,
   - custom branding,
   - full analytics,
   - Slack/Discord alerts.
3. Growth:
   - unlimited sequence steps,
   - white-label hosted page,
   - advanced export/reporting,
   - onboarding call.

## Pricing Principles
1. ROI-first framing: recovered revenue should clearly exceed plan cost.
2. Transparent feature boundaries by plan.
3. Upgrade path aligned with customer MRR growth.

## Future Option (Post-MVP)
Performance-based pricing experiment (percentage of recovered revenue).

## Acceptance Criteria
1. Packaging aligns with MVP scope and implementation constraints.
2. Billing behavior is testable using Stripe test mode.

## Non-Goals
1. Annual billing complexity before baseline monthly plans stabilize.
2. Regional pricing localization in MVP.
