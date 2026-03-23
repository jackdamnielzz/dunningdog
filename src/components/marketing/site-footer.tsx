import Link from "next/link";
import { policyLinks } from "@/components/marketing/policy-links";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-zinc-200/80 bg-white/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-600">© {year} DunningDog. All rights reserved.</p>
        <nav aria-label="Footer links" className="flex flex-wrap gap-x-4 gap-y-2">
          <Link
            href="/contact"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            Contact
          </Link>
          <Link
            href="/compare"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            Compare
          </Link>
          <Link
            href="/docs/api"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            API Docs
          </Link>
          {policyLinks.map((policy) => (
            <Link
              key={policy.href}
              href={policy.href}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
            >
              {policy.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
