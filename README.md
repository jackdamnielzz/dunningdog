# DunningDog

DunningDog is a Stripe-first failed payment recovery application for indie SaaS teams and creators.

This repository contains:
- Product and engineering documentation in `docs/`.
- A full Next.js application with dashboard, sequence management, Stripe connect flow, webhook processing, and Inngest background workflows.

## Tech Stack
- Next.js (App Router) + TypeScript + Tailwind + shadcn-style UI primitives
- PostgreSQL (Supabase-ready) + Prisma ORM
- Stripe (OAuth, Billing, Webhooks)
- Inngest (background workflows) + cron endpoints
- Resend (transactional email)

## Quick Start
1. Install dependencies:
```bash
pnpm install
```

2. Create your environment file:
```bash
cp .env.example .env.local
```

3. Configure `DATABASE_URL` for a PostgreSQL database.

4. Generate Prisma client and push schema:
```bash
pnpm prisma:generate
pnpm prisma:push
```

5. Seed demo data:
```bash
pnpm db:seed
```

6. Run the app:
```bash
pnpm dev
```

Open `http://localhost:3000`.

## Google Login Setup (Supabase Auth)
To make `Continue with Google` work end-to-end:

1. In Supabase: `Authentication -> Providers -> Google`, enable Google.
2. In Google Cloud Console, create OAuth credentials and configure the consent screen.
3. Add these Authorized redirect URIs in Google Cloud:
   - `https://<your-project-ref>.supabase.co/auth/v1/callback`
4. In Supabase Auth URL configuration, set:
   - Site URL: `APP_BASE_URL` (for local: `http://localhost:3000`)
   - Additional redirect URL: `APP_BASE_URL/auth/callback`
5. Ensure app env vars are set:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `APP_BASE_URL`

## Stripe Configuration

### Live Mode (Production)
DunningDog's Stripe live mode is fully configured:
- **Products**: Starter ($49/mo), Pro ($149/mo), Scale ($199/mo) — all USD, monthly recurring
- **Webhooks**: 2 endpoints (payment recovery + billing subscriptions)
- **Connect OAuth**: Enabled, Standard accounts, sellers collect payments directly
- **Tax**: Netherlands, small seller regime

### Environment Variables (Stripe)
```bash
# Live mode (production — set in Vercel)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...          # Recovery webhook signing secret
STRIPE_BILLING_WEBHOOK_SECRET=whsec_...  # Billing webhook signing secret
STRIPE_CONNECT_CLIENT_ID=ca_...          # Connect OAuth client ID
STRIPE_CONNECT_CLIENT_SECRET=sk_live_... # Same as STRIPE_SECRET_KEY
STRIPE_PRICE_STARTER_ID=price_...
STRIPE_PRICE_PRO_ID=price_...
STRIPE_PRICE_GROWTH_ID=price_...

# Test mode (local development — set in .env.local)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...          # From `stripe listen`
STRIPE_CONNECT_CLIENT_ID=ca_...          # Test client ID
STRIPE_CONNECT_CLIENT_SECRET=sk_test_... # Same as test secret key
STRIPE_PRICE_STARTER_ID=price_...        # Test price IDs (EUR)
STRIPE_PRICE_PRO_ID=price_...
STRIPE_PRICE_GROWTH_ID=price_...
```

### Webhook Endpoints
| Webhook | URL | Events |
|---------|-----|--------|
| Payment Recovery | `/api/webhooks/stripe` | invoice.payment_failed, invoice.payment_succeeded, customer.subscription.updated, customer.subscription.deleted, charge.failed, charge.refunded |
| Billing | `/api/webhooks/stripe-billing` | customer.subscription.created, customer.subscription.updated, customer.subscription.deleted |

### Connect OAuth Flow
- Type: Standard accounts via OAuth 2.0 Authorization Code Grant
- Redirect URIs:
  - Production: `https://dunningdog.com/api/stripe/connect/callback?mode=browser`
  - Local: `http://localhost:3000/api/stripe/connect/callback?mode=browser`
- Scope: `read_write`

### Testing Stripe Locally
1. Install Stripe CLI and login: `stripe login`
2. Forward webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Copy the signing secret from `stripe listen` output → `STRIPE_WEBHOOK_SECRET`
4. Trigger test events: `stripe trigger invoice.payment_failed`
5. Connect Stripe from `/app/settings` → Click **Connect Stripe**
6. Use test cards (e.g. `4000 0000 0000 0002` for decline) to simulate failures

## Key Routes
- Marketing: `/`
- Dashboard: `/app`
- Recoveries: `/app/recoveries`
- Sequences: `/app/sequences`
- Settings: `/app/settings`

API routes:
- `POST /api/stripe/connect/start`
- `GET /api/stripe/connect/callback`
- `POST /api/webhooks/stripe`
- `GET /api/dashboard/summary`
- `GET /api/dashboard/recoveries`
- `POST /api/dunning/sequences`
- `PATCH /api/dunning/sequences/:id`
- `POST /api/customer/update-payment-session`
- `POST /api/billing/checkout`

## Background Workflows
- Inngest endpoint: `/api/inngest`
- Cron jobs:
  - `/api/cron/pre-dunning`
  - `/api/cron/metric-snapshots`
  - In production these endpoints require `Authorization: Bearer $CRON_SECRET` (or `x-cron-secret`).

## Testing & Quality
```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm prod:check
```

## Notes
- By default, the app supports a demo-friendly mode (`DEMO_MODE=true`) for local development.
- For production behavior, set real Stripe, Supabase, Resend, and Inngest credentials in environment variables.
