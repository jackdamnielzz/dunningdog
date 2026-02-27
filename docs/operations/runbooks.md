# Operations Runbooks

- Owner: Founding Engineer
- Status: Draft v1
- Last Reviewed: 2026-02-27
- Linked ADRs: [ADR-0003](../adr/ADR-0003-job-orchestration.md)
- Linked API References: [Webhook Contracts](../api/webhook-contracts.md), [Error Model](../api/error-model.md)

## Runbook 1: Stripe Webhook Failures
1. Confirm failure pattern in logs and Sentry.
2. Validate webhook secret and timestamp tolerance.
3. Check endpoint health and deployment status.
4. If signature mismatch persists, rotate secret and redeploy.
5. Replay quarantined events after stabilization.

## Runbook 2: Duplicate Dunning Sends
1. Identify repeated send logs by `attemptId` and step key.
2. Verify idempotency key generation path.
3. Pause affected sequence if user impact is active.
4. Apply fix and replay only unsent valid steps.
5. Notify affected workspaces if duplicate email threshold is exceeded.

## Runbook 3: Email Provider Degradation
1. Confirm provider-side incident.
2. Reduce send concurrency and retry with backoff.
3. Queue delayed sends up to safe delay threshold.
4. If outage persists, pause sequence sends and communicate status.
5. Resume and backfill sends when provider recovers.

## Runbook 4: OAuth Callback Errors
1. Check callback URL and Stripe app config.
2. Validate OAuth state validation logic and session storage.
3. Inspect token exchange responses from Stripe.
4. Deploy fix and ask affected users to reconnect.

## Runbook 5: Metric Drift
1. Compare dashboard aggregates against raw recovery attempts.
2. Recompute snapshot for affected periods.
3. Investigate missing or duplicate event processing.
4. Document correction in incident log.

## Runbook 6: Stripe + Supabase Live Validation Checklist (Beginner Walkthrough, Local, PowerShell)

**Goal:** complete a local end-to-end test flow (OAuth -> webhooks -> recovery -> cron -> dashboard) without guessing.
**Who this is for:** someone with little/no Stripe or Supabase experience.
**Expected time:** first run often takes 60-120 minutes.

### A) Open the project in VS Code (exact clicks)
1. Start VS Code.
2. Click `File` -> `Open Folder...`.
3. Select this folder: `D:\Programmeren\other\dunningdog`.
4. Click `Select Folder`.
5. Confirm you opened the correct repo:
   - Left sidebar (`Explorer`) shows files like `package.json`, `src`, `docs`.
   - The top breadcrumb/path in VS Code ends with `dunningdog`.

### B) Open terminal in repo root (exact clicks)
1. In VS Code, click `Terminal` -> `New Terminal`.
2. A terminal panel opens at the bottom (PowerShell).
3. Check the prompt path. It must end with:
   - `D:\Programmeren\other\dunningdog>`
4. If the path is different, run:
   ```powershell
   cd D:\Programmeren\other\dunningdog
   ```
5. Optional shortcuts:
   - Open terminal: `` Ctrl+` ``
   - New terminal tab: `` Ctrl+Shift+` ``

### C) Create 4 terminal tabs in VS Code
1. Use terminal tabs in the same bottom panel.
2. Create 4 tabs (click the `+` icon 3 times after the first tab).
3. Rename tabs (right click tab -> `Rename`) to:
   - `A-App`
   - `B-Stripe`
   - `C-Inngest`
   - `D-Manual`
4. Keep all tabs open during the runbook.

### D) What you need open during this runbook
1. VS Code with this repo open.
2. Terminal tabs:
   - `A-App` for `pnpm dev`
   - `B-Stripe` for `stripe listen ...`
   - `C-Inngest` for Inngest dev server
   - `D-Manual` for one-off commands
3. Browser tabs:
   - app settings: `http://localhost:3000/app/settings`
   - Stripe Dashboard (test mode ON)
   - Supabase Dashboard
   - Prisma Studio (later): `http://localhost:5555`

### 0) First check: required tools (run in `D-Manual`)
1. In `D-Manual`, run:
   ```powershell
   node -v
   pnpm -v
   stripe --version
   docker --version
   ```
2. If `stripe` is missing: install Stripe CLI before continuing.
3. If `docker` is missing: use a hosted Postgres connection string in `DATABASE_URL` (Supabase is fine).

### 1) Create `.env.local` and fill values
1. In VS Code Explorer, locate `.env.local` in repo root.
2. If you do not see `.env.local`, create it in `D-Manual`:
   ```powershell
   if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
   ```
3. Click `.env.local` to open it in the editor.
4. Delete old placeholder values if needed and paste these basics:
   ```env
   NODE_ENV=development
   DEMO_MODE=false
   APP_BASE_URL=http://localhost:3000
   NEXT_PUBLIC_APP_BASE_URL=http://localhost:3000
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dunningdog
   RESEND_FROM_EMAIL=billing@dunningdog.com
   ```
