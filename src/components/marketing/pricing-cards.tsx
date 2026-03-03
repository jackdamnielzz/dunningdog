"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PLAN_TIERS, type PlanTier } from "@/lib/plans";

type FeatureStatus = "included" | "excluded";

interface Feature {
  text: string;
  status: FeatureStatus;
}

interface TierDisplay extends PlanTier {
  highlight: boolean;
  features: Feature[];
}

const TIER_DISPLAY: Record<string, { highlight: boolean; features: Feature[] }> = {
  starter: {
    highlight: false,
    features: [
      { text: "Automated payment recovery", status: "included" },
      { text: "Pre-dunning alerts (expiring cards)", status: "included" },
      { text: "3-step email sequence", status: "included" },
      { text: "Recovery dashboard & metrics", status: "included" },
      { text: "Stripe integration", status: "included" },
      { text: "Analytics & CSV exports", status: "included" },
      { text: "Custom email branding", status: "excluded" },
      { text: "Slack & Discord alerts", status: "excluded" },
      { text: "White-label payment page", status: "excluded" },
      { text: "API access", status: "excluded" },
    ],
  },
  pro: {
    highlight: true,
    features: [
      { text: "Automated payment recovery", status: "included" },
      { text: "Pre-dunning alerts (expiring cards)", status: "included" },
      { text: "Unlimited sequence steps", status: "included" },
      { text: "Recovery dashboard & metrics", status: "included" },
      { text: "Stripe integration", status: "included" },
      { text: "Analytics & CSV exports", status: "included" },
      { text: "Custom email branding", status: "included" },
      { text: "Slack & Discord alerts", status: "included" },
      { text: "White-label payment page", status: "excluded" },
      { text: "API access", status: "excluded" },
    ],
  },
  growth: {
    highlight: false,
    features: [
      { text: "Automated payment recovery", status: "included" },
      { text: "Pre-dunning alerts (expiring cards)", status: "included" },
      { text: "Unlimited sequence steps", status: "included" },
      { text: "Recovery dashboard & metrics", status: "included" },
      { text: "Stripe integration", status: "included" },
      { text: "Analytics & CSV exports", status: "included" },
      { text: "Custom email branding", status: "included" },
      { text: "Slack & Discord alerts", status: "included" },
      { text: "White-label payment page", status: "included" },
      { text: "API access", status: "included" },
    ],
  },
};

const tiers: TierDisplay[] = PLAN_TIERS.map((tier) => ({
  ...tier,
  ...TIER_DISPLAY[tier.id],
}));

function FeatureIcon({ status }: { status: FeatureStatus }) {
  if (status === "included") {
    return (
      <svg
        className="mt-0.5 h-4 w-4 shrink-0 text-accent-500"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    );
  }
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 text-zinc-300"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function PricingCards() {
  const [annual, setAnnual] = useState(false);

  return (
    <div>
      {/* Billing toggle */}
      <div className="mb-10 flex items-center justify-center gap-3">
        <span
          className={`text-sm font-medium ${!annual ? "text-zinc-900" : "text-zinc-400"}`}
        >
          Monthly
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={annual}
          onClick={() => setAnnual(!annual)}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
            annual ? "bg-accent-500" : "bg-zinc-300"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-sm ring-0 transition-transform ${
              annual ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <span
          className={`text-sm font-medium ${annual ? "text-zinc-900" : "text-zinc-400"}`}
        >
          Annual
        </span>
        {annual && (
          <span className="rounded-full bg-accent-100 px-2.5 py-0.5 text-xs font-semibold text-accent-700">
            Save extra
          </span>
        )}
      </div>

      {/* Cards */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3">
        {tiers.map((tier) => {
          const price = annual ? tier.annualPerMonth : tier.monthly;
          const savePct = Math.round((1 - tier.annualPerMonth / tier.monthly) * 100);
          const yearlyTotal = annual ? tier.annualPerMonth * 12 : null;

          return (
            <div
              key={tier.id}
              className={`relative flex flex-col rounded-2xl border-2 p-5 transition-shadow hover:shadow-lg sm:p-6 lg:p-8 ${
                tier.highlight
                  ? "border-accent-500 bg-white shadow-md shadow-accent-100"
                  : "border-zinc-200 bg-white"
              }`}
            >
              {tier.highlight && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-accent-500 px-4 py-1 text-xs font-semibold text-white">
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
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-zinc-900">${price}</span>
                  <span className="text-zinc-500">/mo</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {annual ? (
                    <>
                      <span className="inline-block rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-700">
                        Save {savePct}%
                      </span>
                      <span className="text-xs text-zinc-400">
                        ${yearlyTotal}/yr billed annually
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-zinc-400">billed monthly</span>
                  )}
                </div>
              </div>

              {/* MRR cap */}
              <div className="mb-6 rounded-lg bg-zinc-50 px-3 py-2">
                <p className="text-sm font-medium text-zinc-700">{tier.cap}</p>
              </div>

              {/* CTA */}
              <Link href="/register" className="mb-8 block">
                <Button
                  className={`w-full ${
                    tier.highlight ? "" : "bg-zinc-900 hover:bg-zinc-800"
                  }`}
                  size="lg"
                >
                  Start free trial
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
                      <FeatureIcon status={feature.status} />
                      <span
                        className={`text-sm ${
                          feature.status === "excluded"
                            ? "text-zinc-400"
                            : "text-zinc-700"
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
