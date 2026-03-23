"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const DUNNINGDOG_RECOVERY_RATE = 0.6;
const DUNNINGDOG_PRICE = 49;

export default function ChurnCalculatorPage() {
  const [mrr, setMrr] = useState(50_000);
  const [failureRate, setFailureRate] = useState(5);
  const [currentRecoveryRate, setCurrentRecoveryRate] = useState(20);

  const atRisk = mrr * (failureRate / 100);
  const currentlyRecovered = atRisk * (currentRecoveryRate / 100);
  const currentlyLost = atRisk - currentlyRecovered;
  const withDunningDog = atRisk * DUNNINGDOG_RECOVERY_RATE;
  const additionalRecovery = withDunningDog - currentlyRecovered;
  const annualAdditionalRecovery = additionalRecovery * 12;
  const roi = additionalRecovery / DUNNINGDOG_PRICE;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          How much revenue are you losing to{" "}
          <span className="text-accent-600">failed payments</span>?
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          The average SaaS loses 5-10% of MRR to involuntary churn from failed
          payments. Use this calculator to see how much you could recover.
        </p>
      </div>

      {/* Calculator grid */}
      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        {/* Inputs */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">
            Your numbers
          </h2>

          <div className="mt-6 space-y-8">
            {/* MRR */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="mrr"
                  className="text-sm font-medium text-zinc-700"
                >
                  Monthly Recurring Revenue (MRR)
                </label>
                <span className="text-sm font-semibold text-zinc-900">
                  {fmt.format(mrr)}
                </span>
              </div>
              <input
                id="mrr"
                type="range"
                min={1000}
                max={500000}
                step={1000}
                value={mrr}
                onChange={(e) => setMrr(Number(e.target.value))}
                className="mt-2 w-full accent-accent-600"
              />
              <div className="mt-1 flex justify-between text-xs text-zinc-500">
                <span>$1k</span>
                <span>$500k</span>
              </div>
            </div>

            {/* Failure rate */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="failureRate"
                  className="text-sm font-medium text-zinc-700"
                >
                  Payment failure rate
                </label>
                <span className="text-sm font-semibold text-zinc-900">
                  {failureRate}%
                </span>
              </div>
              <input
                id="failureRate"
                type="range"
                min={1}
                max={15}
                step={0.5}
                value={failureRate}
                onChange={(e) => setFailureRate(Number(e.target.value))}
                className="mt-2 w-full accent-accent-600"
              />
              <div className="mt-1 flex justify-between text-xs text-zinc-500">
                <span>1%</span>
                <span>15%</span>
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                Industry average: 5-10% of charges fail
              </p>
            </div>

            {/* Current recovery rate */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="recoveryRate"
                  className="text-sm font-medium text-zinc-700"
                >
                  Current recovery rate (without dunning)
                </label>
                <span className="text-sm font-semibold text-zinc-900">
                  {currentRecoveryRate}%
                </span>
              </div>
              <input
                id="recoveryRate"
                type="range"
                min={0}
                max={50}
                step={1}
                value={currentRecoveryRate}
                onChange={(e) =>
                  setCurrentRecoveryRate(Number(e.target.value))
                }
                className="mt-2 w-full accent-accent-600"
              />
              <div className="mt-1 flex justify-between text-xs text-zinc-500">
                <span>0%</span>
                <span>50%</span>
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                Stripe&apos;s built-in retry recovers ~15-25% on average
              </p>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Current situation */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-zinc-900">
              Your current situation
            </h2>
            <dl className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-zinc-600">
                  Monthly revenue at risk
                </dt>
                <dd className="text-sm font-semibold text-zinc-900">
                  {fmt.format(atRisk)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-zinc-600">Currently recovered</dt>
                <dd className="text-sm font-medium text-zinc-700">
                  {fmt.format(currentlyRecovered)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
                <dt className="text-sm font-medium text-red-600">
                  Revenue lost every month
                </dt>
                <dd className="text-lg font-bold text-red-600">
                  {fmt.format(currentlyLost)}
                </dd>
              </div>
            </dl>
          </div>

          {/* With DunningDog */}
          <div className="rounded-xl border-2 border-accent-200 bg-accent-50/50 p-6">
            <h2 className="text-lg font-semibold text-zinc-900">
              With DunningDog
            </h2>
            <dl className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-zinc-600">
                  Recovered with DunningDog (60% avg)
                </dt>
                <dd className="text-sm font-semibold text-zinc-900">
                  {fmt.format(withDunningDog)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-zinc-600">
                  Additional revenue saved
                </dt>
                <dd className="text-sm font-semibold text-accent-600">
                  +{fmt.format(additionalRecovery)}/mo
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-accent-200 pt-3">
                <dt className="text-sm font-medium text-zinc-900">
                  Annual additional recovery
                </dt>
                <dd className="text-xl font-bold text-accent-600">
                  {fmt.format(annualAdditionalRecovery)}
                </dd>
              </div>
            </dl>

            {/* ROI badge */}
            {additionalRecovery > 0 && (
              <div className="mt-4 rounded-lg bg-accent-100 px-4 py-3 text-center">
                <p className="text-sm text-zinc-700">
                  That&apos;s a{" "}
                  <span className="font-bold text-accent-700">
                    {Math.round(roi)}x return
                  </span>{" "}
                  on the {fmt.format(DUNNINGDOG_PRICE)}/mo Starter plan
                </p>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link href="/register">
              <Button size="lg" className="w-full text-base">
                Start recovering revenue — free 14-day trial
              </Button>
            </Link>
            <p className="mt-2 text-xs text-zinc-500">
              No credit card required. Set up in under 5 minutes.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom context */}
      <div className="mx-auto mt-16 max-w-2xl text-center">
        <h2 className="text-2xl font-bold text-zinc-900">
          Why do payments fail?
        </h2>
        <p className="mt-4 text-zinc-600">
          Credit cards expire, reach spending limits, or get flagged by fraud
          filters. These &ldquo;soft&rdquo; declines are recoverable — but only
          if you follow up quickly with the right strategy. DunningDog
          automates smart retry timing and personalized recovery emails so you
          get paid without lifting a finger.
        </p>
        <div className="mt-8 grid gap-6 text-left sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <p className="text-2xl font-bold text-accent-600">5-10%</p>
            <p className="mt-1 text-sm text-zinc-600">
              of subscription charges fail each month on average
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <p className="text-2xl font-bold text-accent-600">60%+</p>
            <p className="mt-1 text-sm text-zinc-600">
              average recovery rate with automated dunning
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <p className="text-2xl font-bold text-accent-600">&lt; 5 min</p>
            <p className="mt-1 text-sm text-zinc-600">
              to connect your Stripe account and start recovering
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
