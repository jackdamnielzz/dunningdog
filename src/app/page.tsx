import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Zap,
  XCircle,
  Quote,
  Star,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";
import { getAuthenticatedUserIdFromHeaders } from "@/lib/auth";
import { PLAN_TIERS } from "@/lib/plans";
import {
  PAIN_POINTS,
  STEPS,
  FEATURES,
  STATS,
  FAQS,
  WITHOUT_DUNNINGDOG,
  WITH_DUNNINGDOG,
  TESTIMONIALS,
  FAQ_JSON_LD,
} from "@/components/marketing/landing-data";

/* ── Pricing from single source of truth ── */

const PRICING_PREVIEW = PLAN_TIERS.map((tier) => ({
  name: tier.name,
  price: `$${tier.monthly}`,
  cap: tier.cap,
  highlight: tier.id === "pro",
}));

/* ── Page ── */

export default async function Home() {
  const requestHeaders = await headers();
  const userId = await getAuthenticatedUserIdFromHeaders(requestHeaders);
  if (userId) {
    redirect("/app");
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* FAQ structured data for Google rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />

      <MarketingHeader variant="landing" />

      <main>
        {/* ── Hero ── */}
        <section className="noise-overlay relative overflow-hidden">
          {/* Mesh gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-accent-50/80 via-white to-white" />
          <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-accent-200/30 blur-[100px] animate-pulse-glow" />
          <div className="absolute top-20 right-1/4 h-[400px] w-[400px] rounded-full bg-blue-200/20 blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
          <div className="absolute bottom-0 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-accent-100/40 blur-[80px]" />

          <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-20 sm:px-6 sm:pb-28 sm:pt-28 lg:pb-36 lg:pt-32">
            <div className="mx-auto max-w-3xl text-center">
              {/* Badge */}
              <div className="animate-slide-up">
                <p className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent-200/60 bg-white/80 px-5 py-2 text-sm font-semibold text-accent-700 shadow-sm backdrop-blur-sm">
                  <Zap className="h-3.5 w-3.5" />
                  Automated payment recovery for Stripe
                </p>
              </div>

              {/* Headline */}
              <h1 className="animate-slide-up-delay-1 text-4xl font-extrabold leading-[1.08] tracking-tight text-zinc-900 sm:text-5xl lg:text-[3.5rem]">
                Stop losing revenue to{" "}
                <span className="relative">
                  <span className="bg-gradient-to-r from-accent-600 via-accent-500 to-accent-700 bg-clip-text text-transparent">
                    failed payments
                  </span>
                  <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-accent-400 to-accent-600 opacity-60" />
                </span>
              </h1>

              {/* Subheadline */}
              <p className="animate-slide-up-delay-2 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-500 sm:text-xl">
                DunningDog detects failing subscriptions before they churn,
                sends smart recovery sequences, and wins back revenue on
                autopilot.
              </p>

              {/* CTA buttons */}
              <div className="animate-slide-up-delay-3 mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="gap-2 rounded-xl px-8 py-6 text-base font-semibold shadow-lg shadow-accent-500/25 transition-all hover:shadow-xl hover:shadow-accent-500/30 hover:-translate-y-0.5"
                  >
                    Start Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-xl px-8 py-6 text-base font-semibold"
                  >
                    View Pricing
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="animate-fade-in mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6">
                <span className="flex items-center gap-1.5 text-sm text-zinc-400">
                  <ShieldCheck className="h-4 w-4 text-accent-500" />
                  7-day free trial
                </span>
                <span className="hidden h-1 w-1 rounded-full bg-zinc-300 sm:block" />
                <span className="flex items-center gap-1.5 text-sm text-zinc-400">
                  <CheckCircle2 className="h-4 w-4 text-accent-500" />
                  No credit card required
                </span>
                <span className="hidden h-1 w-1 rounded-full bg-zinc-300 sm:block" />
                <span className="flex items-center gap-1.5 text-sm text-zinc-400">
                  <Users className="h-4 w-4 text-accent-500" />
                  Trusted by SaaS teams
                </span>
              </div>
            </div>

            {/* Dashboard preview with glow */}
            <div className="relative mx-auto mt-16 max-w-2xl animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-accent-200/30 to-transparent blur-2xl" />
              <div className="relative animate-float" style={{ animationDuration: "8s" }}>
                <DashboardPreview />
              </div>
            </div>
          </div>
        </section>

        {/* ── Social proof bar ── */}
        <section className="border-y border-zinc-100 bg-zinc-50/50 py-6">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 text-sm text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Zap className="h-4 w-4 text-accent-500" />
              Works with any Stripe account
            </span>
            <span className="hidden h-4 w-px bg-zinc-200 sm:block" />
            <span>Setup in under 5 minutes</span>
            <span className="hidden h-4 w-px bg-zinc-200 sm:block" />
            <span>68% avg. recovery rate</span>
            <span className="hidden h-4 w-px bg-zinc-200 sm:block" />
            <span>10&ndash;30x typical ROI</span>
          </div>
        </section>

        {/* ── Pain Points ── */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-red-500">
                The problem
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl">
                Failed payments are silently killing your MRR
              </h2>
              <p className="mt-4 text-lg text-zinc-500">
                On average, SaaS businesses lose{" "}
                <span className="font-semibold text-zinc-900">
                  9&ndash;12% of revenue
                </span>{" "}
                to involuntary churn every year.
              </p>
            </div>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {PAIN_POINTS.map((pain, i) => (
                <div
                  key={pain.title}
                  className="group relative rounded-2xl border border-zinc-200/80 bg-white p-7 transition-all duration-300 hover:border-red-200 hover:shadow-lg hover:shadow-red-50 hover:-translate-y-1"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-300 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 transition-colors group-hover:bg-red-100">
                    <pain.icon className="h-6 w-6 text-red-500" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-zinc-900">
                    {pain.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-500">
                    {pain.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Before / After ── */}
        <section className="border-y border-zinc-100 bg-zinc-50/50 py-20 sm:py-28">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent-600">
                The transformation
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl">
                The difference is night and day
              </h2>
            </div>
            <div className="mt-14 grid gap-8 md:grid-cols-2">
              {/* Without */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-red-100 bg-gradient-to-br from-red-50/80 to-white p-7 sm:p-9">
                <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-red-100/50 blur-2xl" />
                <p className="relative mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-red-400">
                  <XCircle className="h-4 w-4" />
                  Without DunningDog
                </p>
                <ul className="relative space-y-4">
                  {WITHOUT_DUNNINGDOG.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-zinc-600">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              {/* With */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-accent-200 bg-gradient-to-br from-accent-50/80 to-white p-7 shadow-lg shadow-accent-100/30 sm:p-9">
                <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-accent-100/50 blur-2xl" />
                <p className="relative mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-accent-600">
                  <CheckCircle2 className="h-4 w-4" />
                  With DunningDog
                </p>
                <ul className="relative space-y-4">
                  {WITH_DUNNINGDOG.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm font-medium text-zinc-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent-600">
                How it works
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl">
                From Stripe to recovered revenue in 3 steps
              </h2>
            </div>
            <div className="relative mt-16 grid gap-8 md:grid-cols-3">
              {/* Connecting line */}
              <div className="absolute top-10 right-[calc(33.333%+2rem)] left-[calc(33.333%-2rem)] hidden h-[2px] bg-gradient-to-r from-accent-200 via-accent-400 to-accent-200 md:block" />
              {STEPS.map((item, i) => (
                <div key={item.step} className="group relative text-center">
                  {/* Step number circle */}
                  <div className="relative z-10 mx-auto mb-6 flex h-20 w-20 items-center justify-center">
                    <div className="absolute inset-0 rounded-2xl bg-accent-100/50 transition-all duration-300 group-hover:scale-110 group-hover:bg-accent-100" />
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-xl border-2 border-accent-200 bg-white shadow-sm transition-shadow group-hover:shadow-md">
                      <item.icon className="h-7 w-7 text-accent-600" />
                    </div>
                    <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-accent-600 text-xs font-bold text-white shadow-md">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-zinc-900">
                    {item.title}
                  </h3>
                  <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-zinc-500">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="border-y border-zinc-100 bg-zinc-50/50 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent-600">
                Features
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl">
                Everything you need to stop involuntary churn
              </h2>
              <p className="mt-4 text-lg text-zinc-500">
                Built specifically for indie SaaS founders and small teams who
                run on Stripe.
              </p>
            </div>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature, i) => (
                <div
                  key={feature.title}
                  className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-7 transition-all duration-300 hover:border-accent-200 hover:shadow-lg hover:shadow-accent-50 hover:-translate-y-1"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-400 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 transition-all duration-300 group-hover:bg-accent-100 group-hover:scale-110">
                    <feature.icon className="h-6 w-6 text-accent-600" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-zinc-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-500">
                    {feature.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent-600">
                What founders say
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl">
                Trusted by SaaS teams who hate losing revenue
              </h2>
            </div>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.name}
                  className="group relative flex flex-col rounded-2xl border border-zinc-200/80 bg-white p-7 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  {/* Top accent line */}
                  <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-accent-400 to-accent-600 opacity-0 transition-opacity group-hover:opacity-100" />

                  {/* Stars */}
                  <div className="mb-4 flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <p className="flex-1 text-sm leading-relaxed text-zinc-600">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  <div className="mt-6 flex items-center gap-3 border-t border-zinc-100 pt-5">
                    {/* Avatar placeholder */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-100 text-sm font-bold text-accent-700">
                      {t.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">
                        {t.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {t.role}, {t.company}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 px-6 py-16 text-center text-white sm:px-12 sm:py-24">
              {/* Decorative gradients */}
              <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-accent-500/20 blur-[80px]" />
              <div className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-accent-400/15 blur-[60px]" />

              <div className="relative">
                <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
                  Built for Stripe businesses that care about revenue
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-zinc-400">
                  DunningDog is designed to pay for itself from day one.
                </p>
                <div className="mt-14 grid grid-cols-2 gap-8 sm:grid-cols-4">
                  {STATS.map((stat) => (
                    <div key={stat.label} className="group">
                      <p className="text-3xl font-extrabold tabular-nums sm:text-5xl bg-gradient-to-b from-white to-zinc-300 bg-clip-text text-transparent">
                        {stat.value}
                      </p>
                      <p className="mt-2 text-sm text-zinc-400">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Pricing Preview ── */}
        <section className="border-y border-zinc-100 bg-zinc-50/50 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent-600">
                Simple pricing
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl">
                Plans that grow with your business
              </h2>
              <p className="mt-4 text-lg text-zinc-500">
                Start with a 7-day free trial. No credit card required.
              </p>
            </div>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {PRICING_PREVIEW.map((plan) => (
                <div
                  key={plan.name}
                  className={`group relative overflow-hidden rounded-2xl border-2 p-7 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 sm:p-9 ${
                    plan.highlight
                      ? "border-accent-500 bg-white shadow-lg shadow-accent-100/50"
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                  }`}
                >
                  {plan.highlight && (
                    <>
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent-400 via-accent-500 to-accent-600" />
                      <span className="mb-4 inline-block rounded-full bg-accent-600 px-4 py-1 text-xs font-semibold text-white shadow-md shadow-accent-500/25">
                        Most popular
                      </span>
                    </>
                  )}
                  <h3 className="text-lg font-semibold text-zinc-900">
                    {plan.name}
                  </h3>
                  <p className="mt-4">
                    <span className="text-5xl font-extrabold text-zinc-900">
                      {plan.price}
                    </span>
                    <span className="text-zinc-400">/mo</span>
                  </p>
                  <p className="mt-2 text-sm text-zinc-500">{plan.cap}</p>
                  <Link href="/register" className="mt-8 block">
                    <Button
                      className={`w-full rounded-xl py-5 text-sm font-semibold transition-all ${
                        plan.highlight
                          ? "shadow-md shadow-accent-500/25 hover:shadow-lg hover:shadow-accent-500/30"
                          : "bg-zinc-900 hover:bg-zinc-800"
                      }`}
                    >
                      Start Free Trial
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-600 transition-colors hover:text-accent-700"
              >
                Compare all features
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent-600">
                FAQ
              </p>
              <h2 className="mb-14 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl">
                Frequently asked questions
              </h2>
            </div>
            <div className="space-y-4">
              {FAQS.map((faq) => (
                <div
                  key={faq.q}
                  className="group rounded-2xl border border-zinc-200/80 bg-white p-6 transition-all duration-200 hover:border-zinc-300 hover:shadow-sm sm:p-7"
                >
                  <h3 className="text-base font-semibold text-zinc-900">
                    {faq.q}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="relative overflow-hidden border-t border-zinc-100">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-accent-50/50 via-accent-50/30 to-white" />
          <div className="absolute top-0 left-1/3 h-[300px] w-[300px] rounded-full bg-accent-200/20 blur-[80px]" />
          <div className="absolute bottom-0 right-1/3 h-[250px] w-[250px] rounded-full bg-accent-100/30 blur-[80px]" />

          <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
              Ready to recover lost revenue?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-500">
              Join SaaS founders who use DunningDog to put payment recovery on
              autopilot. Set up in under 5 minutes.
            </p>
            <div className="mt-10">
              <Link href="/register">
                <Button
                  size="lg"
                  className="gap-2 rounded-xl px-10 py-6 text-base font-semibold shadow-lg shadow-accent-500/25 transition-all hover:shadow-xl hover:shadow-accent-500/30 hover:-translate-y-0.5"
                >
                  Start Your Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-zinc-500">
              {[
                "7-day free trial",
                "No credit card required",
                "Cancel anytime",
              ].map((item) => (
                <span key={item} className="flex items-center gap-2">
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
