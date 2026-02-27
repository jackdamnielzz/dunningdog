# Implementation Status — DunningDog

**Last updated:** 2026-02-27

## Feature Completion Overview

| Feature | Completion | Notes |
|---------|-----------|-------|
| Build health baseline | 100% | `pnpm test -- --run`, `pnpm lint`, and `pnpm typecheck` all pass after pre-dunning route/service type alignment |
| Project scaffold & config | 100% | Next.js 15, TypeScript, pnpm, Tailwind, ESLint, Vitest |
| Database schema (Prisma) | 100% | 11 models, 9 enums, all indexes and constraints |
| Domain types & DTOs | 100% | Shared enums, Zod schemas, dashboard DTOs |
| Environment validation | 100% | Zod-validated env vars with demo mode support |
| Production env gating | 95% | Production now enforces provider secret presence, HTTPS app URLs, secure key lengths, and `DEMO_MODE=false`; final env value provisioning still pending |
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
| Settings UI | 100% | Stripe connect button + workspace settings |
| Marketing pages | 100% | Landing page, pricing page, docs page |
| Demo/fallback mode | 100% | Full fallback data when DB unavailable |
| Error handling | 100% | Problem+JSON model, structured error responses |
| Crypto utilities | 100% | Token encryption/decryption for Stripe credentials |
| Documentation | 100% | Full tree: product, architecture, ADRs, engineering, security, ops, GTM |
| Supabase Auth integration | 90% | Workspace resolution uses Supabase user + membership checks; Step 13 manual token session validation completed and `WorkspaceMember` auto-provision confirmed |
| Hosted payment update page | 75% | Endpoint returns Billing Portal session URLs in live local validation; historical attempts from prior temporary account context can still fail and should be cleaned/normalized |
| Cron endpoint security | 95% | `/api/cron/*` routes now require `CRON_SECRET`-backed auth header; still needs final Vercel production validation |
| Stripe+Supabase live validation runbook execution | 100% | Runbook 6 executed end-to-end on 2026-02-27: OAuth connect ✅, webhook flow ✅, recovery lifecycle ✅, payment update endpoint ✅, pre-dunning + metric cron ✅, UI pages ✅, Step 13 Supabase auth session ✅ |
| Test coverage | 88% | Coverage target exceeded: ~87.62% statements (branches 76.27%, functions 95.69%, lines 89.44%) with 122 passing tests across 24 files |
| DunningDog's own billing | 85% | Plan checkout endpoint + settings UI + Stripe/demo plan persistence flow added |
| CI/CD pipeline | 75% | GitHub Actions CI added (lint, typecheck, tests, OpenAPI lint, docs link check) |
| Sentry integration | 82% | Server-side Sentry envelope reporting hardened with safe DSN parsing, release tagging, timeout-protected sends, and consistent server metadata |
| PostHog integration | 82% | Server-side PostHog capture hardened with timeout-protected sends and consistent server metadata across milestone events |
| Browser/API security headers | 90% | Global security headers enabled through Next.js config (frame, mime, referrer, permissions, HSTS, cross-origin policy) |
| Production readiness preflight | 90% | `pnpm prod:check` added; currently reports local production-profile gaps (placeholder/non-https base URLs and missing `CRON_SECRET`) |
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

1. **Local trigger constraints for Standard Connect remain awkward**: `stripe trigger --stripe-account` still does not work for Standard OAuth accounts, so future local webhook reruns need the same workaround strategy
2. **Supabase auth still requires manual token injection**: No login UI exists yet; `/app/*` needs a valid Supabase session when auth vars are enabled
3. **Production environment values not finalized**: production preflight currently fails until final HTTPS base URLs and `CRON_SECRET` are set in deploy environments
4. **Security audit pending**: formal OWASP top-10 check is still open before launch readiness
5. **Observability still server-only**: telemetry transport is hardened, but richer client-side SDK features (session replay/release health) are not yet enabled
