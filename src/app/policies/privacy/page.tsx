import type { Metadata } from "next";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata: Metadata = {
  title: "Privacy Policy | DunningDog",
  description: "How DunningDog collects, uses, and protects personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto max-w-4xl px-6 py-14">
        <article className="rounded-xl border border-zinc-200 bg-white p-8">
          <p className="text-sm font-medium text-emerald-700">Last updated: February 28, 2026</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
            Privacy Policy
          </h1>
          <div className="mt-8 space-y-6 text-sm leading-7 text-zinc-700">
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-900">1. Scope</h2>
              <p>
                This policy describes how DunningDog collects and processes personal
                data when you use our website, dashboard, and related services.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-900">2. Data We Collect</h2>
              <p>We may collect account details, billing metadata, usage logs, and support messages.</p>
              <p>
                Payment card data is processed by third-party providers and is not stored
                directly in DunningDog systems.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-900">3. How We Use Data</h2>
              <p>
                We use data to provide the service, secure accounts, improve product
                performance, process billing, and communicate operational updates.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-900">4. Sharing</h2>
              <p>
                We share data only with infrastructure and service providers required to
                run DunningDog, such as hosting, payments, email delivery, and analytics.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-900">5. Retention</h2>
              <p>
                Data is retained for as long as needed for service delivery, legal
                obligations, and dispute resolution, then deleted or anonymized.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-900">6. Your Rights</h2>
              <p>
                You can request access, correction, export, or deletion of personal data
                by contacting support@dunningdog.com.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-900">7. Security</h2>
              <p>
                We apply administrative, technical, and organizational controls to protect
                personal data from unauthorized access, disclosure, or loss.
              </p>
            </section>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
