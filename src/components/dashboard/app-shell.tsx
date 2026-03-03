"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TrialBanner } from "@/components/dashboard/trial-banner";

const navItems = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/recoveries", label: "Recoveries" },
  { href: "/app/sequences", label: "Sequences" },
  { href: "/app/settings", label: "Settings" },
];

interface AppShellProps {
  children: React.ReactNode;
  isAdmin?: boolean;
  accentColor?: string | null;
  trialBanner?: { daysRemaining: number };
}

export function AppShell({ children, isAdmin: isAdminUser, accentColor, trialBanner }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const allNavItems = isAdminUser
    ? [...navItems, { href: "/app/admin", label: "Admin" }]
    : navItems;

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login?next=/app");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  const shellStyle = accentColor ? { "--accent": accentColor } as React.CSSProperties : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-accent-50 via-white to-accent-100" style={shellStyle}>
      <header className="border-b border-accent-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-semibold tracking-tight text-zinc-900">
              DunningDog
            </span>
          </Link>
          <div className="flex w-full items-center justify-between gap-3 md:w-auto">
            <nav className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1">
            {allNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-center text-sm font-medium text-zinc-600 transition-colors",
                  (item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href))
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "hover:text-zinc-900",
                )}
              >
                {item.label}
              </Link>
            ))}
            </nav>
            <Button size="sm" variant="outline" onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? "Signing out..." : "Sign out"}
            </Button>
          </div>
        </div>
      </header>
      {trialBanner && <TrialBanner daysRemaining={trialBanner.daysRemaining} />}
      <main className="mx-auto max-w-6xl flex-1 px-6 py-8">{children}</main>
      <footer className="border-t border-accent-100 bg-white/60 py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 text-sm text-zinc-500">
          <Link href="/policies/privacy" className="hover:text-zinc-700">Privacy Policy</Link>
          <Link href="/policies/terms" className="hover:text-zinc-700">Terms of Service</Link>
          <Link href="/policies/cookies" className="hover:text-zinc-700">Cookie Policy</Link>
          <Link href="/policies/refunds" className="hover:text-zinc-700">Refund Policy</Link>
          <Link href="/contact" className="hover:text-zinc-700">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
