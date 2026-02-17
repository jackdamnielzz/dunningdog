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
1. `DEMO_MODE` (set to `false` for full integration checks).
2. `DATABASE_URL`
3. `APP_BASE_URL`
4. `NEXT_PUBLIC_APP_BASE_URL`
5. `ENCRYPTION_KEY`
6. `SUPABASE_URL`
7. `SUPABASE_ANON_KEY`
8. `SUPABASE_SERVICE_ROLE_KEY`
9. `STRIPE_SECRET_KEY`
10. `STRIPE_WEBHOOK_SECRET`
11. `STRIPE_CONNECT_CLIENT_ID`
12. `STRIPE_CONNECT_CLIENT_SECRET`
13. `RESEND_API_KEY`
14. `INNGEST_EVENT_KEY`
15. `INNGEST_SIGNING_KEY`
16. `SENTRY_DSN` (optional)
17. `POSTHOG_KEY` (optional)

## Standard Local Workflow
1. Install dependencies.
2. Copy `.env.example` to `.env.local` and fill required keys.
3. Set `DEMO_MODE=false` for real Stripe behavior.
4. Generate Prisma client and run migrations.
5. Start Next.js dev server.
6. Run Stripe CLI webhook forwarding for local testing:
   ```bash
   stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
   ```
   - If needed, include `--events` with supported event names from the checklist.
7. Start Inngest dev server if required for recovery workflows.
8. Execute unit/integration tests before committing.

## Seed Data
1. One default workspace.
2. One connected Stripe test account.
3. One default dunning sequence.
4. Sample recovery attempts for dashboard rendering.

## Acceptance Criteria
1. A new engineer can run app + jobs + webhook ingestion in under 30 minutes.
2. Required env vars are documented and complete.
3. OAuth connect and webhook intake both succeed and create or update records in connected account tables.

## Stripe Integration Test Checklist
1. Open `/app/settings` and click **Connect Stripe**.
2. Complete OAuth with a Stripe test account.
3. Confirm redirect to `/app/settings?connected=1` returns connected status.
4. Trigger or replay a Stripe test event (`invoice.payment_failed`) and confirm row appears in `/app/recoveries`.
5. Confirm webhook endpoint returns `200` in Stripe Dashboard delivery logs.

## Non-Goals
1. Production-like autoscaling simulation in local environment.
2. Full multi-region local emulation.
