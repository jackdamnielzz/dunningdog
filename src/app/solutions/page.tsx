import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SOLUTIONS } from "@/components/marketing/solution-data";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Payment Recovery Solutions",
  description:
    "Explore how DunningDog solves failed payment recovery, involuntary churn, card expiration management, dunning automation, and subscription revenue recovery for Stripe businesses.",
  openGraph: {
    title: "Payment Recovery Solutions | DunningDog",
    description:
      "Automated solutions for failed payments, involuntary churn, and subscription revenue recovery.",
  },
};

const solutions = Object.values(SOLUTIONS);

export default function SolutionsPage() {
  return (
    <>
      {/* Hero */}
      <section className="px-4 pb-8 pt-16 text-center sm:px-6">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-600">
            Solutions
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
            Every tool you need to recover failed payments
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600">
            From proactive prevention to automated recovery, DunningDog covers the full
            payment failure lifecycle for Stripe businesses.
          </p>
        </div>
      </section>

      {/* Solutions grid */}
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.slug}
                href={`/solutions/${s.slug}`}
                className="group rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-accent-300 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-100 group-hover:bg-accent-200">
                  <Icon className="h-5 w-5 text-accent-600" />
                </div>
                <h2 className="mt-4 text-lg font-bold text-zinc-900 group-hover:text-accent-700">
                  {s.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  {s.subtitle}
                </p>
                <p className="mt-4 flex items-center gap-1 text-sm font-semibold text-accent-600 group-hover:text-accent-700">
                  Learn more <ArrowRight className="h-4 w-4" />
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-zinc-100 px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-zinc-900">
          Ready to stop losing revenue?
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
