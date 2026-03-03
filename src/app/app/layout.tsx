import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthenticatedUserIdFromHeaders, resolveWorkspaceContextFromHeaders, ensureWorkspaceExists } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { getBranding } from "@/lib/services/branding";
import { getTrialStatus, isWorkspaceAccessible } from "@/lib/trial";
import { AppShell } from "@/components/dashboard/app-shell";

export default async function InternalAppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const requestHeaders = await headers();
  const userId = await getAuthenticatedUserIdFromHeaders(requestHeaders);
  if (!userId) {
    redirect("/login?next=/app");
  }

  const [adminFlag, workspaceContext] = await Promise.all([
    isAdmin(requestHeaders),
    resolveWorkspaceContextFromHeaders(requestHeaders),
  ]);

  const [workspace, accentColor] = await Promise.all([
    ensureWorkspaceExists(workspaceContext.workspaceId),
    getBranding(workspaceContext.workspaceId)
      .then((b) => b?.accentColor ?? null)
      .catch(() => null),
  ]);

  const trialStatus = getTrialStatus(workspace);

  if (!adminFlag && !isWorkspaceAccessible(trialStatus)) {
    redirect("/trial-expired");
  }

  const trialBanner = trialStatus.state === "trialing" && !adminFlag
    ? { daysRemaining: trialStatus.daysRemaining }
    : undefined;

  return (
    <AppShell isAdmin={adminFlag} accentColor={accentColor} trialBanner={trialBanner}>
      {children}
    </AppShell>
  );
}
