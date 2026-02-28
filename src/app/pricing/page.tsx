import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/marketing/site-footer";
import { getAuthenticatedUserIdFromHeaders } from "@/lib/auth";

const tiers = [
  {
    id: "starter",
    name: "Starter",
    price: 49,
    period: "mo",
    annualPrice: 39,
    cap: "Up to $10k MRR",
    description: "For early-stage SaaS teams recovering their first failed payments.",
    highlight: false,
    cta: "Start free trial",
    features: [
      { text: "Automated payment recovery", included: true },
      { text: "Pre-dunning alerts (expiring cards)", included: true },
      { text: "3-step email sequence", included: true },
      { text: "Recovery dashboard & metrics", included: true },
      { text: "Stripe integration", included: true },
      { text: "Custom email branding", included: false },
      { text: "Slack & Discord alerts", included: false },
      { text: "White-label payment page", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 149,
    period: "mo",
    annualPrice: 124,
    cap: "Up to $50k MRR",
    description: "For growing teams that need full control over their dunning strategy.",
    highlight: true,
    cta: "Start free trial",
    features: [
      { text: "Automated payment recovery", included: true },
      { text: "Pre-dunning alerts (expiring cards)", included: true },
      { text: "Unlimited sequence steps", included: true },
      { text: "Recovery dashboard & metrics", included: true },
      { text: "Stripe integration", included: true },
      { text: "Custom email branding", included: true },
      { text: "Slack & Discord alerts", included: true },
      { text: "White-label payment page", included: false },
    ],
  },
  {
    id: "growth",
    name: "Scale",
    price: 299,
    period: "mo",
    annualPrice: 249,
    cap: "Up to $200k MRR",
    description: "For established SaaS businesses maximizing every dollar of revenue.",
    highlight: false,
    cta: "Start free trial",
    features: [
      { text: "Automated payment recovery", included: true },
      { text: "Pre-dunning alerts (expiring cards)", included: true },
      { text: "Unlimited sequence steps", included: true },
      { text: "Recovery dashboard & metrics", included: true },
      { text: "Stripe integration", included: true },
      { text: "Custom email branding", included: true },
      { text: "Slack & Discord alerts", included: true },
      { text: "White-label payment page", included: true },
    ],
  },
];

const stats = [
  { value: "$118B+", label: "Lost to failed payments yearly" },
  { value: "50-70%", label: "Average recovery rate" },
  { value: "10-30x", label: "Typical ROI on dunning tools" },
];

const faqs = [
  {
    q: "How does the 14-day free trial work?",
    a: "You get full access to your chosen plan for 14 days. No credit card required to start. Cancel anytime during the trial and you won't be charged.",
  },
  {
    q: "What happens if I exceed my MRR cap?",
    a: "We'll notify you when you're approaching your limit and suggest an upgrade. Your recovery sequences keep running — we never pause protection mid-cycle.",
  },
  {
    q: "Can I switch plans later?",
    a: "Absolutely. Upgrade or downgrade at any time from your workspace settings. Changes take effect on your next billing cycle.",
  },
  {
    q: "Do you take a cut of recovered revenue?",
    a: "No. You pay a simple flat monthly fee. Every dollar we help you recover is 100% yours.",
  },
  {
    q: "What payment processors do you support?",
    a: "DunningDog integrates directly with Stripe via OAuth. Support for additional processors is on our roadmap.",
  },
];

export default async function PricingPage() {
  const requestHeaders = await headers();
  const userId = await getAuthenticatedUserIdFromHeaders(requestHeaders);
  if (userId) {
    redirect("/app");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="border-b border-zinc-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold tracking-tight text-zinc-900">
            DunningDog
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button size="sm" variant="ghost">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="px-6 pb-4 pt-16 text-center">
          <div className="mx-auto max-w-3xl">
            <p className="mb-3 text-sm font-medium uppercase tracking-wider text-emerald-600">
              Pricing
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
              Stop losing revenue to failed payments
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600">
              Simple, flat-rate pricing. No percentage of recovered revenue. No hidden fees.
              Every dollar recovered is 100% yours.
            </p>
          </div>
        </section>

        {/* Stats bar */}
        <section className="px-6 py-8">
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-emerald-600">{stat.value}</p>
                <p className="mt-1 text-sm text-zinc-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing cards */}
        <section className="px-6 py-12">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative flex flex-col rounded-2xl border-2 p-8 transition-shadow hover:shadow-lg ${
                  tier.highlight
                    ? "border-emerald-500 bg-white shadow-md shadow-emerald-100"
                    : "border-zinc-200 bg-white"
                }`}
              >
                {tier.highlight && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-4 py-1 text-xs font-semibold text-white">
                    Most popular
                  </span>
                )}

                {/* Plan header */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-zinc-900">{tier.name}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{tier.description}</p>
                </div>

                {/* Price */}
                <div className="mb-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-zinc-900">${tier.price}</span>
                    <span className="text-zinc-500">/{tier.period}</span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-400">
                    ${tier.annualPrice}/mo billed annually
                  </p>
                </div>

                {/* MRR cap */}
                <div className="mb-6 rounded-lg bg-zinc-50 px-3 py-2">
                  <p className="text-sm font-medium text-zinc-700">{tier.cap}</p>
                </div>

                {/* CTA */}
                <Link href="/register" className="mb-8 block">
                  <Button
                    className={`w-full ${
                      tier.highlight
                        ? ""
                        : "bg-zinc-900 hover:bg-zinc-800"
                    }`}
                    size="lg"
                  >
                    {tier.cta}
                  </Button>
                </Link>

                {/* Features */}
                <div className="flex-1">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    What&apos;s included
                  </p>
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature.text} className="flex items-start gap-2.5">
                        {feature.included ? (
                          <svg
                            className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.5 12.75l6 6 9-13.5"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="mt-0.5 h-4 w-4 shrink-0 text-zinc-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                        <span
                          className={`text-sm ${
                            feature.included ? "text-zinc-700" : "text-zinc-400"
                          }`}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Enterprise CTA */}
        <section className="px-6 py-8">
          <div className="mx-auto max-w-3xl rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center">
            <h2 className="text-xl font-semibold text-zinc-900">Above $200k MRR?</h2>
            <p className="mt-2 text-zinc-600">
              We offer custom plans with dedicated onboarding, priority support, SLA guarantees,
              and API access for high-volume teams.
            </p>
            <a
              href="mailto:hello@dunningdog.com"
              className="mt-4 inline-block text-sm font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Contact us for a custom quote &rarr;
            </a>
          </div>
        </section>

        {/* ROI callout */}
        <section className="px-6 py-12">
          <div className="mx-auto max-w-4xl rounded-2xl bg-emerald-600 p-10 text-center text-white">
            <h2 className="text-2xl font-bold sm:text-3xl">
              The math is simple
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-emerald-100">
              A SaaS with $50k MRR typically loses $2,500-5,000/mo to failed payments.
              DunningDog recovers 50-70% of that — <strong>$1,250-3,500/mo back in your pocket</strong> for
              just $149/mo.
            </p>
            <p className="mt-4 text-lg font-semibold">
              That&apos;s up to 23x return on investment.
            </p>
            <Link href="/register" className="mt-6 inline-block">
              <button className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50">
                Start your free 14-day trial
              </button>
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 py-16">
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
            14-day free trial. No credit card required. Cancel anytime.
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
