import Link from "next/link";
import { Button } from "@/components/ui/button";

interface MarketingHeaderProps {
  variant?: "full" | "minimal" | "landing";
}

export function MarketingHeader({ variant = "full" }: MarketingHeaderProps) {
  const isLanding = variant === "landing";

  return (
    <header
      className={`border-b bg-white/80 backdrop-blur-lg ${
        isLanding
          ? "sticky top-0 z-50 border-zinc-200/50 shadow-sm shadow-zinc-100/50"
          : "border-zinc-200/80 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className={`font-bold tracking-tight text-zinc-900 ${
            variant === "minimal" ? "text-lg" : "text-2xl"
          }`}
        >
          DunningDog
        </Link>
        {variant === "full" ? (
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button size="sm" variant="ghost">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Try for Free</Button>
            </Link>
          </div>
        ) : (
          <nav className="flex items-center gap-2 sm:gap-5">
            <Link
              href="/pricing"
              className="hidden text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 sm:inline"
            >
              Pricing
            </Link>
            <Link
              href="/solutions"
              className="hidden text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 sm:inline"
            >
              Solutions
            </Link>
            <Link
              href="/compare"
              className="hidden text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 sm:inline"
            >
              Compare
            </Link>
            <Link
              href="/docs/api"
              className="hidden text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 sm:inline"
            >
              API Docs
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
            >
              Sign in
            </Link>
            {isLanding && (
              <Link href="/register">
                <Button size="sm" className="rounded-lg shadow-sm shadow-accent-500/20">
                  Start Free Trial
                </Button>
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
