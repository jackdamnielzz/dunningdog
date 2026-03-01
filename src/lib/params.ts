/**
 * Read a single string value from a Next.js searchParams record.
 * Returns the first element for arrays, or null if missing.
 */
export function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | null {
  const value = params[key];
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
}