5. Generate secure local secrets in `D-Manual`:
   ```powershell
   node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
   ```
6. Run the command 2 times.
7. Paste first output as `CRON_SECRET=<value>`.
8. Paste second output as `ENCRYPTION_KEY=<value>`.
9. Save file with `Ctrl+S`.

### 2) Exact click path: Supabase values
1. Open Supabase Dashboard for your project.
2. Click `Project Settings` (gear icon, left-bottom).
3. Click `API`.
4. In VS Code `.env.local`, paste:
   - `Project URL` -> `SUPABASE_URL`
   - `anon` key -> `SUPABASE_ANON_KEY`
   - `service_role` key -> `SUPABASE_SERVICE_ROLE_KEY`
5. Get database connection string:
   - Click `Connect` button in Supabase project UI.
   - Copy Postgres URI.
   - Replace `[YOUR-PASSWORD]` with your DB password.
   - Paste into `DATABASE_URL` (overwrite Docker URL only if you use hosted DB).
6. Save `.env.local` (`Ctrl+S`).

### 3) Exact click path: Stripe values
1. Open Stripe Dashboard and turn **Test mode ON**.
2. API secret key:
   - Go to `Developers` -> `API keys`.
   - Copy secret key (starts with `sk_test_`) -> `STRIPE_SECRET_KEY`.
3. Connect OAuth client values:
   - Open `https://dashboard.stripe.com/settings/connect/onboarding-options/oauth`.
   - Copy test `client_id` (starts with `ca_`) -> `STRIPE_CONNECT_CLIENT_ID`.
   - Copy client secret -> `STRIPE_CONNECT_CLIENT_SECRET`.
4. Add callback URL in Stripe Connect OAuth settings:
   - Add `http://localhost:3000/api/stripe/connect/callback?mode=browser`
5. Price IDs for plans:
   - Go to Product Catalog in Stripe.
   - Create or open 3 recurring prices (starter/pro/growth).
   - Copy IDs (start with `price_`) into:
     - `STRIPE_PRICE_STARTER_ID`
     - `STRIPE_PRICE_PRO_ID`
     - `STRIPE_PRICE_GROWTH_ID`
6. Temporary placeholders allowed for local run:
   - `INNGEST_EVENT_KEY=dev-inngest-event-key`
   - `INNGEST_SIGNING_KEY=dev-inngest-signing-key`
   - `RESEND_API_KEY=` (may stay empty for local flow)
7. Save `.env.local` (`Ctrl+S`).

### 4) Start database and app
1. If using local Docker Postgres:
   ```powershell
   docker compose up -d postgres
   ```
2. Install deps and prepare DB:
   ```powershell
   pnpm install
   pnpm db:setup
   ```
3. Run these in `D-Manual` first, then keep `D-Manual` free.
4. Start app in `A-App`:
   ```powershell
   pnpm dev
   ```
5. Success check:
   - Terminal A should show app ready on `http://localhost:3000`.
   - No crash from env parsing.

### 5) Start webhooks and Inngest
1. In `B-Stripe`, run:
   ```powershell
   stripe login
   stripe listen --events invoice.payment_failed,invoice.payment_succeeded,customer.subscription.updated,payment_method.automatically_updated --forward-to http://localhost:3000/api/webhooks/stripe --forward-connect-to http://localhost:3000/api/webhooks/stripe
   ```
2. In `B-Stripe` output, copy the shown `whsec_...` signing secret.
3. Open `.env.local` in VS Code and set:
   - `STRIPE_WEBHOOK_SECRET=whsec_...`
4. Save `.env.local` (`Ctrl+S`).
5. Restart `A-App`:
   - click inside `A-App`
   - press `Ctrl+C`
   - run `pnpm dev` again
6. In `C-Inngest`, run:
   ```powershell
   npx -y inngest-cli@latest dev -u http://localhost:3000/api/inngest
   ```

### 6) Open app and connect Stripe (exact clicks)
1. Open `http://localhost:3000/app/settings`.
2. In `Stripe Integration` card, confirm:
   - first badge should be `Not connected`
   - second badge should be `Live OAuth configured`
3. Click button `Connect Stripe`.
4. Stripe OAuth page opens:
   - choose/create test connected account
   - approve connection
5. Browser returns to settings page.
6. Success signals on page:
   - badge becomes `Connected`
   - line `Stripe account ID: acct_...` appears
7. Copy this `acct_...` value; you will use it in step 8.

### 7) Check database records (Prisma Studio)
1. In `D-Manual`, run:
   ```powershell
   pnpm prisma studio
   ```
2. Open `http://localhost:5555`.
3. Verify table `ConnectedStripeAccount`:
   - row exists
   - `stripeAccountId` matches settings page
   - `accessTokenEnc` is populated

### 8) Trigger failed payment and verify recovery starts
1. In `D-Manual`, run:
   ```powershell
   stripe trigger invoice.payment_failed --stripe-account <CONNECTED_ACCT_ID>
   ```
