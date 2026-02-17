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
