import type { Metadata } from "next";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata: Metadata = {
  title: "Terms of Service | DunningDog",
  description: "Terms and conditions for using DunningDog.",
};

export default function TermsPolicyPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto max-w-4xl px-6 py-14">
        <article className="rounded-xl border border-zinc-200 bg-white p-8">
          <p className="text-sm font-medium text-emerald-700">Last updated: February 28, 2026</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
            Terms of Service
          </h1>
          <div className="mt-8 space-y-6 text-sm leading-7 text-zinc-700">
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-900">1. Agreement</h2>
              <p>
                By creating an account or using DunningDog, you agree to these terms and
                any policies referenced in them.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-900">2. Service Access</h2>
              <p>
                You are responsible for maintaining account credentials and ensuring your
                use complies with applicable laws and payment platform rules.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-900">3. Billing</h2>
              <p>
                Paid plans are billed in advance on a recurring cycle. You authorize
                DunningDog or its payment provider to charge applicable subscription fees.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-900">4. Acceptable Use</h2>
              <p>
                You may not use the service to violate laws, interfere with platform
                operation, attempt unauthorized access, or process prohibited content.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-900">5. Suspension and Termination</h2>
              <p>
                DunningDog may suspend or terminate accounts for security risks, material
                violations, or non-payment.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-900">6. Disclaimers</h2>
              <p>
                The service is provided on an &quot;as is&quot; and &quot;as available&quot; basis.
                We do not guarantee uninterrupted operation or specific revenue outcomes.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-900">7. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, DunningDog is not liable for
                indirect, consequential, or incidental damages.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-900">8. Contact</h2>
              <p>Questions about these terms can be sent to support@dunningdog.com.</p>
            </section>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
