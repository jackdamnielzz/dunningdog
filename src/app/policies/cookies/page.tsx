import type { Metadata } from "next";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata: Metadata = {
  title: "Cookie Policy | DunningDog",
  description: "Cookie usage and controls for DunningDog.",
};

export default function CookiesPolicyPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto max-w-4xl px-6 py-14">
        <article className="rounded-xl border border-zinc-200 bg-white p-8">
          <p className="text-sm font-medium text-emerald-700">Last updated: February 28, 2026</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
            Cookie Policy
          </h1>
          <div className="mt-8 space-y-6 text-sm leading-7 text-zinc-700">
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-900">1. What Cookies Are</h2>
              <p>
                Cookies are small text files stored on your browser that help websites
                remember session data and preferences.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-900">2. Cookies We Use</h2>
              <p>We use essential cookies for authentication and security.</p>
              <p>
                We may also use analytics cookies to understand product usage and improve
                reliability and performance.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-900">3. Third-Party Cookies</h2>
              <p>
                Payment, analytics, and infrastructure providers may set cookies under
                their own policies when you interact with integrated services.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-900">4. Managing Cookies</h2>
              <p>
                You can manage or block cookies through your browser settings. Disabling
                essential cookies may prevent account login and core app functionality.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-900">5. Contact</h2>
              <p>
                For cookie-related questions, contact support@dunningdog.com.
              </p>
            </section>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
