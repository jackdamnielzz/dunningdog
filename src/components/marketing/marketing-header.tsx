import Link from "next/link";
import { Button } from "@/components/ui/button";

interface MarketingHeaderProps {
  variant?: "full" | "minimal";
}

export function MarketingHeader({ variant = "full" }: MarketingHeaderProps) {
  return (
    <header className="border-b border-zinc-200/80 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className={`font-bold tracking-tight text-zinc-900 ${variant === "full" ? "text-2xl" : "text-lg"}`}>
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
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link href="/pricing" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
              Pricing
            </Link>
            <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
              Sign in
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
