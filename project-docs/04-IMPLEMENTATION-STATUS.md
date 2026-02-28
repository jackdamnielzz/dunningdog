# Implementation Status — DunningDog

**Last updated:** 2026-02-28

## Feature Completion Overview

| Feature | Completion | Notes |
|---------|-----------|-------|
| Build health baseline | 100% | `pnpm test -- --run`, `pnpm lint`, and `pnpm typecheck` all pass cleanly |
| Project scaffold & config | 100% | Next.js 15, TypeScript, pnpm, Tailwind, ESLint, Vitest |
| Database schema (Prisma) | 100% | 11 models, 9 enums, all indexes and constraints; billing fields (stripeCustomerId, billingSubscriptionId, billingStatus) added to Workspace |
| Domain types & DTOs | 100% | Shared enums, Zod schemas, dashboard DTOs |
| Environment validation | 100% | Zod-validated env vars with demo mode support |
| Production env gating | 100% | Production preflight enforces provider secrets, HTTPS URLs, secure key lengths (CRON_SECRET >= 32, ENCRYPTION_KEY >= 32), Stripe live-key prefix, DEMO_MODE=false, Sentry DSN, PostHog key, billing webhook secret |
| Stripe OAuth Connect | 100% | Start + callback routes, encrypted token storage |
| Stripe webhook ingestion | 95% | Signature verification + idempotent processing + request header/size hardening; still needs final live production webhook verification run |
| Recovery service | 100% | Decline classification, attempt upsert, success marking, emits `recovery/started` after failed invoice |
| Dunning sequence management | 100% | CRUD, Zod validation, versioning, transactional step replacement |
| Inngest background functions | 100% | 3 functions: dunning sequence, recovery finalize, pre-dunning notify |
| Pre-dunning detection | 100% | 14-day card expiration window scan via Vercel Cron + active Stripe scan for expiring default cards |
| Email service (Resend) | 100% | Transactional sends with EmailLog audit trail; no placeholder sends in production paths; missing email skips |
| Metric snapshots | 100% | Monthly aggregation and upsert via Vercel Cron |
| Dashboard API | 100% | Summary endpoint (time windows) + recoveries list + demo fallback |
| Dashboard UI | 100% | Summary cards, golden metric, recovery table, app shell |
| Sequence UI | 100% | Sequence list page + sequence editor form |
| Settings UI | 100% | Stripe connect button + workspace settings + billing plan selection + Manage Subscription portal button |
| Marketing pages | 100% | Landing page, pricing page, docs page |
| Demo/fallback mode | 100% | Full fallback data when DB unavailable |
| Error handling | 100% | Problem+JSON model, structured error responses, BILLING_ prefix codes |
| Crypto utilities | 100% | Token encryption/decryption for Stripe credentials |
| Documentation | 100% | Full tree: product, architecture, ADRs, engineering, security, ops, GTM |
| Supabase Auth integration | 100% | PKCE code exchange flow implemented: OAuth start generates code_verifier + code_challenge, session route exchanges code via `/auth/v1/token?grant_type=pkce`, callback client detects PKCE code vs implicit access_token. State priority fixed (app_state before state). |
| Hosted payment update page | 88% | Endpoint handles missing Stripe customers gracefully; historical data cleanup remains optional |
| Cron endpoint security | 95% | `/api/cron/*` routes require `CRON_SECRET`-backed auth header; still needs final Vercel production validation |
| Stripe+Supabase live validation runbook execution | 100% | Runbook 6 executed end-to-end |
| Runbook smoke automation | 100% | `pnpm runbook6:smoke` verifies Step 10 + Step 11 endpoints; DB access is optional (SKIP_DB, DATABASE_URL detection) |
| Test coverage | 100% | 236 passing tests across 51 files — 88.19% statements, 76.57% branches, 94.79% functions, 90.12% lines. All coverage thresholds met. Includes unit tests (API routes, services, Inngest functions), component tests (React Testing Library + jsdom), accessibility tests (vitest-axe + axe-core), and E2E specs (Playwright). |
| DunningDog's own billing | 100% | Plan checkout (Stripe + demo), billing portal session, webhook handler (checkout.session.completed, subscription.updated, subscription.deleted), Manage Subscription button in settings UI |
| CI/CD pipeline | 100% | GitHub Actions CI (lint, typecheck, tests with coverage artifact upload, OpenAPI lint, docs link check, Playwright E2E with `pnpm start` in CI) |
| Sentry integration | 100% | Client + server + edge SDK configs, Next.js instrumentation hook, withSentryConfig wrapper, error boundary captures exceptions |
| PostHog integration | 100% | Client-side PostHog provider (posthog-js), server-side capture for milestone events |
| Browser/API security headers | 100% | Global security headers (frame, mime, referrer, permissions, HSTS, cross-origin policy) + Content-Security-Policy-Report-Only + X-DNS-Prefetch-Control |
| Production readiness preflight | 100% | `pnpm prod:check` validates all required env vars, placeholder detection, HTTPS enforcement, key lengths, Stripe live prefix |
| Paddle/Lemon Squeezy | 0% | Deferred to post-MVP |
| In-app payment widget | 0% | Deferred to post-MVP |
| Slack/Discord notifications | 0% | Deferred to post-MVP |
| A/B testing for sequences | 0% | Deferred to post-MVP |
| Cancellation save/pause | 0% | Deferred to post-MVP |

## Architecture Summary

```
Next.js App (Vercel)
├── Marketing pages (/, /pricing, /docs)
├── App pages (/app, /app/recoveries, /app/sequences, /app/settings)
├── API routes
│   ├── /api/stripe/connect/* — OAuth flow
│   ├── /api/webhooks/stripe — Connect webhook ingestion
│   ├── /api/webhooks/stripe-billing — Platform billing webhooks
│   ├── /api/dashboard/* — Dashboard data
│   ├── /api/dunning/sequences/* — Sequence CRUD
│   ├── /api/customer/* — Payment update session
│   ├── /api/billing/* — DunningDog subscription checkout + portal
│   ├── /api/cron/* — Pre-dunning scan + metric snapshots
│   ├── /api/auth/* — OAuth start, session exchange, password flows
│   └── /api/inngest — Inngest webhook
├── Services (recovery, sequences, dashboard, email, preDunning, metrics, billing)
├── Inngest functions (dunning sequence, recovery finalize, pre-dunning notify)
├── Observability (Sentry client/server/edge, PostHog client/server)
└── Database (PostgreSQL 16 via Prisma)
```

## Key Risks & Blockers

1. **Local trigger constraints for Standard Connect remain awkward**: `stripe trigger --stripe-account` still does not work for Standard OAuth accounts, so future local webhook reruns need the same workaround strategy
2. **Production environment values not finalized**: production preflight currently fails until final HTTPS base URLs and secrets are set in deploy environments
3. **Security audit pending**: formal OWASP top-10 check is still open before launch readiness
4. **Stripe webhook endpoints need production registration**: Both Connect and billing webhook endpoints must be registered in the Stripe Dashboard
