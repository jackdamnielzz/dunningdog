import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthenticatedUserIdFromHeaders } from "@/lib/auth";
import { AppShell } from "@/components/dashboard/app-shell";

export default async function InternalAppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const userId = await getAuthenticatedUserIdFromHeaders(await headers());
  if (!userId) {
    redirect("/login?next=/app");
  }

  return <AppShell>{children}</AppShell>;
}
