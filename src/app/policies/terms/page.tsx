import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPageLayout } from "@/components/layouts/policy-page-layout";

export const metadata: Metadata = {
  title: "Terms of Service | DunningDog",
  description:
    "Terms and conditions for using the DunningDog payment recovery platform.",
};

export default function TermsPolicyPage() {
  return (
    <PolicyPageLayout>
      <p className="text-sm font-medium text-accent-700">
        Last updated: March 3, 2026
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
        Terms of Service
      </h1>
      <p className="mt-4 text-sm leading-7 text-zinc-600">
        These Terms of Service (&quot;Terms&quot;) govern your access to and use of
        DunningDog (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;), a payment recovery platform
        operated at <strong>dunningdog.com</strong>. By creating an account, connecting a
        Stripe account, or otherwise using our services, you agree to be bound by these Terms.
        If you do not agree, you may not use DunningDog.
      </p>

      <nav className="mt-6 rounded-lg bg-zinc-50 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Contents
        </p>
        <ol className="gap-8 space-y-1 text-sm text-accent-700 sm:columns-2">
          <li><a href="#definitions" className="hover:underline">1. Definitions</a></li>
          <li><a href="#eligibility" className="hover:underline">2. Eligibility</a></li>
          <li><a href="#account" className="hover:underline">3. Account Registration</a></li>
          <li><a href="#service" className="hover:underline">4. Service Description</a></li>
          <li><a href="#stripe-connect" className="hover:underline">5. Stripe Connect Integration</a></li>
          <li><a href="#plans-billing" className="hover:underline">6. Subscription Plans &amp; Billing</a></li>
          <li><a href="#cancellation" className="hover:underline">7. Cancellation &amp; Refunds</a></li>
          <li><a href="#acceptable-use" className="hover:underline">8. Acceptable Use</a></li>
          <li><a href="#customer-data" className="hover:underline">9. Your Data &amp; Customer Data</a></li>
          <li><a href="#ip" className="hover:underline">10. Intellectual Property</a></li>
          <li><a href="#confidentiality" className="hover:underline">11. Confidentiality</a></li>
          <li><a href="#availability" className="hover:underline">12. Service Availability</a></li>
          <li><a href="#disclaimers" className="hover:underline">13. Disclaimers</a></li>
          <li><a href="#liability" className="hover:underline">14. Limitation of Liability</a></li>
          <li><a href="#indemnification" className="hover:underline">15. Indemnification</a></li>
          <li><a href="#suspension" className="hover:underline">16. Suspension &amp; Termination</a></li>
          <li><a href="#changes" className="hover:underline">17. Changes to Terms</a></li>
          <li><a href="#governing-law" className="hover:underline">18. Governing Law &amp; Disputes</a></li>
          <li><a href="#general" className="hover:underline">19. General Provisions</a></li>
          <li><a href="#contact" className="hover:underline">20. Contact</a></li>
        </ol>
      </nav>

      <div className="mt-8 space-y-8 text-sm leading-7 text-zinc-700">
        {/* 1. Definitions */}
        <section id="definitions" className="space-y-3 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">1. Definitions</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>&quot;Service&quot;</strong> means the DunningDog platform, including the
              website at dunningdog.com, dashboard, API, email sending features, and all
              related tools and documentation.
            </li>
            <li>
              <strong>&quot;Customer&quot;</strong> or <strong>&quot;you&quot;</strong> means the
              individual or legal entity that creates an account and uses DunningDog.
            </li>
            <li>
              <strong>&quot;Workspace&quot;</strong> means an organizational unit within
              DunningDog tied to a single Stripe account and billing subscription.
            </li>
            <li>
              <strong>&quot;End User&quot;</strong> means a customer of yours whose payment
              information is processed through DunningDog&apos;s recovery features.
            </li>
            <li>
              <strong>&quot;Connected Account&quot;</strong> means your Stripe account that you
              authorize DunningDog to access via Stripe Connect OAuth.
            </li>
            <li>
              <strong>&quot;Dunning Sequence&quot;</strong> means a configured series of
              automated recovery emails sent to End Users after a failed payment event.
            </li>
            <li>
              <strong>&quot;Recovery&quot;</strong> means the process of attempting to collect a
              failed or at-risk payment through automated email sequences.
            </li>
          </ul>
        </section>

        {/* 2. Eligibility */}
        <section id="eligibility" className="space-y-2 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">2. Eligibility</h2>
          <p>
            To use DunningDog, you must:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Be at least 18 years old or the age of legal majority in your jurisdiction</li>
            <li>Have the authority to bind the legal entity you represent to these Terms</li>
            <li>Have a valid Stripe account in good standing</li>
            <li>Comply with Stripe&apos;s own Terms of Service and Acceptable Use Policy</li>
            <li>Not be located in a country subject to U.S. or EU sanctions, or on any sanctions list</li>
          </ul>
          <p>
            By creating an account, you represent and warrant that all of the above conditions
            are met.
          </p>
        </section>

        {/* 3. Account Registration */}
        <section id="account" className="space-y-2 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">3. Account Registration</h2>
          <p>
            You may register for an account using an email address and password, or by
            authenticating through a supported identity provider (e.g., Google OAuth). You
            agree to:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Provide accurate, current, and complete registration information</li>
            <li>Maintain the security and confidentiality of your login credentials</li>
            <li>Promptly update your account information if it changes</li>
            <li>
              Accept responsibility for all activity that occurs under your account, whether
              or not authorized by you
            </li>
          </ul>
          <p>
            You must notify us immediately at{" "}
            <a href="mailto:support@dunningdog.com" className="text-accent-700 hover:underline">
              support@dunningdog.com
            </a>{" "}
            if you suspect unauthorized access to your account. We are not liable for losses
            arising from unauthorized use of your credentials.
          </p>
        </section>

        {/* 4. Service Description */}
        <section id="service" className="space-y-3 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">4. Service Description</h2>
          <p>
            DunningDog is a software-as-a-service (SaaS) platform that helps businesses
            recover failed subscription payments. The Service includes:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Payment monitoring</strong> — detection of failed, past-due, and at-risk
              payments via your connected Stripe account
            </li>
            <li>
              <strong>Pre-dunning alerts</strong> — identification of expiring payment methods
              before charges fail
            </li>
            <li>
              <strong>Automated dunning sequences</strong> — configurable email sequences sent
              to End Users to encourage payment recovery
            </li>
            <li>
              <strong>Recovery dashboard</strong> — real-time metrics on recovery rates,
              revenue recovered, and sequence performance
            </li>
            <li>
              <strong>Email branding</strong> — customizable sender name, colors, and logo for
              dunning emails (available on Pro and Scale plans)
            </li>
            <li>
              <strong>Analytics and exports</strong> — CSV export of recovery data and
              performance metrics
            </li>
          </ul>
          <p>
            DunningDog does not process payments directly. All payment processing is handled
            by Stripe. We do not hold, transfer, or have access to End User funds at any point.
          </p>
        </section>

        {/* 5. Stripe Connect */}
        <section id="stripe-connect" className="space-y-3 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">5. Stripe Connect Integration</h2>
          <p>
            To use DunningDog&apos;s core features, you must connect your Stripe account via
            Stripe Connect OAuth. By connecting your account, you:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              Authorize DunningDog to read invoice, subscription, customer, and payment method
              data from your Stripe account
            </li>
            <li>
              Authorize DunningDog to receive webhook events from Stripe related to payment
              failures, invoice status changes, and subscription updates
            </li>
            <li>
              Acknowledge that DunningDog stores an encrypted OAuth access token for your
              Stripe account, which can be revoked at any time from your Stripe dashboard or
              DunningDog settings
            </li>
          </ul>

          <h3 className="font-semibold text-zinc-800">5.1 Data Access Scope</h3>
          <p>
            DunningDog accesses only the Stripe data necessary for payment recovery. We do{" "}
            <strong>not</strong> access full card numbers, bank account details, personal
            identification documents, or payout/transfer data. You can review the specific
            permissions in the Stripe Connect authorization prompt.
          </p>

          <h3 className="font-semibold text-zinc-800">5.2 Disconnecting</h3>
          <p>
            You may disconnect your Stripe account at any time through the DunningDog
            settings page or through the Stripe Dashboard. Upon disconnection, DunningDog
            will immediately cease accessing your Stripe data, delete the stored OAuth token,
            and stop all active dunning sequences for that workspace.
          </p>
        </section>

        {/* 6. Plans & Billing */}
        <section id="plans-billing" className="space-y-3 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">6. Subscription Plans &amp; Billing</h2>

          <h3 className="font-semibold text-zinc-800">6.1 Plans</h3>
          <p>
            DunningDog offers three subscription tiers: <strong>Starter</strong>,{" "}
            <strong>Pro</strong>, and <strong>Scale</strong>. Each plan includes specific
            features and is subject to a monthly recurring revenue (MRR) cap. Plan details,
            pricing, and feature comparisons are available on our{" "}
            <Link href="/pricing" className="text-accent-700 hover:underline">pricing page</Link>.
          </p>

          <h3 className="font-semibold text-zinc-800">6.2 Billing Cycle</h3>
          <p>
            Subscriptions are billed in advance on a monthly or annual recurring cycle,
            depending on your selection. Annual subscriptions are billed as a single upfront
            payment for the full year at a discounted rate.
          </p>

          <h3 className="font-semibold text-zinc-800">6.3 Payment Method</h3>
          <p>
            All payments are processed through Stripe. By subscribing, you authorize
            DunningDog (via Stripe) to charge the payment method on file for all applicable
            subscription fees. You are responsible for keeping your payment method current and
            valid.
          </p>

          <h3 className="font-semibold text-zinc-800">6.4 Failed Payments</h3>
          <p>
            If a subscription payment fails, we will attempt to collect the payment according
            to Stripe&apos;s retry schedule. If payment cannot be collected after multiple
            attempts, your subscription may be suspended or downgraded. We will notify you by
            email before any service interruption.
          </p>

          <h3 className="font-semibold text-zinc-800">6.5 Taxes</h3>
          <p>
            Prices are exclusive of applicable taxes unless otherwise stated. You are
            responsible for all taxes, levies, or duties imposed by taxing authorities on your
            subscription. Stripe may collect and remit taxes on our behalf where required by law.
          </p>

          <h3 className="font-semibold text-zinc-800">6.6 Plan Changes</h3>
          <p>
            You may upgrade or downgrade your plan at any time from the settings page.
            Upgrades take effect immediately and are prorated for the remainder of the
            current billing cycle. Downgrades take effect at the start of the next billing
            cycle. Features exclusive to your current plan may become unavailable upon downgrade.
          </p>
        </section>

        {/* 7. Cancellation & Refunds */}
        <section id="cancellation" className="space-y-3 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">7. Cancellation &amp; Refunds</h2>

          <h3 className="font-semibold text-zinc-800">7.1 Cancellation</h3>
          <p>
            You may cancel your subscription at any time from the DunningDog settings page.
            Upon cancellation:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>No further charges will be made to your payment method</li>
            <li>
              You retain access to the Service through the end of your current paid billing
              period
            </li>
            <li>
              Active dunning sequences will continue running until the end of the billing
              period, unless you manually pause or delete them
            </li>
            <li>
              After the billing period expires, your workspace will be deactivated and
              sequences will stop
            </li>
          </ul>

          <h3 className="font-semibold text-zinc-800">7.2 Refunds</h3>
          <p>
            First-time subscriptions are eligible for a full refund if requested within{" "}
            <strong>14 calendar days</strong> of the initial charge. Renewal payments are
            generally non-refundable, except in cases of verified billing errors or duplicate
            charges. For full details, see our{" "}
            <Link href="/policies/refunds" className="text-accent-700 hover:underline">
              Refund Policy
            </Link>.
          </p>

          <h3 className="font-semibold text-zinc-800">7.3 Data After Cancellation</h3>
          <p>
            Following cancellation and expiration of your billing period, your workspace data
            (sequences, recovery history, settings) will be retained for 30 days to allow for
            reactivation. After 30 days, data is permanently deleted in accordance with our{" "}
            <Link href="/policies/privacy" className="text-accent-700 hover:underline">
              Privacy Policy
            </Link>.
          </p>
        </section>

        {/* 8. Acceptable Use */}
        <section id="acceptable-use" className="space-y-3 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">8. Acceptable Use</h2>
          <p>
            You agree to use DunningDog only for its intended purpose of payment recovery
            for legitimate subscription businesses. You may <strong>not</strong>:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              Use the Service for any purpose that violates applicable local, national, or
              international laws or regulations
            </li>
            <li>
              Send spam, harassing, misleading, or deceptive content through DunningDog&apos;s
              email features
            </li>
            <li>
              Use dunning sequences to collect on fraudulent, disputed, or unauthorized
              charges
            </li>
            <li>
              Attempt to bypass MRR caps, usage limits, or feature restrictions of your
              subscription plan
            </li>
            <li>
              Reverse-engineer, decompile, disassemble, or otherwise attempt to derive the
              source code of the Service
            </li>
            <li>
              Access or attempt to access another customer&apos;s workspace, data, or account
            </li>
            <li>
              Interfere with or disrupt the integrity, performance, or availability of the
              Service or its infrastructure
            </li>
            <li>
              Use the Service to process payments or recover funds related to illegal
              activities, prohibited goods or services, or content that violates Stripe&apos;s
              Restricted Businesses list
            </li>
            <li>
              Resell, sublicense, or provide access to the Service to third parties without
              our prior written consent
            </li>
            <li>
              Use automated tools (bots, scrapers, crawlers) to access the Service except
              through our documented API
            </li>
          </ul>
          <p>
            We reserve the right to investigate suspected violations and may suspend or
            terminate accounts that breach this policy.
          </p>
        </section>

        {/* 9. Customer Data */}
        <section id="customer-data" className="space-y-3 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">9. Your Data &amp; Customer Data</h2>

          <h3 className="font-semibold text-zinc-800">9.1 Your Data</h3>
          <p>
            You retain all rights to the data you provide to DunningDog, including sequence
            configurations, branding assets, and workspace settings. We do not claim
            ownership over your data. We use your data solely to provide and improve the
            Service in accordance with our{" "}
            <Link href="/policies/privacy" className="text-accent-700 hover:underline">
              Privacy Policy
            </Link>.
          </p>

          <h3 className="font-semibold text-zinc-800">9.2 End User Data</h3>
          <p>
            When you connect your Stripe account, DunningDog processes data about your End
            Users (email addresses, invoice amounts, subscription status, payment method
            details) solely for the purpose of executing dunning sequences and displaying
            recovery metrics.
          </p>
          <p>
            <strong>You are the data controller</strong> of your End User data. DunningDog
            acts as a data processor on your behalf. You are responsible for ensuring that
            your use of DunningDog complies with applicable data protection laws (including
            GDPR, if applicable) and that you have a valid legal basis for processing your
            End Users&apos; personal data.
          </p>

          <h3 className="font-semibold text-zinc-800">9.3 Emails Sent to End Users</h3>
          <p>
            DunningDog sends dunning emails to your End Users on your behalf. You are
            responsible for the content of your dunning sequences and for ensuring that
            emails comply with applicable laws, including anti-spam legislation (e.g.,
            CAN-SPAM, GDPR). Emails are sent from a DunningDog-managed sending
            infrastructure, but appear as communications from your business.
          </p>

          <h3 className="font-semibold text-zinc-800">9.4 Data Portability</h3>
          <p>
            You may export your recovery data and analytics at any time via the CSV export
            feature in the dashboard. Upon account termination, you may request a data export
            during the 30-day retention period by contacting{" "}
            <a href="mailto:support@dunningdog.com" className="text-accent-700 hover:underline">
              support@dunningdog.com
            </a>.
          </p>
        </section>

        {/* 10. IP */}
        <section id="ip" className="space-y-3 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">10. Intellectual Property</h2>

          <h3 className="font-semibold text-zinc-800">10.1 Our Rights</h3>
          <p>
            DunningDog, including its software, design, logos, trademarks, documentation,
            and all related intellectual property, is and remains the exclusive property of
            DunningDog. These Terms do not grant you any right, title, or interest in the
            Service except for the limited right to use it in accordance with these Terms.
          </p>

          <h3 className="font-semibold text-zinc-800">10.2 Feedback</h3>
          <p>
            If you provide suggestions, ideas, or feedback about the Service, you grant
            DunningDog a non-exclusive, royalty-free, worldwide, perpetual, and irrevocable
            license to use, modify, and incorporate such feedback into the Service without
            obligation or compensation to you.
          </p>

          <h3 className="font-semibold text-zinc-800">10.3 Your Branding</h3>
          <p>
            If you upload logos, brand colors, or other branding assets for use in dunning
            emails, you retain ownership of those assets and grant DunningDog a limited
            license to use them solely for the purpose of rendering your branded emails.
          </p>
        </section>

        {/* 11. Confidentiality */}
        <section id="confidentiality" className="space-y-2 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">11. Confidentiality</h2>
          <p>
            Each party agrees to keep confidential all non-public information disclosed by the
            other party in connection with these Terms, including business data, technical
            information, and access credentials. Confidential information may not be disclosed
            to third parties except:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>To service providers bound by confidentiality obligations</li>
            <li>As required by law, regulation, or court order</li>
            <li>With the prior written consent of the disclosing party</li>
          </ul>
          <p>
            This obligation survives termination of these Terms for a period of two (2) years.
          </p>
        </section>

        {/* 12. Availability */}
        <section id="availability" className="space-y-3 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">12. Service Availability</h2>

          <h3 className="font-semibold text-zinc-800">12.1 Uptime</h3>
          <p>
            We strive to maintain high availability of the Service but do not guarantee
            uninterrupted access. The Service may be temporarily unavailable due to
            maintenance, updates, infrastructure issues, or factors beyond our control.
          </p>

          <h3 className="font-semibold text-zinc-800">12.2 Maintenance</h3>
          <p>
            We may perform scheduled maintenance that temporarily affects Service
            availability. Where possible, we will provide advance notice of planned
            maintenance via email or dashboard notification. Emergency maintenance may occur
            without advance notice.
          </p>

          <h3 className="font-semibold text-zinc-800">12.3 Third-Party Dependencies</h3>
          <p>
            DunningDog depends on third-party services including Stripe, Supabase, and email
            delivery providers. Outages, API changes, or policy changes by these providers
            may affect Service functionality. We are not responsible for disruptions caused
            by third-party providers.
          </p>
        </section>

        {/* 13. Disclaimers */}
        <section id="disclaimers" className="space-y-2 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">13. Disclaimers</h2>
          <p className="font-semibold uppercase">
            The Service is provided on an &quot;as is&quot; and &quot;as available&quot; basis,
            without warranties of any kind, either express or implied.
          </p>
          <p>To the fullest extent permitted by applicable law, DunningDog disclaims all warranties, including but not limited to:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Implied warranties</strong> of merchantability, fitness for a particular
              purpose, and non-infringement
            </li>
            <li>
              <strong>Revenue guarantees</strong> — we do not guarantee that the Service will
              recover any specific amount of failed payments or achieve any particular
              recovery rate
            </li>
            <li>
              <strong>Email delivery</strong> — we do not guarantee that all dunning emails
              will be delivered to, or opened by, End Users. Delivery depends on email
              infrastructure, spam filters, and recipient behavior
            </li>
            <li>
              <strong>Stripe compatibility</strong> — we do not guarantee continued
              compatibility with all Stripe features, API versions, or account configurations
            </li>
            <li>
              <strong>Uninterrupted operation</strong> — we do not guarantee that the Service
              will be error-free, secure, or available at all times
            </li>
          </ul>
          <p>
            You acknowledge that payment recovery involves inherent uncertainty, and that
            DunningDog is a tool to assist — not guarantee — the collection of failed payments.
          </p>
        </section>

        {/* 14. Limitation of Liability */}
        <section id="liability" className="space-y-3 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">14. Limitation of Liability</h2>

          <h3 className="font-semibold text-zinc-800">14.1 Exclusion of Indirect Damages</h3>
          <p className="font-semibold uppercase">
            To the maximum extent permitted by applicable law, in no event shall DunningDog,
            its officers, directors, employees, agents, or affiliates be liable for any
            indirect, incidental, special, consequential, or punitive damages, including but
            not limited to:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Loss of revenue, profits, or business opportunities</li>
            <li>Loss of data or data corruption</li>
            <li>Loss of goodwill or reputation</li>
            <li>Cost of procuring substitute services</li>
            <li>Damages arising from End User complaints or disputes</li>
          </ul>
          <p>
            This applies regardless of the theory of liability (contract, tort, negligence,
            strict liability, or otherwise), even if DunningDog has been advised of the
            possibility of such damages.
          </p>

          <h3 className="font-semibold text-zinc-800">14.2 Liability Cap</h3>
          <p>
            DunningDog&apos;s total aggregate liability for all claims arising out of or
            relating to these Terms or the Service shall not exceed the greater of (a) the
            total fees paid by you to DunningDog in the <strong>twelve (12) months</strong>{" "}
            preceding the event giving rise to the claim, or (b) <strong>one hundred U.S.
            dollars ($100)</strong>.
          </p>

          <h3 className="font-semibold text-zinc-800">14.3 Essential Basis</h3>
          <p>
            You acknowledge that the limitations of liability in this section reflect a
            reasonable allocation of risk between the parties and are an essential basis of
            the bargain between us. DunningDog would not provide the Service without these
            limitations.
          </p>
        </section>

        {/* 15. Indemnification */}
        <section id="indemnification" className="space-y-2 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">15. Indemnification</h2>
          <p>
            You agree to indemnify, defend, and hold harmless DunningDog and its officers,
            directors, employees, and agents from and against any claims, liabilities,
            damages, losses, costs, and expenses (including reasonable legal fees) arising
            out of or related to:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Your use of the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of applicable laws or regulations</li>
            <li>
              The content of dunning emails sent on your behalf, including claims by End
              Users
            </li>
            <li>
              Your breach of data protection obligations with respect to End User data
            </li>
            <li>
              Any dispute between you and your End Users related to payments, subscriptions,
              or communications sent through DunningDog
            </li>
          </ul>
        </section>

        {/* 16. Suspension & Termination */}
        <section id="suspension" className="space-y-3 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">16. Suspension &amp; Termination</h2>

          <h3 className="font-semibold text-zinc-800">16.1 Suspension by DunningDog</h3>
          <p>
            We may suspend your access to the Service, in whole or in part, immediately and
            without prior notice, if:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>You breach these Terms, including the Acceptable Use policy</li>
            <li>Your subscription payment fails and remains unpaid after the retry period</li>
            <li>We reasonably believe your account poses a security risk</li>
            <li>Required by law, regulation, or a valid legal process</li>
            <li>Stripe revokes or restricts your Connected Account</li>
          </ul>
          <p>
            We will attempt to notify you promptly of any suspension and provide an
            opportunity to remediate, unless prohibited by law or where immediate action is
            necessary to protect the Service or other customers.
          </p>

          <h3 className="font-semibold text-zinc-800">16.2 Termination by You</h3>
          <p>
            You may terminate your account at any time by canceling your subscription and
            contacting us to request account deletion. The cancellation terms in Section 7
            apply.
          </p>

          <h3 className="font-semibold text-zinc-800">16.3 Termination by DunningDog</h3>
          <p>
            We may terminate your account and these Terms if you materially breach these
            Terms and fail to cure the breach within 14 days of written notice, or
            immediately for violations of the Acceptable Use policy, non-payment exceeding
            30 days, or where required by law.
          </p>

          <h3 className="font-semibold text-zinc-800">16.4 Effects of Termination</h3>
          <p>Upon termination:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Your right to access and use the Service ceases immediately</li>
            <li>All active dunning sequences are stopped</li>
            <li>Your Stripe OAuth connection is revoked</li>
            <li>
              Workspace data is retained for 30 days (for potential reactivation), then
              permanently deleted
            </li>
            <li>
              Sections that by their nature should survive termination will survive,
              including Sections 9 (data obligations), 10 (IP), 11 (confidentiality), 13
              (disclaimers), 14 (liability), 15 (indemnification), and 18 (governing law)
            </li>
          </ul>
        </section>

        {/* 17. Changes to Terms */}
        <section id="changes" className="space-y-2 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">17. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. When we make material changes, we
            will:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Update the &quot;Last updated&quot; date at the top of this page</li>
            <li>Notify you via email at least <strong>30 days</strong> before material changes take effect</li>
            <li>Post a summary of changes on our website</li>
          </ul>
          <p>
            If you do not agree with the updated Terms, you may cancel your subscription
            before they take effect. Your continued use of DunningDog after the effective
            date constitutes acceptance of the revised Terms.
          </p>
        </section>

        {/* 18. Governing Law */}
        <section id="governing-law" className="space-y-3 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">18. Governing Law &amp; Dispute Resolution</h2>

          <h3 className="font-semibold text-zinc-800">18.1 Governing Law</h3>
          <p>
            These Terms are governed by and construed in accordance with the laws of the
            Netherlands, without regard to its conflict of law provisions. The United Nations
            Convention on Contracts for the International Sale of Goods (CISG) does not apply.
          </p>

          <h3 className="font-semibold text-zinc-800">18.2 Dispute Resolution</h3>
          <p>
            Before initiating formal proceedings, both parties agree to attempt to resolve
            disputes through good-faith negotiation for a period of 30 days after written
            notice of the dispute. If the dispute cannot be resolved through negotiation, it
            shall be submitted to the competent courts in the Netherlands.
          </p>

          <h3 className="font-semibold text-zinc-800">18.3 Consumer Rights</h3>
          <p>
            Nothing in these Terms limits or excludes any rights you may have under mandatory
            consumer protection laws in your jurisdiction. If you are a consumer in the
            European Union, you are entitled to bring proceedings in the courts of your
            country of residence.
          </p>
        </section>

        {/* 19. General */}
        <section id="general" className="space-y-3 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">19. General Provisions</h2>

          <h3 className="font-semibold text-zinc-800">19.1 Entire Agreement</h3>
          <p>
            These Terms, together with the{" "}
            <Link href="/policies/privacy" className="text-accent-700 hover:underline">Privacy Policy</Link>,{" "}
            <Link href="/policies/cookies" className="text-accent-700 hover:underline">Cookie Policy</Link>,{" "}
            and{" "}
            <Link href="/policies/refunds" className="text-accent-700 hover:underline">Refund Policy</Link>,
            constitute the entire agreement between you and DunningDog regarding the Service
            and supersede all prior agreements, representations, and understandings.
          </p>

          <h3 className="font-semibold text-zinc-800">19.2 Severability</h3>
          <p>
            If any provision of these Terms is found to be unenforceable or invalid by a
            court of competent jurisdiction, that provision shall be limited or eliminated to
            the minimum extent necessary, and the remaining provisions shall remain in full
            force and effect.
          </p>

          <h3 className="font-semibold text-zinc-800">19.3 Waiver</h3>
          <p>
            The failure of DunningDog to enforce any right or provision of these Terms shall
            not constitute a waiver of that right or provision. Any waiver must be in writing
            and signed by DunningDog.
          </p>

          <h3 className="font-semibold text-zinc-800">19.4 Assignment</h3>
          <p>
            You may not assign or transfer these Terms or your account without our prior
            written consent. DunningDog may assign these Terms in connection with a merger,
            acquisition, reorganization, or sale of all or substantially all of its assets,
            with notice to you.
          </p>

          <h3 className="font-semibold text-zinc-800">19.5 Force Majeure</h3>
          <p>
            DunningDog shall not be liable for any failure or delay in performance due to
            causes beyond its reasonable control, including but not limited to natural
            disasters, war, terrorism, pandemics, labor disputes, government actions, internet
            or infrastructure outages, and third-party service failures.
          </p>

          <h3 className="font-semibold text-zinc-800">19.6 Notices</h3>
          <p>
            All notices from DunningDog to you will be sent to the email address associated
            with your account. You are responsible for keeping your email address current.
            Notices are deemed received 24 hours after being sent.
          </p>
        </section>

        {/* 20. Contact */}
        <section id="contact" className="space-y-2 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">20. Contact</h2>
          <p>
            If you have questions about these Terms or need assistance, contact us at:
          </p>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm">
            <p><strong>DunningDog</strong></p>
            <p>
              Email:{" "}
              <a
                href="mailto:support@dunningdog.com"
                className="text-accent-700 hover:underline"
              >
                support@dunningdog.com
              </a>
            </p>
            <p>
              Legal inquiries:{" "}
              <a
                href="mailto:legal@dunningdog.com"
                className="text-accent-700 hover:underline"
              >
                legal@dunningdog.com
              </a>
            </p>
          </div>
        </section>
      </div>
    </PolicyPageLayout>
  );
}