2. Watch `B-Stripe`:
   - should show webhook delivery to `/api/webhooks/stripe`
   - status should be `200`
3. Open `http://localhost:3000/app/recoveries`.
4. Expect at least one row with pending state.
5. In Prisma Studio verify:
   - `StripeEvent` row with `processingStatus=processed`
   - `RecoveryAttempt` row with `status=pending`
   - `SubscriptionAtRisk` row with `reason=payment_failed`
   - `EmailLog` row exists (or skip metadata due to missing customer email)

### 9) Trigger successful payment and verify recovery completes
1. In `D-Manual`, run:
   ```powershell
   stripe trigger invoice.payment_succeeded --stripe-account <CONNECTED_ACCT_ID>
   ```
2. Verify in Prisma Studio:
   - same `RecoveryAttempt` updates to `status=recovered`
   - `RecoveryOutcome` row created
   - linked `SubscriptionAtRisk` rows removed
3. Refresh `http://localhost:3000/app/recoveries` and confirm recovered state appears.

### 10) Hosted payment update endpoint test (copy/paste)
1. In Prisma Studio, copy one `RecoveryAttempt.id`.
2. In `D-Manual`, run:
   ```powershell
   Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/customer/update-payment-session" -ContentType "application/json" -Body '{"recoveryToken":"attempt:<RECOVERY_ATTEMPT_ID>"}'
   ```
3. Success output:
   - JSON with `sessionUrl`
   - JSON with `expiresAt`
4. `sessionUrl` behavior:
   - real Stripe customer (`cus_...`) -> Billing Portal URL
   - fallback customer -> app URL `/app/recoveries?updated=true...`

### 11) Cron endpoint checks (copy/paste)
1. Put your cron secret in a variable:
   ```powershell
   $cron = "<your CRON_SECRET value>"
   ```
2. Pre-dunning:
   ```powershell
   Invoke-RestMethod -Method GET -Uri "http://localhost:3000/api/cron/pre-dunning" -Headers @{ Authorization = "Bearer $cron" }
   ```
3. Metric snapshots:
   ```powershell
   Invoke-RestMethod -Method GET -Uri "http://localhost:3000/api/cron/metric-snapshots" -Headers @{ Authorization = "Bearer $cron" }
   ```
4. Success output expectations:
   - pre-dunning response includes `executed`, `workspaces`, `candidates`
   - metric response includes `executed`, `count`, `snapshots`
5. In Prisma Studio table `MetricSnapshot`, confirm a new row exists for current month.

### 12) Final UI verification
1. Open `http://localhost:3000/app`.
2. Open `http://localhost:3000/app/recoveries`.
3. Confirm dashboard and recovery table reflect the events you triggered.

### 13) Supabase auth session validation (advanced, manual)
The app currently does not include a dedicated login page. To still validate Supabase-based workspace resolution, do this manual browser token flow.

1. In Supabase Dashboard:
   - go to `Authentication` -> `Users`
   - create a user with email + password
2. Open browser devtools on `http://localhost:3000` (F12 -> Console).
3. Run this script (replace placeholders):
   ```javascript
   const SUPABASE_URL = "https://<your-project-ref>.supabase.co";
   const ANON_KEY = "<your-supabase-anon-key>";
   const EMAIL = "<user-email>";
   const PASSWORD = "<user-password>";

   const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
     method: "POST",
     headers: {
       apikey: ANON_KEY,
       "Content-Type": "application/json",
     },
     body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
   });

   const data = await res.json();
   if (!data.access_token) {
     console.error("No token", data);
   } else {
     const tokenPayload = `base64-${btoa(JSON.stringify({ access_token: data.access_token }))}`;
     document.cookie = `sb-auth-token=${encodeURIComponent(tokenPayload)}; Path=/`;
     location.reload();
   }
   ```
4. Re-open `http://localhost:3000/app/settings`.
5. In Prisma Studio verify table `WorkspaceMember` has a row for this user id.

### Troubleshooting quick map
- `stripe` command not found: Stripe CLI not installed or not on PATH.
- `docker` command not found: use Supabase-hosted `DATABASE_URL`.
- settings page shows `Demo connect mode`: required Stripe vars are still missing in `.env.local`.
- webhook `401 AUTH_WEBHOOK_SIGNATURE_INVALID`: wrong `STRIPE_WEBHOOK_SECRET`; copy latest from active `stripe listen`.
- webhook `404 STRIPE_ACCOUNT_NOT_CONNECTED`: OAuth step not completed for this workspace/account or no `--forward-connect-to`.
- `/app/*` shows auth unauthorized with Supabase vars set: complete step 13 or temporarily run without Supabase vars while validating Stripe flow.
- cron returns `401 AUTH_UNAUTHORIZED`: Authorization header secret does not match `CRON_SECRET`.

## Acceptance Criteria
1. Each alert in observability docs maps to a runbook.
2. Steps are executable by an engineer unfamiliar with the incident.

## Non-Goals
1. L3 enterprise support escalation chains.
2. Automatic remediation bots in MVP.
