import { isDemoMode } from "@/lib/env";

const DATABASE_ERROR_HINTS = [
  "can't reach",
  "connect",
  "connection",
  "timeout",
  "connected to",
  "postgres",
  "p1000",
  "p1001",
  "p1002",
  "p1003",
  "p1008",
  "p1017",
  "p2024",
  "econnrefused",
];

const DATABASE_ERROR_CODES = new Set([
  "P1000",
  "P1001",
  "P1002",
  "P1003",
  "P1008",
  "P1017",
  "P2024",
]);

export function isDatabaseUnavailableError(error: unknown): boolean {
  if (isDemoMode) {
    return true;
  }

  if (!error || typeof error !== "object") {
    return false;
  }

  const typedError = error as { code?: string; message?: string };
  if (typedError.code && DATABASE_ERROR_CODES.has(typedError.code)) {
    return true;
  }

  const message = (typedError.message ?? "").toLowerCase();
  return DATABASE_ERROR_HINTS.some((hint) => message.includes(hint));
}

export function describeFailure(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "unknown error";
  }

  const code = (error as { code?: string }).code;
  const message = (error as { message?: string }).message;
  if (code && message) {
    return `${code}: ${message}`;
  }
  if (message) {
    return message;
  }
  return "unknown error";
}
