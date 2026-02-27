# Active Context — Google OAuth Login Flow

**Last updated:** 2026-02-27T13:44:00Z
**Status:** OAuth post-login redirect bug fixed; ready for production redeployment
**Runbook reference:** [`docs/operations/runbooks.md`](../docs/operations/runbooks.md) -> Runbook 6

---

## Current Focus: OAuth Post-Login Redirect Bug Fix (2026-02-27)

**Problem:** Users completed Google OAuth but landed on the marketing homepage (unauthenticated view) instead of the `/app` dashboard.

**Root cause:** [`OAuthCallbackClient()`](../src/components/forms/oauth-callback-client.tsx:36) used Next.js `router.replace()` + `router.refresh()` for post-login navigation. This client-side routing raced cookie persistence — the `sb-auth-token` cookie set by the session endpoint wasn't committed before the SSR auth guard in [`InternalAppLayout()`](../src/app/app/layout.tsx:7) checked for it, causing a redirect to `/login`.

**Fix applied:**
1. **Full page navigation** — Replaced `router.replace()` + `router.refresh()` with `window.location.assign()` in [`OAuthCallbackClient()`](../src/components/forms/oauth-callback-client.tsx:36). This forces a full page load, ensuring cookies are fully committed before the server renders the target page.
2. **Removed `useRouter` dependency** — No longer needed since we use `window.location.assign()`.
3. **Cleaned up temporary debug logging** — Removed verbose cookie-name logging from [`InternalAppLayout()`](../src/app/app/layout.tsx:7) (was added during investigation). The production-useful logging in the session endpoint was kept.

**Tests:** All 7 auth tests pass (`auth-session-route.test.ts` 4/4, `auth-oauth-start-route.test.ts` 3/3). Typecheck passes.

### Previous hardening (still in place):
1. **Auth guard at `/app` layout level** — [`src/app/app/layout.tsx`](../src/app/app/layout.tsx) enforces authentication for all `/app/*` routes, redirecting unauthenticated users to `/login`.
2. **Session endpoint error logging** — [`src/app/api/auth/session/route.ts`](../src/app/api/auth/session/route.ts) logs `auth.getUser()` failure details for production debugging.

### Full OAuth Flow

```
User clicks "Sign in with Google"
  → POST /api/auth/oauth/start (initiates Supabase OAuth)
  → Google consent screen
  → Supabase handles Google callback
  → /auth/callback (client-side: exchanges code for session)
  → POST /api/auth/session (sets sb-auth-token cookie)
  → Redirect to /app (protected by layout auth guard)
```

### Key Auth Files

| File | Purpose |
|------|---------|
| [`src/app/api/auth/oauth/start/route.ts`](../src/app/api/auth/oauth/start/route.ts) | Initiates Google OAuth via Supabase |
| [`src/app/auth/callback/page.tsx`](../src/app/auth/callback/page.tsx) | Client-side callback handler |
| [`src/components/forms/oauth-callback-client.tsx`](../src/components/forms/oauth-callback-client.tsx) | OAuth callback client component |
| [`src/app/api/auth/session/route.ts`](../src/app/api/auth/session/route.ts) | Sets `sb-auth-token` session cookie |
| [`src/app/app/layout.tsx`](../src/app/app/layout.tsx) | Auth guard for all `/app/*` routes |
| [`src/components/forms/social-auth-buttons.tsx`](../src/components/forms/social-auth-buttons.tsx) | Google sign-in button UI |
| [`src/lib/supabase.ts`](../src/lib/supabase.ts) | Supabase client factory |
| [`src/lib/auth.ts`](../src/lib/auth.ts) | Auth helper (workspace resolution) |

### Vercel Env Var Fix ✅ (2026-02-27T13:14Z)

**Resolved:** The `SUPABASE_ANON_KEY` environment variable in Vercel was misconfigured (contained extra characters). Fixed via CLI:

1. Removed the bad `SUPABASE_ANON_KEY` from all environments using `npx vercel env rm`
2. Re-added the correct raw JWT value (from `.env.local`) to production, preview, and development
3. Triggered production redeployment with `npx vercel --prod`

