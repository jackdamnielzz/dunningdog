import Link from "next/link";
import { Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SolutionData } from "@/components/marketing/solution-data";

export function SolutionPage({ data }: { data: SolutionData }) {
  const Icon = data.icon;

  return (
    <>
      {/* Hero */}
      <section className="px-4 pb-8 pt-16 text-center sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-100">
            <Icon className="h-7 w-7 text-accent-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
            {data.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600">
            {data.heroDescription}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register">
              <Button size="lg">Start Free Trial</Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 py-10 sm:px-6">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4">
          {data.stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-accent-600">{stat.value}</p>
              <p className="mt-1 text-sm text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Problem */}
      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-zinc-900">{data.problemTitle}</h2>
          <p className="mt-3 text-zinc-600">{data.problemDescription}</p>
          <ul className="mt-6 space-y-3">
            {data.problemPoints.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 rounded-lg border border-red-100 bg-red-50/50 p-4"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                <p className="text-sm text-zinc-700">{point}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Solution */}
      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-zinc-900">
              {data.solutionTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-zinc-600">
              {data.solutionDescription}
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {data.solutionPoints.map((point) => (
              <div
                key={point.title}
                className="rounded-xl border border-zinc-200 bg-white p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-100">
                  <Check className="h-5 w-5 text-accent-600" />
                </div>
                <h3 className="mt-4 font-semibold text-zinc-900">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-zinc-900">
            How it works
          </h2>
          <div className="space-y-6">
            {data.howItWorks.map((step, i) => (
              <div key={step.title} className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-600 text-sm font-bold text-white">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900">{step.title}</h3>
                  <p className="mt-1 text-sm text-zinc-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI callout */}
      <section className="px-4 py-12 sm:px-6">
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
            <Button
              variant="outline"
              size="lg"
              className="bg-white text-accent-700 hover:bg-accent-50"
            >
              Start your free 7-day trial
            </Button>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-zinc-900">
            Frequently asked questions
          </h2>
          <dl className="space-y-6">
            {data.faqs.map((faq) => (
              <div
                key={faq.q}
                className="rounded-lg border border-zinc-200 p-5"
              >
                <dt className="font-semibold text-zinc-900">{faq.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-zinc-600">
                  {faq.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-100 px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-zinc-900">
          Ready to stop losing revenue?
        </h2>
        <p className="mt-2 text-zinc-600">
          7-day free trial. No credit card required. Setup in under 5 minutes.
        </p>
        <Link href="/register" className="mt-6 inline-block">
          <Button size="lg">Get started for free</Button>
        </Link>
      </section>
    </>
  );
}
