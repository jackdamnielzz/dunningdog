import { AppShell } from "@/components/dashboard/app-shell";

export default function InternalAppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AppShell>{children}</AppShell>;
}
