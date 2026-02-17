# User Personas

- Owner: Product
- Status: Draft v1
- Last Reviewed: 2026-02-17
- Linked ADRs: [ADR-0001](../adr/ADR-0001-tech-stack.md), [ADR-0002](../adr/ADR-0002-multi-tenant-model.md)
- Linked API References: [OpenAPI v1](../api/openapi.yaml)

## Persona 1: Indie Ian
- Profile: Solo founder, 500 USD to 20,000 USD MRR, technical enough for self-serve tools.
- Pain: Loses revenue silently from failed payments and has no time for manual follow-up.
- Jobs To Be Done:
  1. Connect Stripe quickly.
  2. Enable automated recovery without daily maintenance.
  3. See exact recovered dollars and ROI.
- Product Expectations:
  1. Setup under 5 minutes.
  2. No complex workflow builder needed.
  3. Clear "money saved" dashboard.

## Persona 2: Creator Cara
- Profile: Membership/course/newsletter creator, 1,000 USD to 10,000 USD MRR.
- Pain: Subscriber payment failures create support load and silent churn.
- Jobs To Be Done:
  1. Send clear and friendly payment update emails.
  2. Let subscribers update cards with minimal friction.
  3. Reduce support tickets related to failed charges.
- Product Expectations:
  1. Branded message tone.
  2. Mobile-friendly payment update experience.
  3. Simple weekly check-in dashboard.

## Shared Behavioral Traits
1. Budget sensitive but ROI driven.
2. Prefers practical automation over complex analytics.
3. Wants trustworthy handling of billing data.

## Acceptance Criteria
1. Journeys in `docs/product/user-journeys.md` reference these personas directly.
2. Copy guidance in `docs/product/copy-guidelines.md` aligns tone to these personas.

## Non-Goals
1. Enterprise procurement or compliance-heavy personas.
2. Non-subscription ecommerce personas.
