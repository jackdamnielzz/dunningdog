import { DEFAULT_POST_AUTH_PATH } from "@/lib/constants";

/**
 * Sanitize a post-auth redirect path to prevent open redirect attacks.
 * Returns DEFAULT_POST_AUTH_PATH for missing, non-relative, or protocol-relative paths.
 */
export function normalizeNextPath(path: string | null | undefined): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return DEFAULT_POST_AUTH_PATH;
  }
  return path;
}
