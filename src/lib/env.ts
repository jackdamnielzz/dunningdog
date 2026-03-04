import { z } from "zod";

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "yes", "on"].includes(normalized)) return true;
    if (["0", "false", "no", "off", ""].includes(normalized)) return false;
  }
  return value;
}, z.boolean());

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  APP_BASE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_BASE_URL: z
    .string()
    .url()
    .default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1).default("postgresql://localhost/dunningdog"),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_CONNECT_CLIENT_ID: z.string().optional(),
  STRIPE_CONNECT_CLIENT_SECRET: z.string().optional(),
  STRIPE_PRICE_STARTER_ID: z.string().optional(),
  STRIPE_PRICE_PRO_ID: z.string().optional(),
  STRIPE_PRICE_GROWTH_ID: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().default(465),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM_EMAIL: z.string().email().default("info@dunningdog.com"),
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),
  CRON_SECRET: z.string().min(16).optional(),
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  APP_RELEASE: z.string().optional(),
  OBSERVABILITY_TIMEOUT_MS: z.coerce.number().int().min(100).max(10000).default(2000),
  POSTHOG_KEY: z.string().optional(),
  POSTHOG_HOST: z.string().url().default("https://eu.i.posthog.com"),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().default("https://eu.i.posthog.com"),
  STRIPE_BILLING_WEBHOOK_SECRET: z.string().optional(),
  ENCRYPTION_KEY: z
    .string()
    .min(16)
    .default("development-only-encryption-key"),
  ADMIN_EMAILS: z.string().optional(),
  DEMO_MODE: booleanFromEnv.default(false),
  MINIMAX_API_KEY: z.string().min(1).optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables", parsedEnv.error.flatten());
  throw new Error("Environment validation failed.");
}

export const env = parsedEnv.data;

export const isDemoMode = env.DEMO_MODE;
export const isProduction = env.NODE_ENV === "production";
