"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-semibold tracking-tight text-zinc-900">
              DunningDog
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-3 md:flex">
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

          {/* Mobile hamburger */}
          <button
            type="button"
            className="rounded-md p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav className="border-t border-accent-100 px-4 pb-4 pt-2 sm:px-6 md:hidden">
            <div className="flex flex-col gap-1">
              {allNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors",
                    (item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href))
                      ? "bg-accent-50 text-zinc-900"
                      : "hover:bg-zinc-50 hover:text-zinc-900",
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-2 border-t border-zinc-100 pt-2">
                <Button size="sm" variant="outline" className="w-full" onClick={handleLogout} disabled={isLoggingOut}>
                  {isLoggingOut ? "Signing out..." : "Sign out"}
                </Button>
              </div>
            </div>
          </nav>
        )}
      </header>
      {trialBanner && <TrialBanner daysRemaining={trialBanner.daysRemaining} />}
      <main className="mx-auto max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      <footer className="border-t border-accent-100 bg-white/60 py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 text-sm text-zinc-500 sm:px-6">
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
