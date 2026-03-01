import type { Metadata } from "next";
import { PolicyPageLayout } from "@/components/layouts/policy-page-layout";

export const metadata: Metadata = {
  title: "Refund Policy | DunningDog",
  description: "Subscription refund and cancellation terms for DunningDog.",
};

export default function RefundsPolicyPage() {
  return (
    <PolicyPageLayout>
          <p className="text-sm font-medium text-accent-700">Last updated: February 28, 2026</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
            Refund Policy
          </h1>
          <div className="mt-8 space-y-6 text-sm leading-7 text-zinc-700">
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-900">1. Subscription Billing</h2>
              <p>
                DunningDog plans are billed on a recurring cycle and renew automatically
                unless canceled before the next billing date.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-900">2. Initial Purchase Refunds</h2>
              <p>
                First-time subscriptions are eligible for a full refund if requested
                within 14 calendar days of the initial charge.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-900">3. Renewal Charges</h2>
              <p>
                Renewal payments are generally non-refundable. Exceptions may be granted
                for duplicate charges or verified billing errors.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-900">4. Cancellation</h2>
              <p>
                You may cancel at any time. Cancellation prevents future renewals and
                access continues through the paid billing period.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-900">5. How To Request</h2>
              <p>
                Send refund requests to support@dunningdog.com and include your account
                email and invoice reference.
              </p>
            </section>
          </div>
    </PolicyPageLayout>
  );
}
