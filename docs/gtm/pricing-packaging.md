# Pricing And Packaging

- Owner: Founder / Product Marketing
- Status: Draft v2 — Early Access Launch
- Last Reviewed: 2026-02-28
- Linked ADRs: [ADR-0001](../adr/ADR-0001-tech-stack.md)
- Linked API References: [OpenAPI v1](../api/openapi.yaml)

## Plan Structure

### Full Price (after all features ship)

| Plan | Monthly | Annual (per month) | MRR Cap |
|------|---------|-------------------|---------|
| Starter | $49/mo | $39/mo | Up to $10k MRR |
| Pro | $149/mo | $124/mo | Up to $50k MRR |
| Scale | $299/mo | $249/mo | Up to $200k MRR |
| Enterprise | Custom | Custom | Above $200k MRR |

### Early Access Pricing (current — launch phase)

| Plan | Monthly | Annual (per month) | Discount |
|------|---------|-------------------|----------|
| Starter | **$29/mo** | **$23/mo** | 40% off |
| Pro | **$99/mo** | **$79/mo** | 34% off |
| Scale | **$199/mo** | **$159/mo** | 33% off |

## Feature Packaging

### Feature Status Legend
- **Live** — built and shipping today
- **Coming Q2** — actively in development, expected Q2 2026

### Starter ($29/mo early access → $49/mo full)
| Feature | Status |
|---------|--------|
| Automated payment recovery | Live |
| Pre-dunning alerts (expiring cards) | Live |
| 3-step email sequence | Live |
| Recovery dashboard & metrics | Live |
| Stripe integration | Live |
| Email support | Live |

### Pro ($99/mo early access → $149/mo full) — everything in Starter, plus:
| Feature | Status |
|---------|--------|
| Unlimited sequence steps | Coming Q2 |
| Custom email branding | Coming Q2 |
| Slack & Discord alerts | Coming Q2 |
| Priority email support | Live |

### Scale ($199/mo early access → $299/mo full) — everything in Pro, plus:
| Feature | Status |
|---------|--------|
| White-label payment update page | Coming Q2 |
| Advanced analytics & exports | Coming Q2 |
| API access | Coming Q2 |
| Dedicated onboarding | Live |

### Enterprise (custom) — everything in Scale, plus:
- SLA guarantees
- Custom integrations
- Dedicated account manager

## Early Access Transition Rules

### Monthly subscribers
- Rate locked at early access price until ALL "Coming Q2" features ship
- 60 days advance notice before price increases to full rate
- New features are available immediately upon launch

### Annual subscribers
- Rate locked for the full 12-month billing period regardless of when features ship
- New features included at no extra cost when they launch mid-term
- **Founding member perk**: at renewal, annual early access subscribers receive a permanent 20% discount on the full price

### Founding member permanent rates (annual renewal)

| Plan | Full Price | Founding Member Rate | Savings |
|------|-----------|---------------------|---------|
| Starter | $49/mo | $39/mo | $120/yr |
| Pro | $149/mo | $119/mo | $360/yr |
| Scale | $299/mo | $239/mo | $720/yr |

## Pricing Principles
1. ROI-first framing: recovered revenue should clearly exceed plan cost (10-30x target).
2. Flat-rate pricing — no percentage of recovered revenue. Every dollar recovered is 100% the customer's.
3. Transparent feature boundaries by plan with clear "live" vs "coming" status.
4. Upgrade path aligned with customer MRR growth.
5. 14-day free trial on all plans, no credit card required.
6. Annual billing with additional discount on top of early access pricing.
7. Early adopters are rewarded, not punished — founding member discount at renewal.

## Competitive Positioning
- **vs. Churnkey** ($250-990/mo): DunningDog is 2-8x cheaper at early access, 2-5x at full price.
- **vs. Baremetrics Recover** ($158-499/mo): Comparable features, lower price even at full rate.
- **vs. Churn Buster** ($249+/mo): Focused on indie/small SaaS, not enterprise.
- **vs. Stripe built-in**: Pre-dunning, custom sequences, and dashboard that Stripe doesn't offer.

## Acceptance Criteria
1. Packaging aligns with MVP scope and implementation constraints.
2. Billing behavior is testable using Stripe test mode.
3. 14-day trial period before first charge.
4. "Coming Q2" features clearly labeled on pricing page and in-app.
5. Early access banner visible on pricing page.
