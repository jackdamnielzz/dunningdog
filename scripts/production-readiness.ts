const REQUIRED_KEYS = [
  "APP_BASE_URL",
  "NEXT_PUBLIC_APP_BASE_URL",
  "DATABASE_URL",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_BILLING_WEBHOOK_SECRET",
  "STRIPE_CONNECT_CLIENT_ID",
  "STRIPE_CONNECT_CLIENT_SECRET",
  "STRIPE_PRICE_STARTER_ID",
  "STRIPE_PRICE_PRO_ID",
  "STRIPE_PRICE_GROWTH_ID",
  "SMTP_HOST",
  "SMTP_USER",
  "SMTP_PASS",
  "INNGEST_EVENT_KEY",
  "INNGEST_SIGNING_KEY",
  "CRON_SECRET",
  "ENCRYPTION_KEY",
  "SENTRY_DSN",
  "POSTHOG_KEY",
] as const;

const PLACEHOLDER_PATTERN =
  /your-|xxx|change-me|example|localhost|postgresql:\/\/localhost|todo|\$\{/i;

function isMissing(value: string | undefined) {
  return !value || value.trim().length === 0;
}

function isPlaceholder(value: string) {
  return PLACEHOLDER_PATTERN.test(value);
}

function assertHttps(value: string, key: string, issues: string[]) {
  if (!value.startsWith("https://")) {
    issues.push(`${key} must use https in production.`);
  }
}

function main() {
  const issues: string[] = [];
  const env = process.env;

  if (env.NODE_ENV !== "production") {
    issues.push("NODE_ENV must be set to production.");
  }

  for (const key of REQUIRED_KEYS) {
    const value = env[key];
    if (isMissing(value)) {
      issues.push(`${key} is required.`);
      continue;
    }
    if (isPlaceholder(String(value))) {
      issues.push(`${key} looks like a placeholder value.`);
    }
  }

  const demoMode = String(env.DEMO_MODE ?? "false").toLowerCase() === "true";
  if (demoMode) {
    issues.push("DEMO_MODE must be false for production.");
  }

  if (env.APP_BASE_URL) {
    assertHttps(env.APP_BASE_URL, "APP_BASE_URL", issues);
  }
  if (env.NEXT_PUBLIC_APP_BASE_URL) {
    assertHttps(env.NEXT_PUBLIC_APP_BASE_URL, "NEXT_PUBLIC_APP_BASE_URL", issues);
  }

  if ((env.ENCRYPTION_KEY ?? "").length < 32) {
    issues.push("ENCRYPTION_KEY must be at least 32 characters.");
  }

  if ((env.CRON_SECRET ?? "").length < 32) {
    issues.push("CRON_SECRET must be at least 32 characters.");
  }

  if (env.STRIPE_SECRET_KEY && !env.STRIPE_SECRET_KEY.startsWith("sk_live_")) {
    issues.push("STRIPE_SECRET_KEY must use a live key (sk_live_) in production.");
  }

  if (issues.length > 0) {
    console.error("Production readiness check failed:");
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("Production readiness check passed.");
}

main();
