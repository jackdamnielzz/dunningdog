# Progress — DunningDog

## Milestones

### 2026-02-27: Runbook 6 — Local End-to-End Validation (Completed)

**Executed:** Full local E2E test flow (OAuth → webhooks → recovery → cron → dashboard)

| Step | Description | Status |
|------|-------------|--------|
| 0 | Tool verification (node, pnpm, stripe) | ✅ Complete |
| 1 | `.env.local` setup | ✅ Complete |
| 2 | Supabase credentials | ✅ Complete |
| 3 | Stripe credentials + Connect OAuth setup | ✅ Complete |
| 4 | DB setup + app start | ✅ Complete |
| 5 | Stripe listen + Inngest dev server | ✅ Complete |
| 6 | Connect Stripe via OAuth | ✅ Complete (`acct_1T5O5REBwzL1NHyf`) |
| 7 | Verify DB records (Prisma Studio) | ✅ Complete |
| 8 | Trigger failed payment → recovery flow | ✅ Complete (webhook 200, Inngest triggered) |
| 9 | Trigger successful payment → recovery resolved | ✅ Complete (webhook 200, Inngest finalized) |
| 10 | Payment update endpoint | ✅ 200 (`sessionUrl` + `expiresAt`) with fresh recovery attempt (`cmm4r6dxf0001jdg0j2saneqz`) |
| 11 | Cron endpoints | ✅ pre-dunning 200 / ✅ metric-snapshots 200 |
| 12 | Final UI verification | ✅ All pages load with real data (200) |
| 13 | Supabase auth session (advanced) | ✅ Completed (Supabase token flow + `WorkspaceMember` row verified) |

**Key Issues Encountered:**
1. Standard Connect OAuth accounts can't be triggered via `stripe trigger --stripe-account` (403) — temporary platform account used for webhook trigger tests
2. Historical recovery attempts tied to prior temporary account context can still return 500 on payment-session endpoint
3. Prisma CLI needs `.env` not `.env.local`
4. Supabase auth still has no login UI (manual token flow required in local validation)
5. Supabase new key format (`sb_publishable_*`) — had to use legacy JWT keys

**Full details:** See [`memory-bank/activeContext.md`](activeContext.md)

### 2026-02-27: OAuth `bad_oauth_state` + localhost redirect (In Progress)

**Investigated:** Google OAuth from `https://dunningdog.vercel.app` redirects to `http://localhost:3000/?error=bad_oauth_state`

| Item | Status |
|------|--------|
| Root cause identified: Supabase Dashboard Site URL = `http://localhost:3000` | ✅ Complete |
| Verified code is correct — no code changes needed | ✅ Complete |
| Verified Vercel env vars (`APP_BASE_URL=https://dunningdog.vercel.app`) | ✅ Complete |
| **ACTION: Change Supabase Dashboard Site URL** to `https://dunningdog.vercel.app` | ⏳ Pending (manual) |
| **ACTION: Add Redirect URLs** in Supabase Dashboard | ⏳ Pending (manual) |
| Test OAuth flow after Supabase config fix | ⏳ Pending |

### 2026-02-27: OAuth Post-Login Redirect Bug Fix (Completed)

**Executed:** Fixed production bug where users completed Google OAuth but landed on marketing homepage instead of `/app` dashboard

| Item | Status |
|------|--------|
| Root cause identified: `router.replace()` races cookie persistence before SSR auth guard | ✅ Complete |
| Fix: replaced `router.replace()` + `router.refresh()` with `window.location.assign()` in `OAuthCallbackClient` | ✅ Complete |
| Removed unused `useRouter` import from callback component | ✅ Complete |
| Cleaned up temporary debug logging from `/app` layout auth guard | ✅ Complete |
| All auth tests pass (7/7), typecheck passes | ✅ Complete |

### 2026-02-27: Google OAuth Flow Hardened + Production Env Fix (Completed)

**Executed:** OAuth login flow hardening, production blocker identification, and env var fix

| Item | Status |
|------|--------|
| Auth guard added to `/app` layout (`src/app/app/layout.tsx`) — all `/app/*` routes now require authentication | ✅ Complete |
| Session endpoint error logging (`src/app/api/auth/session/route.ts`) — `auth.getUser()` failures now log details | ✅ Complete |
| Full Google OAuth flow validated: start → Google → Supabase → callback → session cookie → /app | ✅ Code complete |
| Production blocker: `SUPABASE_ANON_KEY` misconfigured in Vercel | ✅ Fixed via CLI |
| Vercel env var fix: removed bad key, re-added correct JWT to all environments | ✅ Complete |
| Production redeployment triggered via `npx vercel --prod` | ✅ Deployed |

### 2026-02-27: Post-Runbook Stabilization (Completed)

**Executed:** Reliability hardening after Runbook 6 completion

| Item | Status |
|------|--------|
| Step 10 endpoint hardening (`No such customer` fallback) | ✅ Complete |
| Real login flow (`/login`, `/api/auth/login`, `/api/auth/logout`) | ✅ Complete |
| Unauthenticated `/app/*` redirect to login (no more raw 500 page) | ✅ Complete |
| App shell sign-out control | ✅ Complete |
| Runbook smoke script (`pnpm runbook6:smoke`) | ✅ Complete |
| Targeted route tests for login + payment update fallback | ✅ Complete |
