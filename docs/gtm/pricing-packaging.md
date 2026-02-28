# Pricing And Packaging

- Owner: Founder / Product Marketing
- Status: Draft v1
- Last Reviewed: 2026-02-17
- Linked ADRs: [ADR-0001](../adr/ADR-0001-tech-stack.md)
- Linked API References: [OpenAPI v1](../api/openapi.yaml)

## Plan Structure

| Plan | Monthly | Annual (per month) | MRR Cap |
|------|---------|-------------------|---------|
| Starter | $49/mo | $39/mo | Up to $10k MRR |
| Pro | $149/mo | $124/mo | Up to $50k MRR |
| Scale | $299/mo | $249/mo | Up to $200k MRR |
| Enterprise | Custom | Custom | Above $200k MRR |

## Feature Packaging

1. **Starter** ($49/mo):
   - Automated payment recovery
   - Pre-dunning alerts (expiring cards)
   - 3-step email sequence
   - Recovery dashboard & metrics
   - Stripe integration
   - Email support

2. **Pro** ($149/mo) — everything in Starter, plus:
   - Unlimited sequence steps
   - Custom email branding
   - Slack & Discord alerts
   - Priority email support

3. **Scale** ($299/mo) — everything in Pro, plus:
   - White-label payment update page
   - Advanced analytics & exports
   - API access
   - Dedicated onboarding

4. **Enterprise** (custom) — everything in Scale, plus:
   - SLA guarantees
   - Custom integrations
   - Dedicated account manager

## Pricing Principles
1. ROI-first framing: recovered revenue should clearly exceed plan cost (10-30x target).
2. Flat-rate pricing — no percentage of recovered revenue. Every dollar recovered is 100% the customer's.
3. Transparent feature boundaries by plan.
4. Upgrade path aligned with customer MRR growth.
5. 14-day free trial on all plans, no credit card required.
6. Annual billing with 2 months free (17% discount).

## Competitive Positioning
- **vs. Churnkey** ($250-990/mo): DunningDog is 2-5x cheaper at every tier.
- **vs. Baremetrics Recover** ($158-499/mo): Comparable features, lower price.
- **vs. Churn Buster** ($249+/mo): Focused on indie/small SaaS, not enterprise.
- **vs. Stripe built-in**: Pre-dunning, custom sequences, and dashboard that Stripe doesn't offer.

## Acceptance Criteria
1. Packaging aligns with MVP scope and implementation constraints.
2. Billing behavior is testable using Stripe test mode.
3. 14-day trial period before first charge.