**Current Vercel env vars** (project: `tunuxs-projects/dunningdog`, production URL: `https://dunningdog.vercel.app`):
- `SUPABASE_ANON_KEY` — ✅ corrected (raw JWT, starts with `eyJ...`)
- `SUPABASE_URL` — ✅ set (`https://ktpsrzznftgxkywjxiek.supabase.co`)
- `APP_BASE_URL` — ✅ set
- `NEXT_PUBLIC_APP_BASE_URL` — ✅ set

The Google OAuth flow should now work end-to-end in production.

---

## Post-Runbook Stabilization (2026-02-27) ✅

- Hardened `POST /api/customer/update-payment-session` so Stripe `No such customer` errors no longer produce a 500; route now logs and falls back to in-app recoveries URL.
- Added real local login flow:
  - `POST /api/auth/login` (Supabase password grant + `sb-auth-token` cookie set)
  - `POST /api/auth/logout` (session cookie cleared)
  - `/login` page with credential form
- Added auth-aware redirects for app pages: unauthenticated `/app/*` requests now redirect to `/login?next=...` instead of showing a 500 page.
- Added sign-out button in app shell.
- Added smoke validation automation:
  - script: `scripts/runbook6-smoke.ts`
  - npm command: `pnpm runbook6:smoke`
  - validated output: Step 10 + Step 11 (pre-dunning + metric snapshots) pass.
- Added targeted tests:
  - `src/test/customer-update-session-route.test.ts`
  - `src/test/auth-login-route.test.ts`

---

## What Was Done (Chronological)

### Step 0: Tool Verification ✅
- **Node.js v24.13.0** - already installed
- **pnpm 10.8.0** - already installed
- **Stripe CLI v1.37.1** - installed via `winget install Stripe.StripeCLI`
- **Docker** - not installed, skipped; using Supabase-hosted Postgres instead

### Step 1: `.env.local` Created ✅
- Started from existing `.env.local`
- Generated secrets:
  - `CRON_SECRET=6831f69ad10b1050aa207d5e7e9186dfba079b13c3fbf91c`
  - `ENCRYPTION_KEY=82680741089eb15fbbb6e48ca4cc4102f5f442b2b00d6380`
- Set `DEMO_MODE=false`
- Set local Inngest keys and optional monitoring/email vars

### Step 2: Supabase Values ✅
- **Project ID:** `ktpsrzznftgxkywjxiek`
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` configured
- Used legacy JWT-style keys required by current app wiring

### Step 3: Stripe Values ✅
- **Stripe platform account:** `acct_1SCoVIAVDaT7HcpG`
- Stripe key + Connect OAuth client values set
- Connect callback URL configured
- Starter/Pro/Growth price IDs configured

### Step 4: Database & App Setup ✅
- `.env` created for Prisma CLI (`DATABASE_URL` only)
- `pnpm install` and `pnpm db:setup` succeeded
- App started on `http://localhost:3000`

### Step 5: Webhooks & Inngest ✅
- `stripe listen ... --forward-to ... --forward-connect-to ...` configured
- `STRIPE_WEBHOOK_SECRET` set from CLI output
- Inngest dev server connected to `http://localhost:3000/api/inngest`

### Step 6: Stripe OAuth Connection ✅
- Connected account via OAuth created in app settings
- Initial connected account recorded in DB with encrypted access token

### Step 7: Database Verification ✅
- Prisma Studio verified `ConnectedStripeAccount` row and encrypted token fields

### Step 8: Trigger Failed Payment ✅
- CLI limitation encountered for Standard Connect account (`stripe trigger --stripe-account` -> 403)
- Temporary platform-controlled account created: `acct_1T5O9EPK0xpRqzUX`
- Webhook ingestion and recovery-start flow validated end-to-end (`StripeEvent`, `RecoveryAttempt`, `SubscriptionAtRisk`, Inngest event)

### Step 9: Trigger Successful Payment ✅
- `invoice.payment_succeeded` webhook validated
- Recovery finalize flow validated

