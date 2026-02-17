import { reportLoggedError } from "@/lib/observability";

type LogLevel = "info" | "warn" | "error";

export function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const payload = {
    level,
    message,
    ...(meta ? { meta } : {}),
    timestamp: new Date().toISOString(),
  };

  if (level === "error") {
    console.error(JSON.stringify(payload));
    reportLoggedError(message, meta);
    return;
  }

  console.log(JSON.stringify(payload));
}
