"use client";

import Link from "next/link";

interface TrialBannerProps {
  daysRemaining: number;
}

export function TrialBanner({ daysRemaining }: TrialBannerProps) {
  const isUrgent = daysRemaining <= 2;

  return (
    <div
      className={`border-b px-6 py-2 text-center text-sm font-medium ${
        isUrgent
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : "border-accent-100 bg-accent-50 text-accent-800"
      }`}
    >
      {daysRemaining === 1
        ? "Your free trial ends tomorrow."
        : `${daysRemaining} days left in your free trial.`}{" "}
      <Link
        href="/app/settings"
        className={`font-semibold underline ${
          isUrgent ? "text-amber-900" : "text-accent-900"
        }`}
      >
        Choose a plan
      </Link>
    </div>
  );
}
