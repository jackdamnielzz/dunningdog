"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";

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
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
      <header className="border-b border-emerald-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-end md:justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/dunningdog-logo.png"
              alt="DunningDog logo"
              width={1536}
              height={1024}
              className="h-40 w-auto sm:h-56 md:h-[280px]"
            />
          </Link>
          <nav className="flex w-full items-center gap-1 rounded-lg bg-zinc-100 p-1 md:w-auto">
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
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
