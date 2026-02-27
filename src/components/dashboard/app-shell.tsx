"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/recoveries", label: "Recoveries" },
  { href: "/app/sequences", label: "Sequences" },
  { href: "/app/settings", label: "Settings" },
];

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
      <header className="border-b border-emerald-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-semibold tracking-tight text-zinc-900">
              DunningDog
            </span>
          </Link>
          <div className="flex w-full items-center justify-between gap-3 md:w-auto">
            <nav className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-center text-sm font-medium text-zinc-600 transition-colors",
                  pathname === item.href
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
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
