import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthenticatedUserIdFromHeaders, resolveWorkspaceContextFromHeaders } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { getBranding } from "@/lib/services/branding";
import { AppShell } from "@/components/dashboard/app-shell";

export default async function InternalAppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const requestHeaders = await headers();
  const userId = await getAuthenticatedUserIdFromHeaders(requestHeaders);
  if (!userId) {
    redirect("/login?next=/app");
  }

  const [adminFlag, accentColor] = await Promise.all([
    isAdmin(requestHeaders),
    resolveWorkspaceContextFromHeaders(requestHeaders)
      .then((ws) => getBranding(ws.workspaceId))
      .then((b) => b?.accentColor ?? null)
      .catch(() => null),
  ]);

  return <AppShell isAdmin={adminFlag} accentColor={accentColor}>{children}</AppShell>;
}
