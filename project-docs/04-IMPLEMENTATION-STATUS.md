# Implementation Status — DunningDog

**Last updated:** 2026-02-17

## Feature Completion Overview

| Feature | Completion | Notes |
|---------|-----------|-------|
| Project scaffold & config | 100% | Next.js 15, TypeScript, pnpm, Tailwind, ESLint, Vitest |
| Database schema (Prisma) | 100% | 11 models, 9 enums, all indexes and constraints |
| Domain types & DTOs | 100% | Shared enums, Zod schemas, dashboard DTOs |
| Environment validation | 100% | Zod-validated env vars with demo mode support |
| Stripe OAuth Connect | 100% | Start + callback routes, encrypted token storage |
| Stripe webhook ingestion | 100% | Signature verification, idempotent processing, 4 event types |
| Recovery service | 100% | Decline classification, attempt upsert, success marking |
| Dunning sequence management | 100% | CRUD, Zod validation, versioning, transactional step replacement |
| Inngest background functions | 100% | 3 functions: dunning sequence, recovery finalize, pre-dunning notify |
| Pre-dunning detection | 100% | 14-day card expiration window scan via Vercel Cron |
| Email service (Resend) | 100% | Transactional sends with EmailLog audit trail, demo mode fallback |
| Metric snapshots | 100% | Monthly aggregation and upsert via Vercel Cron |
| Dashboard API | 100% | Summary endpoint (time windows) + recoveries list + demo fallback |
| Dashboard UI | 100% | Summary cards, golden metric, recovery table, app shell |
| Sequence UI | 100% | Sequence list page + sequence editor form |
| Settings UI | 100% | Stripe connect button + workspace settings |
| Marketing pages | 100% | Landing page, pricing page, docs page |
| Demo/fallback mode | 100% | Full fallback data when DB unavailable |
| Error handling | 100% | Problem+JSON model, structured error responses |
| Crypto utilities | 100% | Token encryption/decryption for Stripe credentials |
| Documentation | 100% | Full tree: product, architecture, ADRs, engineering, security, ops, GTM |
| Supabase Auth integration | 80% | Workspace resolution now uses Supabase user + membership checks; app pages no longer hardcode workspace IDs |
| Hosted payment update page | 60% | Billing Portal session endpoint implemented; route-level logic validated in code, still needs full live Stripe sandbox runbook pass |
| Test coverage | 40% | Expanded from 2 to 10 test files (26 tests), service layer now substantially covered; still below ≥85% target |
| DunningDog's own billing | 85% | Plan checkout endpoint + settings UI + Stripe/demo plan persistence flow added |
| CI/CD pipeline | 75% | GitHub Actions CI added (lint, typecheck, tests, OpenAPI lint, docs link check) |
| Sentry integration | 70% | Server-side Sentry envelope reporting added via centralized observability module |
| PostHog integration | 70% | Server-side PostHog capture wired for onboarding, sequence, and billing milestones |
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
│   ├── /api/webhooks/stripe — Webhook ingestion
│   ├── /api/dashboard/* — Dashboard data
│   ├── /api/dunning/sequences/* — Sequence CRUD
│   ├── /api/customer/* — Payment update session
│   ├── /api/billing/* — DunningDog subscription checkout
│   ├── /api/cron/* — Pre-dunning scan + metric snapshots
│   └── /api/inngest — Inngest webhook
├── Services (recovery, sequences, dashboard, email, preDunning, metrics, billing)
├── Inngest functions (dunning sequence, recovery finalize, pre-dunning notify)
└── Database (PostgreSQL 16 via Prisma)
```

## Key Risks & Blockers

1. **Service coverage target not yet met**: current automated coverage improved materially but remains below the ≥85% target
2. **Live provider validation pending**: Supabase-authenticated browser sessions and Stripe billing sandbox flows still require full end-to-end run validation
3. **Observability is lightweight**: direct Sentry/PostHog HTTP capture is in place, but full SDK-level features (release health/session replay/client telemetry) are not enabled
