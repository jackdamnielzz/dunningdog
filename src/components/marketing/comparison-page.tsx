import Link from "next/link";
import { Check, X, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CompetitorData } from "@/components/marketing/compare-data";
import { DUNNINGDOG_PRICING } from "@/components/marketing/compare-data";

function FeatureCell({ value }: { value: string | boolean }) {
  if (value === true)
    return <Check className="mx-auto h-5 w-5 text-accent-600" aria-label="Yes" />;
  if (value === false)
    return <X className="mx-auto h-5 w-5 text-zinc-300" aria-label="No" />;
  return <span className="text-sm text-zinc-700">{value}</span>;
}

export function ComparisonPage({ data }: { data: CompetitorData }) {
  return (
    <>
      {/* Hero */}
      <section className="px-4 pb-8 pt-16 text-center sm:px-6">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-600">
            Comparison
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
            DunningDog vs {data.name}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600">
            {data.tagline}. See how DunningDog compares on features, pricing,
            and ease of use.
          </p>
        </div>
      </section>

      {/* Quick comparison cards */}
      <section className="px-4 pb-12 sm:px-6">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
          {/* DunningDog card */}
          <div className="rounded-2xl border-2 border-accent-200 bg-accent-50/50 p-6">
            <h2 className="text-xl font-bold text-accent-700">DunningDog</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Automated payment recovery for Stripe
            </p>
            <div className="mt-4 space-y-1">
              <p className="text-3xl font-bold text-zinc-900">
                ${DUNNINGDOG_PRICING.starter.monthly}
                <span className="text-base font-normal text-zinc-500">/mo</span>
              </p>
              <p className="text-sm text-zinc-500">
                Flat rate, starting price. No take rate.
              </p>
            </div>
            <ul className="mt-4 space-y-2">
              {[
                "7-day free trial, no credit card",
                "One-click Stripe setup (<5 min)",
                "Pre-dunning card expiry alerts",
                "Custom email sequences",
                "Real-time dashboard & analytics",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-zinc-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {/* Competitor card */}
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6">
            <h2 className="text-xl font-bold text-zinc-700">{data.name}</h2>
            <p className="mt-1 text-sm text-zinc-600">{data.tagline}</p>
            <div className="mt-4 space-y-1">
              <p className="text-3xl font-bold text-zinc-900">{data.priceRange}</p>
              <p className="text-sm text-zinc-500">{data.pricingModel}</p>
            </div>
            <ul className="mt-4 space-y-2">
              {data.prosCompetitor.slice(0, 5).map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-zinc-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Feature comparison table */}
      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-zinc-900">
            Feature-by-feature comparison
          </h2>
          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="px-4 py-3 font-semibold text-zinc-900">Feature</th>
                  <th className="px-4 py-3 text-center font-semibold text-accent-700">
                    DunningDog
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-zinc-700">
                    {data.name}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.features.map((feature, i) => (
                  <tr
                    key={feature.name}
                    className={i % 2 === 0 ? "bg-white" : "bg-zinc-50/50"}
                  >
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {feature.name}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <FeatureCell value={feature.dunningdog} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <FeatureCell value={feature.competitor} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Why DunningDog */}
      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-zinc-900">
            Why teams switch from {data.name} to DunningDog
          </h2>
          <div className="space-y-4">
            {data.whyDunningDog.map((reason) => (
              <div
                key={reason}
                className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white p-4"
              >
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" />
                <p className="text-zinc-700">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Drawbacks of competitor */}
      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-zinc-900">
            Common concerns with {data.name}
          </h2>
          <div className="space-y-4">
            {data.consCompetitor.map((con) => (
              <div
                key={con}
                className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white p-4"
              >
                <Minus className="mt-0.5 h-5 w-5 shrink-0 text-zinc-400" />
                <p className="text-zinc-600">{con}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who is each tool best for */}
      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:p-8">
          <h2 className="mb-4 text-xl font-bold text-zinc-900">
            Who is each tool best for?
          </h2>
          <p className="leading-relaxed text-zinc-700">{data.idealFor}</p>
        </div>
      </section>

      {/* Pricing comparison */}
      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-zinc-900">
            Pricing comparison
          </h2>
          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="px-4 py-3 font-semibold text-zinc-900">Plan</th>
                  <th className="px-4 py-3 text-center font-semibold text-accent-700">
                    DunningDog
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-zinc-700">
                    {data.name}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="px-4 py-3 font-medium text-zinc-900">Starting price</td>
                  <td className="px-4 py-3 text-center font-semibold text-accent-700">
                    ${DUNNINGDOG_PRICING.starter.monthly}/mo
                  </td>
                  <td className="px-4 py-3 text-center text-zinc-700">
                    {data.priceRange}
                  </td>
                </tr>
                <tr className="bg-zinc-50/50">
                  <td className="px-4 py-3 font-medium text-zinc-900">Pricing model</td>
                  <td className="px-4 py-3 text-center text-zinc-700">
                    Flat rate, no take rate
                  </td>
                  <td className="px-4 py-3 text-center text-zinc-700">
                    {data.pricingModel}
                  </td>
                </tr>
                <tr className="bg-white">
                  <td className="px-4 py-3 font-medium text-zinc-900">Free trial</td>
                  <td className="px-4 py-3 text-center">
                    <Check className="mx-auto h-5 w-5 text-accent-600" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <X className="mx-auto h-5 w-5 text-zinc-300" />
                  </td>
                </tr>
                <tr className="bg-zinc-50/50">
                  <td className="px-4 py-3 font-medium text-zinc-900">Annual discount</td>
                  <td className="px-4 py-3 text-center text-zinc-700">
                    From ${DUNNINGDOG_PRICING.starter.annual}/mo
                  </td>
                  <td className="px-4 py-3 text-center text-zinc-700">Varies</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-100 px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-zinc-900">
          Ready to recover more revenue?
        </h2>
        <p className="mt-2 text-zinc-600">
          7-day free trial. No credit card required. Setup in under 5 minutes.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/register">
            <Button size="lg">Start Free Trial</Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline">
              View Pricing
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
