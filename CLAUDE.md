# DunningDog — Claude Code Instructions

## Project Overview

DunningDog is a SaaS platform that automates payment recovery (dunning) for Stripe-based businesses. It detects failed payments, sends recovery email sequences, and provides a dashboard with recovery metrics.

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19, Turbopack)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4 with `@theme inline` CSS custom properties
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** Supabase Auth (Google OAuth + email/password, PKCE flow)
- **Payments:** Stripe (Connect OAuth for merchant linking, Billing for subscriptions)
- **Email:** Nodemailer (SMTP)
- **Background Jobs:** Inngest
- **Monitoring:** Sentry (errors), PostHog (analytics)
- **Testing:** Vitest + Testing Library + Playwright
- **Package Manager:** pnpm

## Key Commands

```bash
pnpm dev              # Start dev server (Turbopack)
pnpm build            # Production build (runs prisma generate first)
pnpm test             # Run tests with coverage (Vitest)
pnpm test:watch       # Watch mode tests
pnpm lint             # ESLint
pnpm typecheck        # TypeScript check (tsc --noEmit)
pnpm db:setup         # Generate + push schema + seed
pnpm prisma:migrate   # Run Prisma migrations
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── app/                # Authenticated dashboard (/app/*)
│   │   ├── layout.tsx      # Dashboard layout (fetches branding, admin flag)
│   │   ├── admin/          # Admin panel (ADMIN_EMAILS gated)
│   │   ├── settings/       # Workspace settings (Stripe, billing, branding)
│   │   ├── recoveries/     # Recovery management
│   │   └── sequences/      # Dunning sequence editor
│   ├── api/                # API routes
│   ├── policies/           # Legal pages (privacy, terms, cookies, refunds)
│   └── (marketing pages)   # Landing, pricing, contact, login, register
├── components/
│   ├── dashboard/          # App shell, sidebar, nav, feature-gated-card
│   ├── forms/              # Client components with forms
│   ├── layouts/            # Shared page layouts (AuthPageLayout, PolicyPageLayout)
│   ├── marketing/          # Landing page components, marketing-header
│   └── ui/                 # Reusable UI primitives (Button, Card, Badge, Alert, Select, etc.)
├── lib/
│   ├── auth.ts             # Auth helpers (session, workspace context)
│   ├── constants.ts        # Shared constants (DEFAULT_ACCENT_COLOR, DEFAULT_POST_AUTH_PATH)
│   ├── db.ts               # Prisma client singleton
│   ├── params.ts           # URL search param helpers (readParam)
│   ├── plan-features.ts    # Feature gating by billing plan
│   ├── plans.ts            # Plan tier definitions and pricing data
│   ├── safe-redirect.ts    # Safe redirect path normalization
│   ├── webhooks.ts         # Shared Stripe webhook utilities
│   ├── services/           # Business logic (branding, billing, recovery)
│   └── stripe/             # Stripe client and helpers
└── inngest/                # Background job definitions
```

## Architecture Patterns

### Theming / Accent Color

The app uses CSS custom properties for dynamic theming:

- `--accent` is defined in `:root` in `globals.css` (default: `#10b981` / emerald-500)
- `DEFAULT_ACCENT_COLOR` constant in `src/lib/constants.ts` — use this instead of hardcoding
- Tailwind v4 `@theme inline` registers `--color-accent-*` shades using `color-mix()`
- Dashboard layout fetches branding accent color and sets `--accent` via inline style on AppShell
- All color classes use `accent-*` (e.g., `bg-accent-600`, `text-accent-700`) — never hardcoded `emerald-*`

### Authentication

- Supabase handles auth (Google OAuth + email/password)
- `getAuthenticatedUserIdFromHeaders()` extracts user from request headers
- `resolveWorkspaceContextFromHeaders()` returns workspace context for authenticated pages
- Admin access: email checked against `ADMIN_EMAILS` env var

### Billing Plans

Three tiers: `starter`, `pro`, `growth` (displayed as "Scale")
- Feature gating via `planHasFeature(plan, feature)` in `src/lib/plan-features.ts`
- Key features: `email_branding` (Pro+), `notifications` (Pro+), `api_access` (Growth only)

### API Routes

- All under `src/app/api/`
- Auth routes: `/api/auth/*`
- Dashboard data: `/api/dashboard/*`
- Settings: `/api/settings/*`
- Stripe webhooks: `/api/webhooks/stripe`, `/api/webhooks/stripe-billing`

## Conventions

- **Components:** PascalCase files, named exports matching filename
- **Services:** kebab-case files (e.g., `pre-dunning.ts`, `customer-email.ts`)
- **API routes:** lowercase kebab-case directories
- **Forms:** Client components in `src/components/forms/`, using react-hook-form + zod
- **UI primitives:** CVA (class-variance-authority) for variant styling
- **Error handling:** `ProblemError` class for structured API errors
- **Logging:** `log()` from `src/lib/logger.ts`

## Environment

- `.env.local` for local secrets (not committed)
- `.env.example` documents all required variables
- `DEMO_MODE=true` allows local development without full provider setup
- `ADMIN_EMAILS` comma-separated list of admin email addresses

## Important Notes

- Never use hardcoded `emerald-*` Tailwind classes — always use `accent-*`
- Prisma generate must run before build (handled by `pnpm build` script)
- The dev server locks Prisma query engine files — stop it before running `pnpm build`
- Supabase redirect URLs for OAuth must include both production and localhost origins
