import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/marketing/site-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { getAuthenticatedUserIdFromHeaders } from "@/lib/auth";

const stats = [
  { value: "$118B+", label: "Lost to failed payments yearly" },
  { value: "50-70%", label: "Average recovery rate" },
  { value: "10-30x", label: "Typical ROI on dunning tools" },
];

const faqs = [
  {
    q: "How does the 7-day free trial work?",
    a: "You get full access to the Starter plan for 7 days, no credit card required. When your trial ends, choose the plan that fits your business to keep recovering revenue.",
  },
  {
    q: "What happens if I exceed my MRR cap?",
    a: "We'll notify you when you're approaching your limit and suggest an upgrade. Your recovery sequences keep running — we never pause protection mid-cycle.",
  },
  {
    q: "Do you take a cut of recovered revenue?",
    a: "No. You pay a simple flat monthly fee. Every dollar we help you recover is 100% yours.",
  },
];

export default async function PricingPage() {
  const requestHeaders = await headers();
  const userId = await getAuthenticatedUserIdFromHeaders(requestHeaders);
  if (userId) {
    redirect("/app");
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MarketingHeader variant="full" />

      <main className="flex-1">
        {/* Hero */}
        <section className="px-4 sm:px-6 pb-4 pt-16 text-center">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
              Stop losing revenue to failed payments
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600">
              Simple, flat-rate pricing. No percentage of recovered revenue. No hidden fees.
              Every dollar recovered is 100% yours.
            </p>
          </div>
        </section>

        {/* Stats bar */}
        <section className="px-4 sm:px-6 py-8">
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-accent-600">{stat.value}</p>
                <p className="mt-1 text-sm text-zinc-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing cards with monthly/annual toggle */}
        <section className="px-4 sm:px-6 py-12">
          <PricingCards />
        </section>

        {/* Enterprise CTA */}
        <section className="px-4 sm:px-6 py-8">
          <div className="mx-auto max-w-3xl rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-center sm:p-8">
            <h2 className="text-xl font-semibold text-zinc-900">Above $200k MRR?</h2>
            <p className="mt-2 text-zinc-600">
              We offer custom plans with dedicated onboarding, priority support, SLA guarantees,
              and API access for high-volume teams.
            </p>
            <a
              href="mailto:info@dunningdog.com"
              className="mt-4 inline-block text-sm font-semibold text-accent-600 hover:text-accent-700"
            >
              Contact us for a custom quote &rarr;
            </a>
          </div>
        </section>

        {/* ROI callout */}
        <section className="px-4 sm:px-6 py-12">
          <div className="mx-auto max-w-4xl rounded-2xl bg-accent-600 p-6 text-center text-white sm:p-10">
            <h2 className="text-2xl font-bold sm:text-3xl">The math is simple</h2>
            <p className="mx-auto mt-3 max-w-xl text-accent-100">
              A SaaS with $50k MRR typically loses $2,500-5,000/mo to failed payments.
              DunningDog recovers 50-70% of that —{" "}
              <strong>$1,250-3,500/mo back in your pocket</strong> for just $49/mo.
            </p>
            <p className="mt-4 text-lg font-semibold">
              That&apos;s up to 35x return on investment.
            </p>
            <Link href="/register" className="mt-6 inline-block">
              <Button variant="outline" size="lg" className="bg-white text-accent-700 hover:bg-accent-50">
                Start your free 7-day trial
              </Button>
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 sm:px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 text-center text-2xl font-bold text-zinc-900">
              Frequently asked questions
            </h2>
            <dl className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.q} className="rounded-lg border border-zinc-200 p-5">
                  <dt className="font-semibold text-zinc-900">{faq.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-zinc-600">{faq.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-zinc-100 px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-zinc-900">
            Ready to stop losing revenue?
          </h2>
          <p className="mt-2 text-zinc-600">
            7-day free trial. No credit card required.
          </p>
          <Link href="/register" className="mt-6 inline-block">
            <Button size="lg">Get started for free</Button>
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
