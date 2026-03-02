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

  const encKey = env.ENCRYPTION_KEY ?? "";
  if (encKey.length < 32) {
    issues.push("ENCRYPTION_KEY must be at least 32 characters.");
  }
  if (encKey === "development-only-encryption-key") {
    issues.push(
      "ENCRYPTION_KEY is still the default dev value. Generate a new one: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    );
  }

  if ((env.CRON_SECRET ?? "").length < 32) {
    issues.push("CRON_SECRET must be at least 32 characters.");
  }

  if (env.STRIPE_SECRET_KEY && !env.STRIPE_SECRET_KEY.startsWith("sk_live_")) {
    issues.push("STRIPE_SECRET_KEY must use a live key (sk_live_) in production.");
  }

  if (env.SUPABASE_URL && !env.SUPABASE_URL.includes(".supabase.co")) {
    issues.push("SUPABASE_URL should point to a hosted Supabase instance.");
  }

  if (env.DATABASE_URL && env.DATABASE_URL.includes("localhost")) {
    issues.push("DATABASE_URL points to localhost — use a production database.");
  }

  if (!env.ADMIN_EMAILS || env.ADMIN_EMAILS.trim().length === 0) {
    issues.push("ADMIN_EMAILS should be set so you can access the admin panel.");
  }

  if (env.STRIPE_WEBHOOK_SECRET && !env.STRIPE_WEBHOOK_SECRET.startsWith("whsec_")) {
    issues.push("STRIPE_WEBHOOK_SECRET should start with whsec_ (register webhooks in Stripe dashboard).");
  }

  if (env.STRIPE_BILLING_WEBHOOK_SECRET && !env.STRIPE_BILLING_WEBHOOK_SECRET.startsWith("whsec_")) {
    issues.push("STRIPE_BILLING_WEBHOOK_SECRET should start with whsec_.");
  }

  // Summary
  const warnings: string[] = [];

  if (!env.SENTRY_AUTH_TOKEN) {
    warnings.push("SENTRY_AUTH_TOKEN not set — source maps will not be uploaded.");
  }
  if (!env.NEXT_PUBLIC_POSTHOG_KEY && !env.POSTHOG_KEY) {
    warnings.push("PostHog key not set — analytics will be disabled.");
  }

  if (issues.length > 0) {
    console.error(`\nProduction readiness check FAILED (${issues.length} issue${issues.length > 1 ? "s" : ""}):\n`);
    for (const issue of issues) {
      console.error(`  ✗ ${issue}`);
    }
  } else {
    console.log("\n  ✓ Production readiness check PASSED.\n");
  }

  if (warnings.length > 0) {
    console.warn(`\nWarnings (${warnings.length}):\n`);
    for (const w of warnings) {
      console.warn(`  ⚠ ${w}`);
    }
  }

  if (issues.length > 0) {
    console.log("\n--- Quick setup commands ---");
    console.log('  Generate ENCRYPTION_KEY:  node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    console.log('  Generate CRON_SECRET:     node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    console.log("");
    process.exitCode = 1;
  }
}

main();
