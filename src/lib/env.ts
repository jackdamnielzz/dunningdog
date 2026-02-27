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
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().default("billing@dunningdog.com"),
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),
  CRON_SECRET: z.string().min(16).optional(),
  SENTRY_DSN: z.string().optional(),
  APP_RELEASE: z.string().optional(),
  OBSERVABILITY_TIMEOUT_MS: z.coerce.number().int().min(100).max(10000).default(2000),
  POSTHOG_KEY: z.string().optional(),
  POSTHOG_HOST: z.string().url().default("https://eu.i.posthog.com"),
  ENCRYPTION_KEY: z
    .string()
    .min(16)
    .default("development-only-encryption-key"),
  DEMO_MODE: booleanFromEnv.default(false),
}).superRefine((data, ctx) => {
  if (data.NODE_ENV !== "production") {
    return;
  }

  const requiredProductionFields: Array<[keyof typeof data, unknown]> = [
    ["STRIPE_SECRET_KEY", data.STRIPE_SECRET_KEY],
    ["STRIPE_WEBHOOK_SECRET", data.STRIPE_WEBHOOK_SECRET],
    ["STRIPE_CONNECT_CLIENT_ID", data.STRIPE_CONNECT_CLIENT_ID],
    ["STRIPE_CONNECT_CLIENT_SECRET", data.STRIPE_CONNECT_CLIENT_SECRET],
    ["STRIPE_PRICE_STARTER_ID", data.STRIPE_PRICE_STARTER_ID],
    ["STRIPE_PRICE_PRO_ID", data.STRIPE_PRICE_PRO_ID],
    ["STRIPE_PRICE_GROWTH_ID", data.STRIPE_PRICE_GROWTH_ID],
    ["SUPABASE_URL", data.SUPABASE_URL],
    ["SUPABASE_ANON_KEY", data.SUPABASE_ANON_KEY],
    ["SUPABASE_SERVICE_ROLE_KEY", data.SUPABASE_SERVICE_ROLE_KEY],
    ["RESEND_API_KEY", data.RESEND_API_KEY],
    ["INNGEST_EVENT_KEY", data.INNGEST_EVENT_KEY],
    ["INNGEST_SIGNING_KEY", data.INNGEST_SIGNING_KEY],
    ["CRON_SECRET", data.CRON_SECRET],
  ];

  for (const [key, value] of requiredProductionFields) {
    if (!value) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${String(key)} is required when NODE_ENV=production.`,
        path: [key],
      });
    }
  }

  if (data.DEMO_MODE) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "DEMO_MODE must be false in production.",
      path: ["DEMO_MODE"],
    });
  }

  if (!data.APP_BASE_URL.startsWith("https://")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "APP_BASE_URL must use https in production.",
      path: ["APP_BASE_URL"],
    });
  }

  if (!data.NEXT_PUBLIC_APP_BASE_URL.startsWith("https://")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "NEXT_PUBLIC_APP_BASE_URL must use https in production.",
      path: ["NEXT_PUBLIC_APP_BASE_URL"],
    });
  }

  if (data.ENCRYPTION_KEY.length < 32) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "ENCRYPTION_KEY must be at least 32 characters in production.",
      path: ["ENCRYPTION_KEY"],
    });
  }
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables", parsedEnv.error.flatten());
  throw new Error("Environment validation failed.");
}

export const env = parsedEnv.data;

export const isDemoMode = env.DEMO_MODE;
export const isProduction = env.NODE_ENV === "production";
