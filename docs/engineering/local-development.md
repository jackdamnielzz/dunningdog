# Local Development Guide

- Owner: Founding Engineer
- Status: Draft v1
- Last Reviewed: 2026-02-17
- Linked ADRs: [ADR-0001](../adr/ADR-0001-tech-stack.md), [ADR-0003](../adr/ADR-0003-job-orchestration.md)
- Linked API References: [OpenAPI v1](../api/openapi.yaml), [Error Model](../api/error-model.md)

## Prerequisites
1. Node.js 22 LTS.
2. pnpm 9+.
3. Supabase project (dev).
4. Stripe test account and webhook secret.
5. Resend test API key.
6. Inngest dev environment.

## Environment Variables (Minimum)
1. `NEXTAUTH_URL` (or app URL if using Supabase session only).
2. `SUPABASE_URL`
3. `SUPABASE_ANON_KEY`
4. `SUPABASE_SERVICE_ROLE_KEY`
5. `DATABASE_URL`
6. `STRIPE_SECRET_KEY`
7. `STRIPE_WEBHOOK_SECRET`
8. `STRIPE_CONNECT_CLIENT_ID`
9. `RESEND_API_KEY`
10. `INNGEST_EVENT_KEY`
11. `INNGEST_SIGNING_KEY`
12. `SENTRY_DSN`
13. `POSTHOG_KEY`

## Standard Local Workflow
1. Install dependencies.
2. Generate Prisma client and run local migrations.
3. Start Next.js dev server.
4. Start Inngest dev server.
5. Run Stripe CLI webhook forwarding.
6. Execute unit/integration tests before committing.

## Seed Data
1. One default workspace.
2. One connected Stripe test account.
3. One default dunning sequence.
4. Sample recovery attempts for dashboard rendering.

## Acceptance Criteria
1. A new engineer can run app + jobs + webhook ingestion in under 30 minutes.
2. Required env vars are documented and complete.

## Non-Goals
1. Production-like autoscaling simulation in local environment.
2. Full multi-region local emulation.
