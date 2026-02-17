# Progress — DunningDog

**Last updated:** 2026-02-17

## Milestones

### ✅ Milestone 1: Project Foundation
- [x] Project scaffold (Next.js 15, TypeScript, pnpm, Tailwind CSS 4)
- [x] Database schema design (11 models, 9 enums)
- [x] Prisma schema with indexes and unique constraints
- [x] Domain types and shared DTOs
- [x] Environment validation with Zod
- [x] Local development setup (Docker Compose + PostgreSQL 16)
- [x] Comprehensive documentation tree (product, architecture, ADRs, engineering, security, operations, GTM)

### ✅ Milestone 2: Stripe Integration
- [x] Stripe OAuth Connect flow (start + callback routes)
- [x] Stripe webhook ingestion with signature verification
- [x] Idempotent event processing (4 event types)
- [x] Token encryption for stored credentials
- [x] Decline code classification (soft vs hard)

### ✅ Milestone 3: Core Recovery Engine
- [x] Recovery service (create/update recovery attempts)
- [x] Dunning sequence management (CRUD with versioning)
- [x] Inngest dunning orchestration (3 functions)
- [x] Pre-dunning detection (14-day card expiration scan)
- [x] Email service via Resend with EmailLog audit trail
- [x] Metric snapshot generation

### ✅ Milestone 4: Dashboard & UI
- [x] App shell with navigation
- [x] Dashboard summary cards (failed revenue, recovered, rate, at-risk, active)
- [x] Recovery attempts table
- [x] Sequence management page
- [x] Settings page (Stripe connect)
- [x] Marketing landing page
- [x] Pricing page
- [x] Docs page
- [x] Demo/fallback mode for development

### 🔶 Milestone 5: Auth & End-to-End (In Progress)
- [x] Replace hardcoded workspace IDs with workspace resolution logic (Supabase user + membership aware)
- [ ] End-to-end Stripe flow testing (OAuth → webhooks → dunning → recovery)
- [ ] Hosted payment update page integration testing (live Stripe sandbox validation pending)
- [x] DunningDog's own billing flow (checkout endpoint + settings plan controls + persisted billingPlan)

### 🔶 Milestone 6: Quality & Observability (In Progress)
- [ ] Increase test coverage to ≥85% for services
- [x] Set up CI/CD pipeline (GitHub Actions with lint/typecheck/test/OpenAPI/docs checks)
- [x] Initialize server-side Sentry reporting hook
- [x] Initialize server-side PostHog event capture hook
- [ ] Security audit (OWASP top-10 check)

### ⬜ Milestone 7: Launch
- [ ] Production environment setup on Vercel
- [ ] Production database on Supabase
- [ ] DNS and custom domain configuration
- [ ] Stripe production keys and webhook endpoints
- [ ] Beta launch to 5-10 users
- [ ] Monitoring and SLO validation

## Overall Progress

| Phase | Status | Completion |
|-------|--------|------------|
| Foundation | ✅ Complete | 100% |
| Stripe Integration | ✅ Complete | 100% |
| Core Recovery Engine | ✅ Complete | 100% |
| Dashboard & UI | ✅ Complete | 100% |
| Auth & End-to-End | 🔶 In Progress | 75% |
| Quality & Observability | 🔶 In Progress | 60% |
| Launch | ⬜ Not Started | 0% |

**Estimated overall MVP completion: ~88%**
