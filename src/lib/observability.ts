import { env } from "@/lib/env";

type EventProperties = Record<string, unknown>;

function parseSentryDsn(dsn: string) {
  const parsed = new URL(dsn);
  const projectId = parsed.pathname.replaceAll("/", "");
  if (!parsed.username || !projectId) {
    return null;
  }

  const endpoint = `${parsed.protocol}//${parsed.host}/api/${projectId}/envelope/?sentry_key=${parsed.username}&sentry_version=7`;
  return endpoint;
}

function toErrorLike(input: unknown) {
  if (input instanceof Error) {
    return input;
  }

  return new Error(typeof input === "string" ? input : "Unknown error");
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
    extra: context ?? {},
  };

  const envelope = `${JSON.stringify({
    event_id: eventId,
    sent_at: sentAt,
  })}\n${JSON.stringify({ type: "event" })}\n${JSON.stringify(event)}`;

  await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/x-sentry-envelope",
    },
    body: envelope,
  }).catch(() => undefined);
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
  await fetch(captureUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      api_key: env.POSTHOG_KEY,
      event: params.event,
      distinct_id: params.distinctId,
      properties: params.properties ?? {},
      timestamp: new Date().toISOString(),
    }),
  }).catch(() => undefined);
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
