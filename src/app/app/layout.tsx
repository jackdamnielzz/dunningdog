import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthenticatedUserIdFromHeaders } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { AppShell } from "@/components/dashboard/app-shell";

export default async function InternalAppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const requestHeaders = await headers();
  const userId = await getAuthenticatedUserIdFromHeaders(requestHeaders);
  if (!userId) {
    redirect("/login?next=/app");
  }

  const adminFlag = await isAdmin(requestHeaders);

  return <AppShell isAdmin={adminFlag}>{children}</AppShell>;
}
