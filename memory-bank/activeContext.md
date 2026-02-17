# Active Context — DunningDog

**Last updated:** 2026-02-17

## What is DunningDog?

DunningDog is a **Stripe-first failed-payment recovery SaaS** for indie SaaS founders and small subscription businesses ($500–$20K MRR). It layers on top of Stripe's native Smart Retries to recover the ~43% of failed payments that Stripe doesn't catch automatically.

## Current State

The project is in **late MVP development**. The core architecture, database schema, all services, API routes, and UI pages are built. The app runs in a "demo mode" with fallback data when no real database/Stripe credentials are configured.

### What's Working
- Full Next.js 15 App Router scaffold with TypeScript
- Prisma schema with 11 models (Workspace, RecoveryAttempt, DunningSequence, etc.)
- Stripe OAuth connect flow (start + callback)
- Stripe webhook ingestion (4 event types, idempotent)
- Recovery service (decline classification, recovery attempt tracking)
- Dunning sequence CRUD with Zod validation
- Inngest-powered dunning orchestration (3 background functions)
- Pre-dunning scan (14-day card expiration detection)
- Email service via Resend with audit trail
- Dashboard with KPI summary cards and recovery table
- Metric snapshot generation (monthly aggregation)
- Marketing pages (landing, pricing, docs)
- Demo/fallback mode for development without external services
- Workspace-aware app pages and API routes (no more hardcoded workspace IDs in dashboard flows)
- DunningDog billing flow in settings (plan selection + checkout initiation + plan persistence)
- CI workflow (`.github/workflows/ci.yml`) with quality gates
- Server-side observability hooks for Sentry errors and PostHog milestone events
- Expanded automated test suite (10 files / 26 tests)

### What Needs Work
- **Supabase auth session validation in browser**: backend workspace resolution is wired, but still needs full browser/session flow validation with real Supabase project settings
- **Hosted payment update page**: API endpoint exists and logic is in place, but real Stripe Billing Portal integration still needs full sandbox validation
- **Coverage target gap**: coverage improved significantly, but still below the stated ≥85% service target
- **Observability maturity**: lightweight HTTP reporting is active, but full SDK features (release health, richer client telemetry) are not yet enabled

### What's Not Started (Post-MVP)
- Paddle / Lemon Squeezy integrations
- In-app JavaScript payment update widget
- Slack/Discord notifications
- A/B testing for email sequences
- Cancellation save / pause flows

## Current Focus

The immediate priorities before MVP launch are:
1. Execute real end-to-end Stripe + Supabase validation runs (OAuth → webhooks → dunning → recovery)
2. Raise service-layer coverage to the ≥85% target
3. Harden observability from lightweight hooks to full production telemetry posture

## Tech Stack Quick Reference

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 App Router + TypeScript |
| UI | shadcn/ui + Tailwind CSS 4 |
| Database | PostgreSQL 16 (Supabase) + Prisma 6 |
| Auth | Supabase Auth |
| Payments | Stripe (OAuth Connect + Webhooks) |
| Email | Resend |
| Background Jobs | Inngest |
| Cron | Vercel Cron |
| Hosting | Vercel |
| Testing | Vitest |
| Package Manager | pnpm 9+ |

## Key Architecture Decisions

- **ADR-0001**: Next.js + Prisma + Supabase + Vercel monolith (simplicity for solo dev)
- **ADR-0002**: Multi-tenant via `workspace_id` on every record (no cross-workspace joins)
- **ADR-0003**: Inngest for event-driven dunning orchestration with idempotent steps
