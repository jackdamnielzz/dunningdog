# ADR-0001: Lock MVP Technical Stack

- Owner: Founding Engineer
- Status: Accepted
- Last Reviewed: 2026-02-17
- Linked ADRs: [ADR-0002](./ADR-0002-multi-tenant-model.md), [ADR-0003](./ADR-0003-job-orchestration.md)
- Linked API References: [OpenAPI v1](../api/openapi.yaml), [Error Model](../api/error-model.md)

## Context
DunningDog needs a fast-to-market stack that supports:
- secure Stripe OAuth and webhook processing,
- multi-tenant SaaS data isolation,
- event-driven dunning orchestration,
- low-ops deployment for a small team.

## Decision
MVP stack is fixed as:
1. `Next.js 15 App Router` + `TypeScript` for frontend and backend.
2. `shadcn/ui` + `Tailwind CSS` for UI system.
3. `Vercel` for hosting (Preview + Production).
4. `Supabase Postgres` + `Supabase Auth` for persistence and identity.
5. `Prisma` as ORM.
6. `Stripe` for both customer payment integration and DunningDog billing.
7. `Resend` for transactional dunning email.
8. `Inngest` + `Vercel Cron` for background orchestration.
9. `Sentry` + structured logs for observability.
10. `PostHog` for product analytics.

## Consequences
- Faster implementation due to single runtime and unified deployment model.
- Vendor coupling to Vercel/Supabase/Stripe is accepted for MVP speed.
- Queue-heavy workflows must be designed for idempotent serverless execution.

## Rejected Alternatives
1. Split frontend and backend services at MVP stage.
2. Self-managed Postgres and auth stack.
3. Redis/BullMQ-first queue stack for initial release.

## Acceptance Criteria
1. All architecture and engineering docs align to this stack.
2. No document proposes conflicting primary runtime or hosting choices.

## Non-Goals
1. Benchmarking all possible framework alternatives.
2. Defining multi-cloud strategy for MVP.
