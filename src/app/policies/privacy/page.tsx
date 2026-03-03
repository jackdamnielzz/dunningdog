import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPageLayout } from "@/components/layouts/policy-page-layout";

export const metadata: Metadata = {
  title: "Privacy Policy | DunningDog",
  description: "How DunningDog collects, uses, and protects personal data under GDPR and applicable privacy laws.",
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyPageLayout>
          <p className="text-sm font-medium text-accent-700">Last updated: February 28, 2026</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm leading-7 text-zinc-600">
            This privacy policy explains how DunningDog (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) collects,
            uses, stores, and protects your personal data when you visit our website at{" "}
            <strong>dunningdog.com</strong>, use our dashboard, or interact with our services.
            We are committed to protecting your privacy in accordance with the General Data
            Protection Regulation (GDPR), the ePrivacy Directive, and other applicable data
            protection laws.
          </p>

          <nav className="mt-6 rounded-lg bg-zinc-50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Contents
            </p>
            <ol className="gap-8 space-y-1 text-sm text-accent-700 sm:columns-2">
              <li><a href="#controller" className="hover:underline">1. Data Controller</a></li>
              <li><a href="#data-collected" className="hover:underline">2. Data We Collect</a></li>
              <li><a href="#legal-basis" className="hover:underline">3. Legal Basis</a></li>
              <li><a href="#purposes" className="hover:underline">4. How We Use Data</a></li>
              <li><a href="#recipients" className="hover:underline">5. Service Providers</a></li>
              <li><a href="#transfers" className="hover:underline">6. International Transfers</a></li>
              <li><a href="#retention" className="hover:underline">7. Data Retention</a></li>
              <li><a href="#rights" className="hover:underline">8. Your Rights</a></li>
              <li><a href="#cookies" className="hover:underline">9. Cookies &amp; Tracking</a></li>
              <li><a href="#children" className="hover:underline">10. Children&apos;s Data</a></li>
              <li><a href="#automated" className="hover:underline">11. Automated Decisions</a></li>
              <li><a href="#security" className="hover:underline">12. Security</a></li>
              <li><a href="#changes" className="hover:underline">13. Changes to Policy</a></li>
              <li><a href="#contact" className="hover:underline">14. Contact Us</a></li>
            </ol>
          </nav>

          <div className="mt-8 space-y-8 text-sm leading-7 text-zinc-700">
            {/* 1. Data Controller */}
            <section id="controller" className="space-y-2 scroll-mt-8">
              <h2 className="text-lg font-semibold text-zinc-900">1. Data Controller</h2>
              <p>
                The data controller responsible for your personal data is:
              </p>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm">
                <p><strong>DunningDog</strong></p>
                <p>Email: <a href="mailto:privacy@dunningdog.com" className="text-accent-700 hover:underline">privacy@dunningdog.com</a></p>
              </div>
              <p>
                If you have questions about how we handle your personal data or wish to exercise
                your rights, please contact us at the email address above.
              </p>
            </section>

            {/* 2. Data We Collect */}
            <section id="data-collected" className="space-y-3 scroll-mt-8">
              <h2 className="text-lg font-semibold text-zinc-900">2. Data We Collect</h2>
              <p>We collect the following categories of personal data:</p>

              <h3 className="font-semibold text-zinc-800">2.1 Account Information</h3>
              <p>
                When you create an account, we collect your <strong>email address</strong> and
                {" "}<strong>name</strong> (if provided). If you sign in via Google or Microsoft OAuth,
                we receive your name, email, and profile identifier from the identity provider.
                We do not receive or store your password from third-party OAuth providers.
              </p>

              <h3 className="font-semibold text-zinc-800">2.2 Billing Data</h3>
              <p>
                When you subscribe to a paid plan, we collect your <strong>Stripe customer ID</strong>,
                {" "}<strong>subscription ID</strong>, and <strong>billing plan selection</strong>.
                Payment card details (card number, CVC, expiry) are collected and processed
                directly by <strong>Stripe, Inc.</strong> and are never stored on DunningDog servers.
              </p>

              <h3 className="font-semibold text-zinc-800">2.3 Connected Stripe Account Data</h3>
              <p>
                When you connect your Stripe account via OAuth, we receive and store an{" "}
                <strong>encrypted OAuth access token</strong> and your{" "}
                <strong>Stripe account ID</strong>. We use this to read invoice, subscription,
                and payment method data from your connected Stripe account for the purpose of
                payment recovery. We process the following data from your Stripe account:
              </p>
              <ul className="list-disc space-y-1 pl-6">
                <li>Invoice status and amounts (payment failed/succeeded events)</li>
                <li>Subscription status and customer identifiers</li>
                <li>Payment method type and last-four digits (for pre-dunning alerts)</li>
                <li>Card expiration dates (to detect expiring cards)</li>
              </ul>
              <p>
                We do <strong>not</strong> access full card numbers, bank account details, or
                personal identification documents from your connected Stripe account.
              </p>

              <h3 className="font-semibold text-zinc-800">2.4 Usage Data</h3>
              <p>
                We collect data about how you use DunningDog, including pages visited, features
                used, recovery dashboard interactions, and sequence configurations. This data is
                collected via <strong>PostHog</strong> (analytics) and <strong>Sentry</strong> (error
                tracking) and may include your IP address, browser type, operating system, and
                device information.
              </p>

              <h3 className="font-semibold text-zinc-800">2.5 Email Interaction Data</h3>
              <p>
                When DunningDog sends dunning emails on your behalf to your customers, we log
                the recipient email address, send timestamp, and delivery status. We use{" "}
                <strong>Resend</strong> as our email delivery provider.
              </p>

              <h3 className="font-semibold text-zinc-800">2.6 Support Communications</h3>
              <p>
                If you contact us via email, we retain your message content, email address, and
                any attachments for the purpose of resolving your inquiry.
              </p>
            </section>

            {/* 3. Legal Basis */}
            <section id="legal-basis" className="space-y-3 scroll-mt-8">
              <h2 className="text-lg font-semibold text-zinc-900">3. Legal Basis for Processing</h2>
              <p>
                Under the GDPR, we process your personal data based on the following legal grounds:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-left">
                      <th className="py-2 pr-4 font-semibold text-zinc-900">Purpose</th>
                      <th className="py-2 font-semibold text-zinc-900">Legal Basis (Art. 6 GDPR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    <tr>
                      <td className="py-2 pr-4">Providing the service (recovery, dashboard, sequences)</td>
                      <td className="py-2">Performance of contract (Art. 6(1)(b))</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Processing payments and managing subscriptions</td>
                      <td className="py-2">Performance of contract (Art. 6(1)(b))</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Sending dunning emails on your behalf</td>
                      <td className="py-2">Performance of contract (Art. 6(1)(b))</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Error monitoring and debugging (Sentry)</td>
                      <td className="py-2">Legitimate interest (Art. 6(1)(f))</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Product analytics and improvement (PostHog)</td>
                      <td className="py-2">Legitimate interest (Art. 6(1)(f))</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Security, fraud prevention, abuse detection</td>
                      <td className="py-2">Legitimate interest (Art. 6(1)(f))</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Responding to support inquiries</td>
                      <td className="py-2">Legitimate interest (Art. 6(1)(f))</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Complying with legal obligations (tax, fraud reporting)</td>
                      <td className="py-2">Legal obligation (Art. 6(1)(c))</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                Where we rely on legitimate interest, we have conducted a balancing test to ensure
                your rights and freedoms are not overridden. You can request details of this
                assessment by contacting us.
              </p>
            </section>

            {/* 4. Purposes */}
            <section id="purposes" className="space-y-2 scroll-mt-8">
              <h2 className="text-lg font-semibold text-zinc-900">4. How We Use Your Data</h2>
              <p>We use the personal data we collect to:</p>
              <ul className="list-disc space-y-1 pl-6">
                <li>Create and maintain your account and workspace</li>
                <li>Connect to your Stripe account and ingest billing events via webhooks</li>
                <li>Detect at-risk subscriptions and expiring payment methods (pre-dunning)</li>
                <li>Execute dunning email sequences to recover failed payments</li>
                <li>Display recovery metrics, dashboard data, and analytics</li>
                <li>Process your subscription payments via Stripe</li>
                <li>Send operational emails (account confirmation, password reset, billing receipts)</li>
                <li>Monitor and fix errors in the application (Sentry)</li>
                <li>Understand how the product is used and improve it (PostHog)</li>
                <li>Respond to your support requests</li>
                <li>Comply with applicable laws and regulations</li>
              </ul>
              <p>
                We do <strong>not</strong> sell your personal data to third parties. We do{" "}
                <strong>not</strong> use your data for advertising or profiling for marketing purposes.
              </p>
            </section>

            {/* 5. Service Providers */}
            <section id="recipients" className="space-y-3 scroll-mt-8">
              <h2 className="text-lg font-semibold text-zinc-900">5. Service Providers &amp; Data Recipients</h2>
              <p>
                We share personal data only with third-party service providers who process data
                on our behalf, under written data processing agreements (DPAs):
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-left">
                      <th className="py-2 pr-4 font-semibold text-zinc-900">Provider</th>
                      <th className="py-2 pr-4 font-semibold text-zinc-900">Purpose</th>
                      <th className="py-2 font-semibold text-zinc-900">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    <tr>
                      <td className="py-2 pr-4">Vercel, Inc.</td>
                      <td className="py-2 pr-4">Application hosting &amp; edge functions</td>
                      <td className="py-2">United States</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Supabase, Inc.</td>
                      <td className="py-2 pr-4">Authentication &amp; database</td>
                      <td className="py-2">United States / EU</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Stripe, Inc.</td>
                      <td className="py-2 pr-4">Payment processing &amp; Connect OAuth</td>
                      <td className="py-2">United States</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Resend, Inc.</td>
                      <td className="py-2 pr-4">Transactional email delivery</td>
                      <td className="py-2">United States</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Sentry (Functional Software, Inc.)</td>
                      <td className="py-2 pr-4">Error monitoring &amp; performance tracking</td>
                      <td className="py-2">United States</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">PostHog, Inc.</td>
                      <td className="py-2 pr-4">Product analytics</td>
                      <td className="py-2">United States / EU</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Inngest, Inc.</td>
                      <td className="py-2 pr-4">Background job processing</td>
                      <td className="py-2">United States</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                We may also disclose data where required by law, court order, or regulatory
                authority, or to protect the rights, property, or safety of DunningDog, our
                users, or others.
              </p>
            </section>

            {/* 6. International Transfers */}
            <section id="transfers" className="space-y-2 scroll-mt-8">
              <h2 className="text-lg font-semibold text-zinc-900">6. International Data Transfers</h2>
              <p>
                Some of our service providers are located in the United States. When personal data
                is transferred outside the European Economic Area (EEA), we ensure appropriate
                safeguards are in place, including:
              </p>
              <ul className="list-disc space-y-1 pl-6">
                <li>
                  <strong>Standard Contractual Clauses (SCCs)</strong> approved by the European
                  Commission, included in our data processing agreements
                </li>
                <li>
                  Verification that providers maintain adequate security measures and comply with
                  applicable data protection standards
                </li>
                <li>
                  Where available, selection of EU-based data processing regions (e.g., Supabase
                  EU, PostHog EU Cloud)
                </li>
              </ul>
              <p>
                You may request a copy of the safeguards we rely on by contacting{" "}
                <a href="mailto:privacy@dunningdog.com" className="text-accent-700 hover:underline">privacy@dunningdog.com</a>.
              </p>
            </section>

            {/* 7. Retention */}
            <section id="retention" className="space-y-3 scroll-mt-8">
              <h2 className="text-lg font-semibold text-zinc-900">7. Data Retention</h2>
              <p>
                We retain personal data only for as long as necessary to fulfil the purposes
                described in this policy:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-left">
                      <th className="py-2 pr-4 font-semibold text-zinc-900">Data Category</th>
                      <th className="py-2 font-semibold text-zinc-900">Retention Period</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    <tr>
                      <td className="py-2 pr-4">Account information</td>
                      <td className="py-2">Until account deletion + 30 days</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Stripe OAuth tokens (encrypted)</td>
                      <td className="py-2">Until Stripe account is disconnected</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Recovery attempt data</td>
                      <td className="py-2">24 months after resolution, then anonymized</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Email delivery logs</td>
                      <td className="py-2">12 months, then deleted</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Metric snapshots</td>
                      <td className="py-2">36 months (aggregated, non-personal)</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Billing and invoice records</td>
                      <td className="py-2">7 years (legal/tax obligation)</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Support communications</td>
                      <td className="py-2">24 months after last interaction</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Error logs (Sentry)</td>
                      <td className="py-2">90 days</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Analytics data (PostHog)</td>
                      <td className="py-2">24 months</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                When data is no longer needed, it is securely deleted or anonymized so it can
                no longer be associated with you.
              </p>
            </section>

            {/* 8. Your Rights */}
            <section id="rights" className="space-y-3 scroll-mt-8">
              <h2 className="text-lg font-semibold text-zinc-900">8. Your Rights Under GDPR</h2>
              <p>
                If you are located in the European Economic Area (EEA), United Kingdom, or
                Switzerland, you have the following rights regarding your personal data:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  <strong>Right of access (Art. 15)</strong> — Request a copy of the personal
                  data we hold about you.
                </li>
                <li>
                  <strong>Right to rectification (Art. 16)</strong> — Request correction of
                  inaccurate or incomplete data.
                </li>
                <li>
                  <strong>Right to erasure (Art. 17)</strong> — Request deletion of your personal
                  data (&quot;right to be forgotten&quot;), subject to legal retention obligations.
                </li>
                <li>
                  <strong>Right to restriction (Art. 18)</strong> — Request that we restrict
                  processing of your data in certain circumstances.
                </li>
                <li>
                  <strong>Right to data portability (Art. 20)</strong> — Receive your data in a
                  structured, commonly used, machine-readable format (JSON or CSV).
                </li>
                <li>
                  <strong>Right to object (Art. 21)</strong> — Object to processing based on
                  legitimate interest. We will stop processing unless we demonstrate compelling
                  legitimate grounds.
                </li>
                <li>
                  <strong>Right to withdraw consent (Art. 7(3))</strong> — Where processing is
                  based on consent, you may withdraw it at any time without affecting the
                  lawfulness of prior processing.
                </li>
                <li>
                  <strong>Right to lodge a complaint</strong> — You have the right to lodge a
                  complaint with your local data protection supervisory authority. A list of EEA
                  supervisory authorities is available at{" "}
                  <a
                    href="https://edpb.europa.eu/about-edpb/about-edpb/members_en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-700 hover:underline"
                  >
                    edpb.europa.eu
                  </a>.
                </li>
              </ul>
              <p>
                To exercise any of these rights, email{" "}
                <a href="mailto:privacy@dunningdog.com" className="text-accent-700 hover:underline">privacy@dunningdog.com</a>.
                We will respond within <strong>30 days</strong>. We may ask you to verify your
                identity before processing your request. There is no fee for exercising your
                rights, unless requests are manifestly unfounded or excessive.
              </p>
            </section>

            {/* 9. Cookies */}
            <section id="cookies" className="space-y-2 scroll-mt-8">
              <h2 className="text-lg font-semibold text-zinc-900">9. Cookies &amp; Tracking Technologies</h2>
              <p>We use the following cookies and tracking technologies:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  <strong>Essential cookies</strong> — Required for authentication and session
                  management (e.g., <code className="rounded bg-zinc-100 px-1 text-xs">sb-auth-token</code>).
                  These cannot be disabled as they are necessary for the service to function.
                </li>
                <li>
                  <strong>Analytics (PostHog)</strong> — Used to understand product usage and
                  improve the service. PostHog may set cookies or use local storage to track
                  sessions. You can opt out via your browser settings or by enabling Do Not Track.
                </li>
                <li>
                  <strong>Error tracking (Sentry)</strong> — Captures error data to help us fix
                  bugs. Does not track you across websites.
                </li>
              </ul>
              <p>
                We do <strong>not</strong> use advertising cookies or trackers.
                For more details, see our{" "}
                <Link href="/policies/cookies" className="text-accent-700 hover:underline">Cookie Policy</Link>.
              </p>
            </section>

            {/* 10. Children */}
            <section id="children" className="space-y-2 scroll-mt-8">
              <h2 className="text-lg font-semibold text-zinc-900">10. Children&apos;s Data</h2>
              <p>
                DunningDog is a business-to-business (B2B) service. We do not knowingly collect
                personal data from children under the age of 16. If we become aware that we have
                collected data from a child, we will delete it promptly. If you believe a child
                has provided us with personal data, please contact{" "}
                <a href="mailto:privacy@dunningdog.com" className="text-accent-700 hover:underline">privacy@dunningdog.com</a>.
              </p>
            </section>

            {/* 11. Automated Decisions */}
            <section id="automated" className="space-y-2 scroll-mt-8">
              <h2 className="text-lg font-semibold text-zinc-900">11. Automated Decision-Making</h2>
              <p>
                DunningDog uses automated processing to classify payment decline reasons (hard
                decline vs. soft decline) and to determine dunning sequence timing. These
                automated processes affect how and when recovery emails are sent to your
                customers, but they do <strong>not</strong> produce legal effects or similarly
                significant decisions concerning you as defined under Art. 22 GDPR.
              </p>
              <p>
                You retain full control over your dunning sequences and can modify, pause, or
                disable them at any time from your dashboard.
              </p>
            </section>

            {/* 12. Security */}
            <section id="security" className="space-y-2 scroll-mt-8">
              <h2 className="text-lg font-semibold text-zinc-900">12. Security Measures</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your
                personal data, including:
              </p>
              <ul className="list-disc space-y-1 pl-6">
                <li>Encryption of data in transit (TLS/HTTPS) and at rest</li>
                <li>Encryption of sensitive credentials (Stripe OAuth tokens) using AES-256</li>
                <li>
                  Secure authentication via Supabase with PKCE OAuth flow and HTTP-only session
                  cookies
                </li>
                <li>
                  Security headers (Content-Security-Policy, HSTS, X-Frame-Options, X-Content-Type-Options)
                </li>
                <li>Webhook signature verification for all incoming Stripe events</li>
                <li>Secret-based authentication for cron endpoints</li>
                <li>Error monitoring via Sentry for rapid incident response</li>
                <li>
                  Regular dependency updates and adherence to OWASP security best practices
                </li>
              </ul>
              <p>
                No system is 100% secure. If we become aware of a data breach that is likely to
                result in a risk to your rights and freedoms, we will notify the relevant
                supervisory authority within 72 hours and affected individuals without undue
                delay, as required by Art. 33 and 34 GDPR.
              </p>
            </section>

            {/* 13. Changes */}
            <section id="changes" className="space-y-2 scroll-mt-8">
              <h2 className="text-lg font-semibold text-zinc-900">13. Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time to reflect changes in our
                practices or applicable laws. When we make material changes, we will:
              </p>
              <ul className="list-disc space-y-1 pl-6">
                <li>Update the &quot;Last updated&quot; date at the top of this page</li>
                <li>Notify registered users via email at least 14 days before changes take effect</li>
                <li>Post a prominent notice on our website</li>
              </ul>
              <p>
                We encourage you to review this policy periodically. Your continued use of
                DunningDog after changes take effect constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* 14. Contact */}
            <section id="contact" className="space-y-2 scroll-mt-8">
              <h2 className="text-lg font-semibold text-zinc-900">14. Contact Us</h2>
              <p>
                If you have questions about this privacy policy, your personal data, or wish
                to exercise your rights, contact us at:
              </p>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm">
                <p><strong>DunningDog — Privacy</strong></p>
                <p>
                  Email:{" "}
                  <a href="mailto:privacy@dunningdog.com" className="text-accent-700 hover:underline">
                    privacy@dunningdog.com
                  </a>
                </p>
                <p>
                  General support:{" "}
                  <a href="mailto:support@dunningdog.com" className="text-accent-700 hover:underline">
                    support@dunningdog.com
                  </a>
                </p>
              </div>
              <p>
                We aim to respond to all privacy-related inquiries within 30 days.
              </p>
            </section>
          </div>
    </PolicyPageLayout>
  );
}
