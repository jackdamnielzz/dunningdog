import { env, isDemoMode } from "@/lib/env";
import { getAuthenticatedUser } from "@/lib/auth";
import { ProblemError } from "@/lib/problem";

export function isAdminEmail(email: string): boolean {
  const adminEmails = env.ADMIN_EMAILS;
  if (!adminEmails) {
    return false;
  }

  const allowedEmails = adminEmails
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return allowedEmails.includes(email.toLowerCase());
}

export async function isAdmin(
  headers: Pick<Headers, "get">,
): Promise<boolean> {
  if (isDemoMode) {
    return true;
  }

  const user = await getAuthenticatedUser(headers);
  if (!user || !user.email) {
    return false;
  }

  return isAdminEmail(user.email);
}

export async function requireAdmin(
  headers: Pick<Headers, "get">,
): Promise<void> {
  const admin = await isAdmin(headers);
  if (!admin) {
    throw new ProblemError({
      title: "Admin access required",
      status: 403,
      code: "AUTH_FORBIDDEN",
      detail: "This action requires administrator privileges.",
    });
  }
}
