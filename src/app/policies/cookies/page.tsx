import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPageLayout } from "@/components/layouts/policy-page-layout";
import { CookiePreferences } from "@/components/forms/cookie-preferences";

export const metadata: Metadata = {
  title: "Cookie Policy | DunningDog",
  description:
    "How DunningDog uses cookies and similar technologies, and how you can manage your preferences.",
};

export default function CookiesPolicyPage() {
  return (
    <PolicyPageLayout>
      <p className="text-sm font-medium text-accent-700">
        Last updated: March 3, 2026
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
        Cookie Policy
      </h1>
      <p className="mt-4 text-sm leading-7 text-zinc-600">
        This Cookie Policy explains how DunningDog (&quot;we&quot;, &quot;us&quot;,
        &quot;our&quot;) uses cookies and similar tracking technologies when you visit
        our website at <strong>dunningdog.com</strong> or use our dashboard. It also
        describes your choices regarding these technologies. This policy should be read
        alongside our{" "}
        <Link href="/policies/privacy" className="text-accent-700 hover:underline">
          Privacy Policy
        </Link>.
      </p>

      <nav className="mt-6 rounded-lg bg-zinc-50 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Contents
        </p>
        <ol className="columns-2 gap-8 space-y-1 text-sm text-accent-700">
          <li><a href="#what-are-cookies" className="hover:underline">1. What Are Cookies</a></li>
          <li><a href="#cookies-we-use" className="hover:underline">2. Cookies We Use</a></li>
          <li><a href="#essential" className="hover:underline">3. Essential Cookies</a></li>
          <li><a href="#analytics" className="hover:underline">4. Analytics Cookies</a></li>
          <li><a href="#error-tracking" className="hover:underline">5. Error Tracking</a></li>
          <li><a href="#third-party" className="hover:underline">6. Third-Party Cookies</a></li>
          <li><a href="#local-storage" className="hover:underline">7. Local Storage</a></li>
          <li><a href="#preferences" className="hover:underline">8. Manage Preferences</a></li>
          <li><a href="#browser-controls" className="hover:underline">9. Browser Controls</a></li>
          <li><a href="#dnt" className="hover:underline">10. Do Not Track</a></li>
          <li><a href="#changes" className="hover:underline">11. Changes to Policy</a></li>
          <li><a href="#contact" className="hover:underline">12. Contact</a></li>
        </ol>
      </nav>

      <div className="mt-8 space-y-8 text-sm leading-7 text-zinc-700">
        {/* 1. What Are Cookies */}
        <section id="what-are-cookies" className="space-y-2 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">1. What Are Cookies</h2>
          <p>
            Cookies are small text files that are placed on your device (computer, tablet,
            or phone) when you visit a website. They are widely used to make websites work
            more efficiently, provide a better user experience, and give website operators
            information about how the site is being used.
          </p>
          <p>
            Cookies can be <strong>first-party</strong> (set by the website you are visiting)
            or <strong>third-party</strong> (set by a service embedded in the website, such
            as an analytics provider). They can also be <strong>session cookies</strong>{" "}
            (deleted when you close your browser) or <strong>persistent cookies</strong>{" "}
            (remain on your device until they expire or are deleted).
          </p>
        </section>

        {/* 2. Cookies We Use */}
        <section id="cookies-we-use" className="space-y-3 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">2. Cookies We Use</h2>
          <p>
            DunningDog uses cookies in three categories. You can manage your preferences for
            non-essential cookies in <a href="#preferences" className="text-accent-700 hover:underline">Section 8</a> below.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left">
                  <th className="py-2 pr-4 font-semibold text-zinc-900">Category</th>
                  <th className="py-2 pr-4 font-semibold text-zinc-900">Purpose</th>
                  <th className="py-2 pr-4 font-semibold text-zinc-900">Provider</th>
                  <th className="py-2 font-semibold text-zinc-900">Can Be Disabled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                <tr>
                  <td className="py-2 pr-4 font-medium">Essential</td>
                  <td className="py-2 pr-4">Authentication &amp; session management</td>
                  <td className="py-2 pr-4">Supabase</td>
                  <td className="py-2">No</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium">Analytics</td>
                  <td className="py-2 pr-4">Product usage &amp; improvement</td>
                  <td className="py-2 pr-4">PostHog</td>
                  <td className="py-2">Yes</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium">Error Tracking</td>
                  <td className="py-2 pr-4">Bug detection &amp; performance</td>
                  <td className="py-2 pr-4">Sentry</td>
                  <td className="py-2">Yes</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            We do <strong>not</strong> use advertising cookies, retargeting pixels, or
            social media tracking cookies.
          </p>
        </section>

        {/* 3. Essential Cookies */}
        <section id="essential" className="space-y-3 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">3. Essential Cookies</h2>
          <p>
            Essential cookies are strictly necessary for the website to function. Without
            them, core features like logging in, staying authenticated, and navigating between
            pages would not work. These cookies <strong>cannot be disabled</strong>.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left">
                  <th className="py-2 pr-4 font-semibold text-zinc-900">Cookie Name</th>
                  <th className="py-2 pr-4 font-semibold text-zinc-900">Purpose</th>
                  <th className="py-2 pr-4 font-semibold text-zinc-900">Type</th>
                  <th className="py-2 font-semibold text-zinc-900">Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                <tr>
                  <td className="py-2 pr-4">
                    <code className="rounded bg-zinc-100 px-1 text-xs">sb-*-auth-token</code>
                  </td>
                  <td className="py-2 pr-4">
                    Stores your Supabase authentication session. Required for login and
                    access to the dashboard.
                  </td>
                  <td className="py-2 pr-4">First-party, persistent</td>
                  <td className="py-2">Session / up to 1 year</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">
                    <code className="rounded bg-zinc-100 px-1 text-xs">sb-*-auth-token-code-verifier</code>
                  </td>
                  <td className="py-2 pr-4">
                    PKCE code verifier for OAuth flow security. Prevents authorization code
                    interception attacks.
                  </td>
                  <td className="py-2 pr-4">First-party, session</td>
                  <td className="py-2">Session</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>Legal basis (GDPR):</strong> These cookies are exempt from consent
            requirements under Art. 5(3) of the ePrivacy Directive because they are strictly
            necessary for providing the service you requested.
          </p>
        </section>

        {/* 4. Analytics Cookies */}
        <section id="analytics" className="space-y-3 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">4. Analytics Cookies</h2>
          <p>
            We use <strong>PostHog</strong> to understand how visitors interact with
            DunningDog. This helps us identify which features are most useful, discover
            usability issues, and improve the product. Analytics cookies are{" "}
            <strong>optional</strong> and are only activated with your consent.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left">
                  <th className="py-2 pr-4 font-semibold text-zinc-900">Cookie Name</th>
                  <th className="py-2 pr-4 font-semibold text-zinc-900">Purpose</th>
                  <th className="py-2 pr-4 font-semibold text-zinc-900">Type</th>
                  <th className="py-2 font-semibold text-zinc-900">Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                <tr>
                  <td className="py-2 pr-4">
                    <code className="rounded bg-zinc-100 px-1 text-xs">ph_*</code>
                  </td>
                  <td className="py-2 pr-4">
                    PostHog session identification and anonymous usage tracking. Tracks
                    pages visited, features used, and session duration.
                  </td>
                  <td className="py-2 pr-4">First-party, persistent</td>
                  <td className="py-2">1 year</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            PostHog data is hosted on <strong>PostHog EU Cloud</strong> (eu.i.posthog.com).
            When analytics cookies are disabled, PostHog falls back to in-memory storage only
            and does not persist data across page loads.
          </p>
          <p>
            <strong>Data collected:</strong> Pages visited, features used, session duration,
            browser type, operating system, device type, screen resolution, and approximate
            location (country level, derived from IP address). We do <strong>not</strong>{" "}
            collect or store your full IP address.
          </p>
          <p>
            <strong>Legal basis (GDPR):</strong> Consent (Art. 6(1)(a)). You can withdraw
            consent at any time using the preference controls in{" "}
            <a href="#preferences" className="text-accent-700 hover:underline">Section 8</a>.
          </p>
        </section>

        {/* 5. Error Tracking */}
        <section id="error-tracking" className="space-y-3 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">5. Error Tracking</h2>
          <p>
            We use <strong>Sentry</strong> to detect, diagnose, and fix software errors.
            When an error occurs, Sentry captures technical context about the error to help
            our engineering team resolve it quickly. Error tracking is{" "}
            <strong>optional</strong> and is only activated with your consent.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left">
                  <th className="py-2 pr-4 font-semibold text-zinc-900">Technology</th>
                  <th className="py-2 pr-4 font-semibold text-zinc-900">Purpose</th>
                  <th className="py-2 font-semibold text-zinc-900">Data Retention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                <tr>
                  <td className="py-2 pr-4">Sentry JavaScript SDK</td>
                  <td className="py-2 pr-4">
                    Captures error stack traces, browser metadata, and performance
                    measurements when an application error occurs.
                  </td>
                  <td className="py-2">90 days</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Sentry Session Replay</td>
                  <td className="py-2 pr-4">
                    Records a replay of the user session when an error occurs (50% sample
                    rate on errors) to help reproduce and fix bugs.
                  </td>
                  <td className="py-2">90 days</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>Data collected:</strong> Error messages, stack traces, browser type and
            version, operating system, device type, URL where the error occurred, and
            performance timing data. Sentry does <strong>not</strong> track you across
            websites or build a behavioral profile.
          </p>
          <p>
            <strong>Legal basis (GDPR):</strong> Consent (Art. 6(1)(a)). You can withdraw
            consent at any time using the preference controls in{" "}
            <a href="#preferences" className="text-accent-700 hover:underline">Section 8</a>.
          </p>
        </section>

        {/* 6. Third-Party Cookies */}
        <section id="third-party" className="space-y-3 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">6. Third-Party Cookies</h2>
          <p>
            Some of the services we integrate with may set their own cookies when you
            interact with them. These cookies are governed by the respective third party&apos;s
            own cookie and privacy policies, not ours.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left">
                  <th className="py-2 pr-4 font-semibold text-zinc-900">Service</th>
                  <th className="py-2 pr-4 font-semibold text-zinc-900">When Used</th>
                  <th className="py-2 font-semibold text-zinc-900">Policy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                <tr>
                  <td className="py-2 pr-4 font-medium">Stripe</td>
                  <td className="py-2 pr-4">
                    When you connect your Stripe account, manage your subscription, or
                    interact with the Stripe Checkout or Billing Portal.
                  </td>
                  <td className="py-2">
                    <a
                      href="https://stripe.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-700 hover:underline"
                    >
                      Stripe Privacy Policy
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium">Google</td>
                  <td className="py-2 pr-4">
                    When you sign in using Google OAuth. Google may set cookies for
                    authentication and fraud prevention.
                  </td>
                  <td className="py-2">
                    <a
                      href="https://policies.google.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-700 hover:underline"
                    >
                      Google Privacy Policy
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            We have no control over third-party cookies. We recommend reviewing their
            policies for details on how they use cookies.
          </p>
        </section>

        {/* 7. Local Storage */}
        <section id="local-storage" className="space-y-3 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">7. Local Storage &amp; Similar Technologies</h2>
          <p>
            In addition to cookies, DunningDog uses browser local storage for storing
            non-sensitive preferences:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left">
                  <th className="py-2 pr-4 font-semibold text-zinc-900">Key</th>
                  <th className="py-2 pr-4 font-semibold text-zinc-900">Purpose</th>
                  <th className="py-2 font-semibold text-zinc-900">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                <tr>
                  <td className="py-2 pr-4">
                    <code className="rounded bg-zinc-100 px-1 text-xs">dd-cookie-consent</code>
                  </td>
                  <td className="py-2 pr-4">
                    Stores your cookie preference choices (analytics on/off, error
                    tracking on/off) so we can respect your selections across visits.
                  </td>
                  <td className="py-2">Essential</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Local storage data does not expire automatically but can be cleared via your
            browser settings at any time.
          </p>
        </section>

        {/* 8. Manage Preferences */}
        <section id="preferences" className="space-y-4 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">8. Manage Your Cookie Preferences</h2>
          <p>
            Use the controls below to choose which optional cookies DunningDog is allowed
            to use. Your choices are saved in your browser and apply immediately after the
            page reloads. You can change your preferences at any time by returning to this
            page.
          </p>
          <CookiePreferences />
        </section>

        {/* 9. Browser Controls */}
        <section id="browser-controls" className="space-y-2 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">9. Browser Cookie Controls</h2>
          <p>
            In addition to the preference controls above, you can manage cookies through
            your browser settings. Most browsers allow you to:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>View and delete cookies stored on your device</li>
            <li>Block all cookies or only third-party cookies</li>
            <li>Automatically clear cookies when you close your browser</li>
            <li>Receive a notification before a cookie is set</li>
          </ul>
          <p>
            Instructions for managing cookies in common browsers:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <a
                href="https://support.google.com/chrome/answer/95647"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-700 hover:underline"
              >
                Google Chrome
              </a>
            </li>
            <li>
              <a
                href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-700 hover:underline"
              >
                Mozilla Firefox
              </a>
            </li>
            <li>
              <a
                href="https://support.apple.com/guide/safari/manage-cookies-sfri11471"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-700 hover:underline"
              >
                Apple Safari
              </a>
            </li>
            <li>
              <a
                href="https://support.microsoft.com/en-us/microsoft-edge/manage-cookies-in-microsoft-edge-view-allow-block-delete-and-use-168dab11-0753-043d-7c16-ede5947fc64d"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-700 hover:underline"
              >
                Microsoft Edge
              </a>
            </li>
          </ul>
          <p>
            Please note that disabling essential cookies will prevent you from logging in
            to DunningDog and using core functionality.
          </p>
        </section>

        {/* 10. Do Not Track */}
        <section id="dnt" className="space-y-2 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">10. Do Not Track (DNT)</h2>
          <p>
            Do Not Track is a browser setting that signals to websites that you do not wish
            to be tracked. DunningDog respects your cookie preferences as configured on this
            page. If you have not set your preferences, analytics and error tracking cookies
            are <strong>disabled by default</strong>.
          </p>
          <p>
            We recommend using the cookie preference controls in{" "}
            <a href="#preferences" className="text-accent-700 hover:underline">Section 8</a>{" "}
            for the most reliable way to control tracking on DunningDog.
          </p>
        </section>

        {/* 11. Changes */}
        <section id="changes" className="space-y-2 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">11. Changes to This Policy</h2>
          <p>
            We may update this Cookie Policy from time to time to reflect changes in
            technology, legislation, or our use of cookies. When we make material changes,
            we will:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Update the &quot;Last updated&quot; date at the top of this page</li>
            <li>Notify registered users via email for significant changes</li>
            <li>Reset cookie preferences where necessary so you can make an informed choice</li>
          </ul>
          <p>
            We encourage you to review this page periodically.
          </p>
        </section>

        {/* 12. Contact */}
        <section id="contact" className="space-y-2 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">12. Contact Us</h2>
          <p>
            If you have questions about our use of cookies or your preferences, contact us
            at:
          </p>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm">
            <p><strong>DunningDog — Privacy</strong></p>
            <p>
              Email:{" "}
              <a
                href="mailto:privacy@dunningdog.com"
                className="text-accent-700 hover:underline"
              >
                privacy@dunningdog.com
              </a>
            </p>
            <p>
              General support:{" "}
              <a
                href="mailto:support@dunningdog.com"
                className="text-accent-700 hover:underline"
              >
                support@dunningdog.com
              </a>
            </p>
          </div>
        </section>
      </div>
    </PolicyPageLayout>
  );
}
