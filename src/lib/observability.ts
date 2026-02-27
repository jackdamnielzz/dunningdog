import { env } from "@/lib/env";

type EventProperties = Record<string, unknown>;

function parseSentryDsn(dsn: string) {
  try {
    const parsed = new URL(dsn);
    const projectId = parsed.pathname.replaceAll("/", "");
    if (!parsed.username || !projectId) {
      return null;
    }

    const endpoint = `${parsed.protocol}//${parsed.host}/api/${projectId}/envelope/?sentry_key=${parsed.username}&sentry_version=7`;
    return endpoint;
  } catch {
    return null;
  }
}

function toErrorLike(input: unknown) {
  if (input instanceof Error) {
    return input;
  }

  return new Error(typeof input === "string" ? input : "Unknown error");
}

function resolveRelease() {
  return env.APP_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA || undefined;
}

function withServerContext(properties?: EventProperties): EventProperties {
  const base: EventProperties = {
    source: "server",
    environment: env.NODE_ENV,
  };

  const release = resolveRelease();
  if (release) {
    base.release = release;
  }

  return {
    ...base,
    ...(properties ?? {}),
  };
}

async function postWithTimeout(url: string, init: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.OBSERVABILITY_TIMEOUT_MS);
  try {
    await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } catch {
    // No-op: telemetry should never break request handling.
  } finally {
    clearTimeout(timeout);
  }
}

export async function captureException(
  input: unknown,
  context?: EventProperties,
) {
  if (!env.SENTRY_DSN) {
    return;
  }

  const endpoint = parseSentryDsn(env.SENTRY_DSN);
  if (!endpoint) {
    return;
  }

  const error = toErrorLike(input);
  const eventId = crypto.randomUUID().replaceAll("-", "");
  const sentAt = new Date().toISOString();

  const event = {
    event_id: eventId,
    timestamp: Math.floor(Date.now() / 1000),
    level: "error",
    platform: "javascript",
    environment: env.NODE_ENV,
    release: resolveRelease(),
    message: error.message,
    exception: {
      values: [
        {
          type: error.name,
          value: error.message,
          stacktrace: error.stack,
        },
      ],
    },
    extra: withServerContext(context),
  };

  const envelope = `${JSON.stringify({
    event_id: eventId,
    sent_at: sentAt,
  })}\n${JSON.stringify({ type: "event" })}\n${JSON.stringify(event)}`;

  await postWithTimeout(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/x-sentry-envelope",
    },
    body: envelope,
  });
}

export async function captureEvent(params: {
  event: string;
  distinctId: string;
  properties?: EventProperties;
}) {
  if (!env.POSTHOG_KEY) {
    return;
  }

  const captureUrl = `${env.POSTHOG_HOST}/capture/`;
  await postWithTimeout(captureUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      api_key: env.POSTHOG_KEY,
      event: params.event,
      distinct_id: params.distinctId,
      properties: withServerContext(params.properties),
      timestamp: new Date().toISOString(),
    }),
  });
}

export function reportLoggedError(message: string, meta?: EventProperties) {
  void captureException(new Error(message), meta);
}

export function reportAnalyticsEvent(params: {
  event: string;
  distinctId: string;
  properties?: EventProperties;
}) {
  void captureEvent(params);
}
