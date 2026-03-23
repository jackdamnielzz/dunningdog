import type { Metadata } from "next";
import Link from "next/link";
import { COMPETITORS } from "@/components/marketing/compare-data";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Compare DunningDog to Alternatives",
  description:
    "See how DunningDog compares to Churnkey, Churn Buster, Baremetrics Recover, Paddle Retain, Gravy, and Stripe Smart Retries for automated payment recovery.",
  openGraph: {
    title: "Compare DunningDog to Alternatives | DunningDog",
    description:
      "Side-by-side feature and pricing comparisons of DunningDog vs the top dunning and payment recovery tools.",
  },
};

const competitors = Object.values(COMPETITORS);

export default function ComparePage() {
  return (
    <>
      {/* Hero */}
      <section className="px-4 pb-8 pt-16 text-center sm:px-6">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-600">
            Comparisons
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
            How DunningDog compares
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600">
            We built DunningDog to be the most affordable, focused payment recovery tool
            for Stripe businesses. See how we stack up against the alternatives.
          </p>
        </div>
      </section>

      {/* Competitor grid */}
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {competitors.map((c) => (
            <Link
              key={c.slug}
              href={`/compare/${c.slug}`}
              className="group rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-accent-300 hover:shadow-md"
            >
              <h2 className="text-lg font-bold text-zinc-900 group-hover:text-accent-700">
                vs {c.name}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">{c.priceRange}</p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                {c.tagline}
              </p>
              <p className="mt-4 flex items-center gap-1 text-sm font-semibold text-accent-600 group-hover:text-accent-700">
                Compare <ArrowRight className="h-4 w-4" />
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-zinc-100 px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-zinc-900">
          Ready to recover more revenue?
        </h2>
        <p className="mt-2 text-zinc-600">
          7-day free trial. No credit card required. Setup in under 5 minutes.
        </p>
        <Link href="/register" className="mt-6 inline-block">
          <Button size="lg">Start Free Trial</Button>
        </Link>
      </section>
    </>
  );
}
