import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.APP_RELEASE ?? process.env.VERCEL_GIT_COMMIT_SHA,
  tracesSampleRate: 0.05,
});