### Step 10: Payment Update Endpoint ✅ (revalidated)
- Historical run attempt (`attempt:cmm4qrlw60009jdm8qehx5nzw`) still returns **500** because its customer belongs a previous temporary account context.
- Created fresh Stripe customer on platform and fresh recovery attempt (`cmm4r6dxf0001jdg0j2saneqz`).
- `POST /api/customer/update-payment-session` returned **200** with:
  - `sessionUrl` (Stripe Billing Portal)
  - `expiresAt`

### Step 11: Cron Endpoints ✅
- Realigned `ConnectedStripeAccount.stripeAccountId` to the account that matches decrypted OAuth token:
  - before: `acct_1T5O9EPK0xpRqzUX`
  - token account: `acct_1T5O5REBwzL1NHyf`
  - after: `acct_1T5O5REBwzL1NHyf`
- `GET /api/cron/pre-dunning` with bearer `CRON_SECRET` -> **200** (`{"executed":true,"workspaces":1,"candidates":1}`)
- `GET /api/cron/metric-snapshots` -> **200** (`{"executed":true,"count":1,...}`)

### Step 12: Final UI Verification ✅
- `/app`, `/app/recoveries`, `/app/settings` render correctly when auth/session expectations are met

### Step 13: Supabase Auth Session Validation ✅
- Re-enabled Supabase vars in `.env.local`
- Restarted dev server
- Created Supabase test user via Admin API
- Obtained access token via password grant
- Requested `http://localhost:3000/app/settings` with `Authorization: Bearer <access_token>` -> **200**
- Verified `WorkspaceMember` row created:
  - `userId=1a19cde7-7c42-492c-b56a-dcd4b271ec3c`
  - `workspaceId=cmm4r8ely0000jdus93ttf4lr`
  - `role=owner`

---

## Known Issues & Workarounds Used

### Issue 1: Standard Connect OAuth accounts cannot be targeted by `stripe trigger --stripe-account`
- **Problem:** Stripe CLI returned 403 for Standard OAuth connected account
- **Workaround:** temporary platform-controlled account for webhook trigger testing
- **Current state:** webhook/recovery validations completed; DB account/token alignment restored for pre-dunning

### Issue 2: Historical recovery attempt can still 500 on payment-session endpoint
- **Problem:** old attempt references a customer from previous temporary account context
- **Impact:** specific historical attempt token returns 500
- **Workaround:** validated Step 10 with fresh recovery attempt tied to current reachable customer context

### Issue 3: Supabase auth blocks `/app/*` without session
- **Problem:** app pages require valid Supabase session when auth vars are enabled
- **Current state:** dedicated `/login` page and auth API routes now exist; unauthenticated app requests redirect to login
- **Remaining gap:** no signup/forgot-password screens yet

### Issue 4: Prisma CLI reads `.env` (not `.env.local`)
- **Workaround:** keep minimal `.env` with `DATABASE_URL`

### Issue 5: Supabase dashboard default key format differs
- **Workaround:** used legacy JWT keys required by current implementation

---

## Current State of `.env.local`

Supabase vars are currently **enabled**:

```env
SUPABASE_URL=https://ktpsrzznftgxkywjxiek.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Stripe connection state in DB:
- `ConnectedStripeAccount.stripeAccountId=acct_1T5O5REBwzL1NHyf`
- `accessTokenEnc` decrypts to token for the same account (aligned)

---

## Running Services

To continue local validation, keep these running:
1. **App:** `pnpm dev` (port 3000)
2. **Stripe listener:** `stripe listen --events invoice.payment_failed,invoice.payment_succeeded,customer.subscription.updated,payment_method.automatically_updated --forward-to http://localhost:3000/api/webhooks/stripe --forward-connect-to http://localhost:3000/api/webhooks/stripe`
3. **Inngest dev:** `npx -y inngest-cli@latest dev -u http://localhost:3000/api/inngest`
4. **Prisma Studio:** `pnpm prisma studio` (port 5555)
