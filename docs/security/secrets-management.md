# Secrets Management

- Owner: Security Lead (Interim: Founding Engineer)
- Status: Draft v1
- Last Reviewed: 2026-02-17
- Linked ADRs: [ADR-0001](../adr/ADR-0001-tech-stack.md), [ADR-0003](../adr/ADR-0003-job-orchestration.md)
- Linked API References: [Webhook Contracts](../api/webhook-contracts.md), [Error Model](../api/error-model.md)

## Secret Inventory
1. Stripe secret key and webhook secret.
2. Stripe Connect client secret.
3. Supabase service role key.
4. Resend API key.
5. Inngest signing/event keys.
6. Sentry auth tokens (if CI uses release APIs).
7. PostHog ingest keys.

## Storage Rules
1. Secrets live in Vercel environment variables by environment.
2. Local development uses `.env.local` excluded from version control.
3. No secrets in code, docs examples, or build artifacts.

## Rotation Policy
1. Rotate high-risk secrets quarterly or after incident.
2. Immediate rotation on suspected leak.
3. Stripe webhook secret rotation requires dual-validation rollout plan.

## Access Policy
1. Production secrets access limited to owner and one backup maintainer.
2. CI receives least-privilege tokens only.

## Verification
1. Pre-release check confirms required secrets are present.
2. Runtime startup checks fail fast when mandatory secrets are missing.

## Acceptance Criteria
1. Secret inventory covers all providers used by MVP stack.
2. Rotation and incident references align with incident response doc.

## Non-Goals
1. Dedicated secrets manager migration before MVP.
2. Automated secret rotation pipeline in MVP.
