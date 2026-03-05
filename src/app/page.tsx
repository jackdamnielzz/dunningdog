import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  BarChart3,
  Clock,
  Mail,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/marketing/site-footer";
import { getAuthenticatedUserIdFromHeaders } from "@/lib/auth";

export default async function Home() {
  const requestHeaders = await headers();
  const userId = await getAuthenticatedUserIdFromHeaders(requestHeaders);
  if (userId) {
    redirect("/app");
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* ── Navigation ── */}
      <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-zinc-900"
          >
            DunningDog
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/pricing"
              className="hidden text-sm font-medium text-zinc-600 hover:text-zinc-900 sm:inline"
            >
              Pricing
            </Link>
            <Link
              href="/docs/api"
              className="hidden text-sm font-medium text-zinc-600 hover:text-zinc-900 sm:inline"
            >
              API Docs
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
            >
              Sign in
            </Link>
            <Link href="/register">
              <Button size="sm">Start Free Trial</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,#d9f5ee_0%,transparent_50%),radial-gradient(circle_at_80%_20%,#e2f4ff_0%,transparent_40%)]" />
          <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pb-24 sm:pt-24 lg:pb-32 lg:pt-28">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-200 bg-accent-50 px-4 py-1.5 text-sm font-semibold text-accent-700">
                <Zap className="h-3.5 w-3.5" />
                Automated payment recovery for Stripe
              </p>
              <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
                Stop losing revenue to
                <span className="bg-gradient-to-r from-accent-600 to-accent-800 bg-clip-text text-transparent">
                  {" "}
                  failed payments
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 sm:text-xl">
                DunningDog detects failing subscriptions before they churn,
                sends smart recovery sequences, and wins back revenue on
                autopilot. Connect Stripe and start recovering in minutes.
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link href="/register">
                  <Button size="lg" className="gap-2 px-8 text-base">
                    Start Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" size="lg" className="text-base">
                    View Pricing
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-sm text-zinc-500">
                7-day free trial &middot; No credit card required &middot; Cancel
                anytime
              </p>
            </div>

            {/* Hero visual — Dashboard preview card */}
            <div className="mx-auto mt-16 max-w-2xl">
              <div className="rounded-2xl border border-zinc-200 bg-white/90 p-6 shadow-xl shadow-zinc-200/50 sm:p-8">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-500">
                      This month&apos;s recovery
                    </p>
                    <p className="text-4xl font-bold text-accent-700">
                      $4,128
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-100">
                    <TrendingUp className="h-6 w-6 text-accent-600" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Recovery rate", value: "68%", icon: BarChart3 },
                    { label: "Active recoveries", value: "24", icon: RefreshCw },
                    { label: "Pre-dunning alerts", value: "11", icon: AlertTriangle },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl bg-zinc-50 p-3 text-center"
                    >
                      <stat.icon className="mx-auto mb-1 h-4 w-4 text-zinc-400" />
                      <p className="text-xl font-bold text-zinc-900">
                        {stat.value}
                      </p>
                      <p className="text-xs text-zinc-500">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Pain Point ── */}
        <section className="border-y border-zinc-100 bg-zinc-50 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                Failed payments are silently killing your MRR
              </h2>
              <p className="mt-4 text-lg text-zinc-600">
                On average, SaaS businesses lose{" "}
                <span className="font-semibold text-zinc-900">
                  9&ndash;12% of revenue
                </span>{" "}
                to involuntary churn every year. Most founders don&apos;t even
                notice until it&apos;s too late.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: CreditCard,
                  title: "Expired cards go unnoticed",
                  body: "Customers don't update their payment methods until it's too late. By then, their subscription has already churned.",
                },
                {
                  icon: DollarSign,
                  title: "Revenue leaks add up fast",
                  body: "A few failed payments per week compound into thousands of dollars in lost ARR. Every missed recovery is money left on the table.",
                },
                {
                  icon: Clock,
                  title: "Manual follow-up doesn't scale",
                  body: "Chasing failed payments by hand is tedious and error-prone. You have a product to build — not invoices to manage.",
                },
              ].map((pain) => (
                <div
                  key={pain.title}
                  className="rounded-xl border border-zinc-200 bg-white p-6"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                    <pain.icon className="h-5 w-5 text-red-500" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-zinc-900">
                    {pain.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-600">
                    {pain.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent-600">
                How it works
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                From Stripe to recovered revenue in 3 steps
              </h2>
            </div>
            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {[
                {
                  step: "1",
                  icon: Zap,
                  title: "Connect your Stripe account",
                  body: "One-click OAuth. No code changes, no webhooks to configure. DunningDog syncs with your subscriptions instantly.",
                },
                {
                  step: "2",
                  icon: Mail,
                  title: "Activate a recovery sequence",
                  body: "Choose from proven email templates or build your own. Set timing, tone, and escalation — we handle the rest.",
                },
                {
                  step: "3",
                  icon: BarChart3,
                  title: "Watch the revenue roll back in",
                  body: "Track every recovered dollar, recovery rate, and at-risk subscription from your real-time dashboard.",
                },
              ].map((item) => (
                <div key={item.step} className="relative text-center">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-100">
                    <item.icon className="h-6 w-6 text-accent-700" />
                  </div>
                  <span className="mb-2 inline-block rounded-full bg-accent-50 px-3 py-0.5 text-xs font-bold text-accent-700">
                    Step {item.step}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold text-zinc-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="border-y border-zinc-100 bg-zinc-50 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent-600">
                Features
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                Everything you need to stop involuntary churn
              </h2>
              <p className="mt-4 text-zinc-600">
                Built specifically for indie SaaS founders and small teams who
                run on Stripe.
              </p>
            </div>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: AlertTriangle,
                  title: "Pre-dunning alerts",
                  body: "Detect expiring cards and payment issues before they fail. Notify customers proactively so they update their details.",
                },
                {
                  icon: Mail,
                  title: "Smart email sequences",
                  body: "Multi-step recovery emails with customizable timing, escalation, and tone. Branded with your logo and colors.",
                },
                {
                  icon: BarChart3,
                  title: "Recovery dashboard",
                  body: "See failed revenue, recovered revenue, and recovery rate at a glance. Export reports as CSV anytime.",
                },
                {
                  icon: Zap,
                  title: "One-click Stripe setup",
                  body: "Connect via OAuth in under 60 seconds. No code changes, no webhook setup, no engineering work required.",
                },
                {
                  icon: Shield,
                  title: "Secure by default",
                  body: "Your Stripe data is encrypted at rest. We never store card numbers. SOC 2 practices built in from day one.",
                },
                {
                  icon: TrendingUp,
                  title: "ROI you can prove",
                  body: "Track every dollar recovered against the cost of your plan. Most teams see 10–30x ROI within the first month.",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-accent-200 hover:shadow-md hover:shadow-accent-100/50"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 transition-colors group-hover:bg-accent-100">
                    <feature.icon className="h-5 w-5 text-accent-600" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-zinc-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-600">
                    {feature.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="rounded-2xl bg-gradient-to-br from-accent-600 to-accent-800 px-6 py-14 text-center text-white sm:px-12 sm:py-20">
              <h2 className="text-2xl font-bold sm:text-3xl">
                Built for Stripe businesses that care about revenue
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-accent-100">
                DunningDog is designed to pay for itself from day one. Here&apos;s
                what automated recovery looks like.
              </p>
              <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4">
                {[
                  { value: "68%", label: "Avg. recovery rate" },
                  { value: "<5min", label: "Setup time" },
                  { value: "10–30x", label: "Typical ROI" },
                  { value: "$0", label: "To get started" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-3xl font-bold sm:text-4xl">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm text-accent-200">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Pricing Preview ── */}
        <section className="border-t border-zinc-100 bg-zinc-50 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent-600">
                Simple pricing
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                Plans that grow with your business
              </h2>
              <p className="mt-4 text-zinc-600">
                Start with a 7-day free trial. No credit card required. Upgrade
                or cancel anytime.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                {
                  name: "Starter",
                  price: "$49",
                  cap: "Up to $10k MRR",
                  highlight: false,
                },
                {
                  name: "Pro",
                  price: "$149",
                  cap: "Up to $50k MRR",
                  highlight: true,
                },
                {
                  name: "Scale",
                  price: "$199",
                  cap: "Up to $200k MRR",
                  highlight: false,
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-2xl border-2 p-6 text-center transition-shadow hover:shadow-lg sm:p-8 ${
                    plan.highlight
                      ? "border-accent-500 bg-white shadow-md shadow-accent-100"
                      : "border-zinc-200 bg-white"
                  }`}
                >
                  {plan.highlight && (
                    <span className="mb-4 inline-block rounded-full bg-accent-500 px-4 py-1 text-xs font-semibold text-white">
                      Most popular
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-zinc-900">
                    {plan.name}
                  </h3>
                  <p className="mt-3">
                    <span className="text-4xl font-bold text-zinc-900">
                      {plan.price}
                    </span>
                    <span className="text-zinc-500">/mo</span>
                  </p>
                  <p className="mt-2 text-sm text-zinc-500">{plan.cap}</p>
                  <Link href="/register" className="mt-6 block">
                    <Button
                      className={`w-full ${
                        plan.highlight ? "" : "bg-zinc-900 hover:bg-zinc-800"
                      }`}
                    >
                      Start Free Trial
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1 text-sm font-medium text-accent-600 hover:text-accent-700"
              >
                Compare all features
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="mb-12 text-center text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              Frequently asked questions
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: "How does DunningDog connect to Stripe?",
                  a: "We use Stripe Connect (OAuth). You click one button, authorize access, and we start syncing your subscription data immediately. No API keys to copy, no webhooks to configure.",
                },
                {
                  q: "Will this affect my existing Stripe setup?",
                  a: "Not at all. DunningDog is read-only by default — we monitor events and send recovery emails, but we never modify your Stripe configuration or subscriptions.",
                },
                {
                  q: "How quickly will I see results?",
                  a: "Most teams recover their first failed payment within the first week. ROI depends on your volume, but businesses with 100+ active subscriptions typically see 10–30x return on their plan cost.",
                },
                {
                  q: "Can I customize the recovery emails?",
                  a: "Yes. You can customize timing, subject lines, body copy, and branding (logo, colors) on Pro and higher plans. Starter includes a proven 3-step default sequence.",
                },
                {
                  q: "What happens after the free trial?",
                  a: "After 7 days, you pick a plan that fits your MRR. No credit card is required to start, and you can cancel anytime. Your recovery data is preserved if you return later.",
                },
                {
                  q: "Is my data secure?",
                  a: "Absolutely. All data is encrypted at rest and in transit. We never store card numbers — Stripe handles that. We follow SOC 2 security practices and run on enterprise-grade infrastructure.",
                },
              ].map((faq) => (
                <div
                  key={faq.q}
                  className="rounded-xl border border-zinc-200 bg-white p-6"
                >
                  <h3 className="text-base font-semibold text-zinc-900">
                    {faq.q}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="border-t border-zinc-100 bg-zinc-50 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl">
              Ready to recover lost revenue?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-600">
              Join SaaS founders who use DunningDog to put payment recovery on
              autopilot. Set up in under 5 minutes.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/register">
                <Button size="lg" className="gap-2 px-8 text-base">
                  Start Your Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-zinc-500">
              {[
                "7-day free trial",
                "No credit card required",
                "Cancel anytime",
              ].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-accent-500" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
