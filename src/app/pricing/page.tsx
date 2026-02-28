import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/marketing/site-footer";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { getAuthenticatedUserIdFromHeaders } from "@/lib/auth";

const stats = [
  { value: "$118B+", label: "Lost to failed payments yearly" },
  { value: "50-70%", label: "Average recovery rate" },
  { value: "10-30x", label: "Typical ROI on dunning tools" },
];

const faqs = [
  {
    q: "What is early access pricing?",
    a: "We're launching DunningDog with core recovery features live and a few premium features still in development. Early access customers get up to 40% off while we ship the remaining features. Your rate is locked for your entire billing period.",
  },
  {
    q: "What happens when all features launch?",
    a: "New customers will pay full price. Monthly early access subscribers get 60 days notice before any price change. Annual subscribers keep their early access rate for the remainder of their billing year — and get a permanent 20% founding member discount at renewal.",
  },
  {
    q: "What if I pay annually and features launch mid-term?",
    a: "You get the new features immediately at no extra cost. Your annual rate stays locked until your renewal date. At renewal, you'll receive a permanent 20% founding member discount on the full price — rewarding you for believing in us early.",
  },
  {
    q: "How does the 14-day free trial work?",
    a: "You get full access to your chosen plan for 14 days. No credit card required to start. Cancel anytime during the trial and you won't be charged.",
  },
  {
    q: "What happens if I exceed my MRR cap?",
    a: "We'll notify you when you're approaching your limit and suggest an upgrade. Your recovery sequences keep running — we never pause protection mid-cycle.",
  },
  {
    q: "Do you take a cut of recovered revenue?",
    a: "No. You pay a simple flat monthly fee. Every dollar we help you recover is 100% yours.",
  },
  {
    q: "What are 'Coming Q2' features?",
    a: "Features marked 'Coming Q2' are actively in development and expected to ship by the end of Q2 2026. You'll get them automatically when they launch — no action needed.",
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
        {/* Early access banner */}
        <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-center">
          <p className="text-sm font-medium text-amber-800">
            Early access pricing — lock in <strong>up to 40% off</strong> while we
            ship the final features. Annual subscribers get a permanent founding member discount.
          </p>
        </div>

        {/* Hero */}
        <section className="px-6 pb-4 pt-16 text-center">
          <div className="mx-auto max-w-3xl">
            <span className="inline-block rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Early access
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
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

        {/* Pricing cards with monthly/annual toggle */}
        <section className="px-6 py-12">
          <PricingCards />
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
              href="mailto:info@dunningdog.com"
              className="mt-4 inline-block text-sm font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Contact us for a custom quote &rarr;
            </a>
          </div>
        </section>

        {/* Founding member callout */}
        <section className="px-6 py-8">
          <div className="mx-auto max-w-4xl rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-8 sm:p-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
                  Founding member program
                </p>
                <h2 className="mt-2 text-2xl font-bold text-zinc-900">
                  Lock in early access rates
                </h2>
                <ul className="mt-4 space-y-2 text-sm text-zinc-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-amber-500">&#10003;</span>
                    <span>
                      <strong>Monthly:</strong> your rate stays locked until all features ship + 60
                      days notice
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-amber-500">&#10003;</span>
                    <span>
                      <strong>Annual:</strong> rate locked for your full year — new features
                      included at no extra cost
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-amber-500">&#10003;</span>
                    <span>
                      <strong>At renewal:</strong> annual founding members get a permanent 20%
                      discount on full price
                    </span>
                  </li>
                </ul>
              </div>
              <div className="shrink-0 text-center">
                <Link href="/register">
                  <Button size="lg">Claim founding member rate</Button>
                </Link>
                <p className="mt-2 text-xs text-zinc-500">14-day free trial included</p>
              </div>
            </div>
          </div>
        </section>

        {/* ROI callout */}
        <section className="px-6 py-12">
          <div className="mx-auto max-w-4xl rounded-2xl bg-emerald-600 p-10 text-center text-white">
            <h2 className="text-2xl font-bold sm:text-3xl">The math is simple</h2>
            <p className="mx-auto mt-3 max-w-xl text-emerald-100">
              A SaaS with $50k MRR typically loses $2,500-5,000/mo to failed payments.
              DunningDog recovers 50-70% of that —{" "}
              <strong>$1,250-3,500/mo back in your pocket</strong> for just $99/mo during
              early access.
            </p>
            <p className="mt-4 text-lg font-semibold">
              That&apos;s up to 35x return on investment.
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
            14-day free trial. No credit card required. Early access pricing won&apos;t last
            forever.
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
