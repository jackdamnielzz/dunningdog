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

## Stripe Test Connection Checklist
This section is the fastest way to validate Stripe connection end-to-end in test mode.

1. Prepare environment variables (local `.env.local` or Vercel envs):

```bash
DEMO_MODE=false
DATABASE_URL=postgresql://...
APP_BASE_URL=http://localhost:3000 # or https://dunningdog.vercel.app on production
NEXT_PUBLIC_APP_BASE_URL=http://localhost:3000 # or https://dunningdog.vercel.app on production
ENCRYPTION_KEY=32-byte-or-longer-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_CLIENT_ID=ca_...
STRIPE_CONNECT_CLIENT_SECRET=sk_live_or_test_secret_for_oauth
```

2. Configure your Stripe Connect app:
- Set OAuth redirect URI to:
  - `https://dunningdog.vercel.app/api/stripe/connect/callback` (production)
  - `http://localhost:3000/api/stripe/connect/callback` (local)
- Keep the app in test mode for initial validation.

3. Configure Stripe webhook endpoint:
- Endpoint URL:
  - `https://dunningdog.vercel.app/api/webhooks/stripe` (production)
  - `http://localhost:3000/api/webhooks/stripe` (local with `stripe login` + `stripe listen`)
- Subscribe to:
  - `invoice.payment_failed`
  - `invoice.payment_succeeded`
  - `customer.subscription.updated`
  - `payment_method.automatically_updated`
- Save the signing secret into `STRIPE_WEBHOOK_SECRET`.

4. Start app and connect Stripe from Settings.
- Open `/app/settings`.
- Click **Connect Stripe**.
- Complete OAuth in your Stripe test account.
- Return to `/app/settings` and confirm connection status is **Connected**.

5. Trigger a real test event:
- In Stripe test environment, create or edit a test subscription so a payment failure event is emitted.
- You can use test cards that fail (e.g. 4000 0000 0000 0002).
- Open `/app/recoveries` and confirm a recovery attempt appears.

6. Validate webhook health:
- In Stripe Dashboard → Developers → Webhooks, verify deliveries return `200`.
- In app logs, confirm callbacks for `invoice.payment_failed` and `invoice.payment_succeeded`.

Expected outcome:
- `/app/settings` shows a connected account (`Connected`, `Demo connect mode` should become false in real mode).
- `/api/webhooks/stripe` should return:
  - `{ "received": true }` for supported events.
- Recoveries table should contain real events and attempts instead of demo rows.

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

## Background Workflows
- Inngest endpoint: `/api/inngest`
- Cron jobs:
  - `/api/cron/pre-dunning`
  - `/api/cron/metric-snapshots`

## Testing & Quality
```bash
pnpm lint
pnpm typecheck
pnpm test
```

## Notes
- By default, the app supports a demo-friendly mode (`DEMO_MODE=true`) for local development.
- For production behavior, set real Stripe, Supabase, Resend, and Inngest credentials in environment variables.
