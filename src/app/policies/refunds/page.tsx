import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPageLayout } from "@/components/layouts/policy-page-layout";

export const metadata: Metadata = {
  title: "Refund Policy | DunningDog",
  description:
    "Subscription billing, cancellation, and refund terms for DunningDog.",
};

export default function RefundsPolicyPage() {
  return (
    <PolicyPageLayout>
      <p className="text-sm font-medium text-accent-700">
        Last updated: March 3, 2026
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
        Refund Policy
      </h1>
      <p className="mt-4 text-sm leading-7 text-zinc-600">
        This Refund Policy explains the billing, cancellation, and refund terms for
        DunningDog (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). By subscribing to
        a paid plan, you acknowledge and agree to the terms outlined below. This policy
        is part of and subject to our{" "}
        <Link href="/policies/terms" className="text-accent-700 hover:underline">
          Terms of Service
        </Link>.
      </p>

      <nav className="mt-6 rounded-lg bg-zinc-50 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Contents
        </p>
        <ol className="columns-2 gap-8 space-y-1 text-sm text-accent-700">
          <li><a href="#billing" className="hover:underline">1. Subscription Billing</a></li>
          <li><a href="#initial-refund" className="hover:underline">2. Initial Purchase Refund</a></li>
          <li><a href="#renewals" className="hover:underline">3. Renewal Charges</a></li>
          <li><a href="#annual" className="hover:underline">4. Annual Subscriptions</a></li>
          <li><a href="#plan-changes" className="hover:underline">5. Plan Changes</a></li>
          <li><a href="#cancellation" className="hover:underline">6. Cancellation</a></li>
          <li><a href="#non-refundable" className="hover:underline">7. Non-Refundable Items</a></li>
          <li><a href="#exceptions" className="hover:underline">8. Refund Exceptions</a></li>
          <li><a href="#refund-method" className="hover:underline">9. Refund Method &amp; Timing</a></li>
          <li><a href="#chargebacks" className="hover:underline">10. Chargebacks &amp; Disputes</a></li>
          <li><a href="#consumer-rights" className="hover:underline">11. Statutory Consumer Rights</a></li>
          <li><a href="#how-to-request" className="hover:underline">12. How to Request a Refund</a></li>
          <li><a href="#changes" className="hover:underline">13. Changes to This Policy</a></li>
          <li><a href="#contact" className="hover:underline">14. Contact</a></li>
        </ol>
      </nav>

      <div className="mt-8 space-y-8 text-sm leading-7 text-zinc-700">
        {/* 1. Billing */}
        <section id="billing" className="space-y-3 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">1. Subscription Billing</h2>
          <p>
            DunningDog offers paid subscription plans billed on a <strong>monthly</strong>{" "}
            or <strong>annual</strong> recurring cycle, depending on your selection. All
            subscriptions:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              Are billed <strong>in advance</strong> at the start of each billing cycle
            </li>
            <li>
              Renew automatically unless canceled before the next billing date
            </li>
            <li>
              Are processed through <strong>Stripe</strong> using the payment method on
              file
            </li>
          </ul>
          <p>
            By subscribing, you authorize DunningDog (via Stripe) to charge your payment
            method for all applicable fees. You are responsible for keeping your payment
            information current and valid. Current plan pricing is available on our{" "}
            <Link href="/pricing" className="text-accent-700 hover:underline">
              pricing page
            </Link>.
          </p>
        </section>

        {/* 2. Initial Purchase Refund */}
        <section id="initial-refund" className="space-y-3 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">2. Initial Purchase Refund</h2>
          <p>
            We want you to be confident in your decision to use DunningDog. If you are a{" "}
            <strong>first-time subscriber</strong> and are not satisfied with the Service,
            you may request a full refund of your initial payment within{" "}
            <strong>14 calendar days</strong> of the date of your first charge, subject to
            the following conditions:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              The refund request must be submitted within the 14-day window — requests
              received after this period are not eligible
            </li>
            <li>
              This right applies only to your <strong>first subscription purchase</strong>{" "}
              with DunningDog and cannot be used more than once per customer or
              organization
            </li>
            <li>
              If you have previously received a refund under this policy and re-subscribe,
              the new subscription is not eligible for another initial purchase refund
            </li>
          </ul>
          <p>
            Upon approval of an initial purchase refund, your subscription will be
            immediately canceled, all active dunning sequences will be stopped, and access
            to the dashboard will be revoked.
          </p>
        </section>

        {/* 3. Renewals */}
        <section id="renewals" className="space-y-2 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">3. Renewal Charges</h2>
          <p>
            Subscription renewal payments (monthly or annual) are{" "}
            <strong>non-refundable</strong>. When your subscription renews, you are
            purchasing access to the Service for the upcoming billing period.
          </p>
          <p>
            It is your responsibility to cancel before the renewal date if you do not wish
            to continue. We send a reminder email at least <strong>7 days</strong> before
            annual renewals to give you time to decide. Monthly renewals do not include
            advance reminders, as you can cancel at any time from the settings page.
          </p>
          <p>
            Refunds will not be granted for failure to cancel before a renewal, forgetting
            about a subscription, or for unused portions of a billing period.
          </p>
        </section>

        {/* 4. Annual */}
        <section id="annual" className="space-y-2 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">4. Annual Subscriptions</h2>
          <p>
            Annual subscriptions are billed as a single upfront payment for a 12-month
            period at a discounted rate compared to monthly billing. Due to the discounted
            pricing:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              Annual payments are <strong>non-refundable</strong> after the 14-day initial
              purchase window (if applicable)
            </li>
            <li>
              No prorated refunds are issued for early cancellation of an annual
              subscription
            </li>
            <li>
              If you cancel an annual subscription, you retain access to the Service until
              the end of the prepaid 12-month period
            </li>
          </ul>
          <p>
            We recommend starting with a monthly plan if you are unsure whether DunningDog
            is the right fit for your business.
          </p>
        </section>

        {/* 5. Plan Changes */}
        <section id="plan-changes" className="space-y-3 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">5. Plan Changes</h2>

          <h3 className="font-semibold text-zinc-800">5.1 Upgrades</h3>
          <p>
            When you upgrade to a higher-tier plan, the price difference is{" "}
            <strong>prorated</strong> for the remainder of your current billing cycle. You
            are charged the prorated amount immediately and gain instant access to the new
            plan&apos;s features. No refund is issued for the portion of the lower plan
            already paid — the unused value is credited toward the upgrade cost.
          </p>

          <h3 className="font-semibold text-zinc-800">5.2 Downgrades</h3>
          <p>
            When you downgrade to a lower-tier plan, the change takes effect at the{" "}
            <strong>start of your next billing cycle</strong>. No refund or credit is
            issued for the price difference between plans during the current cycle. You
            continue to have access to the higher-tier features until the cycle ends.
          </p>
        </section>

        {/* 6. Cancellation */}
        <section id="cancellation" className="space-y-3 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">6. Cancellation</h2>
          <p>
            You may cancel your subscription at any time through the DunningDog settings
            page or through the Stripe Billing Portal. Upon cancellation:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              No further charges will be made to your payment method
            </li>
            <li>
              You retain full access to the Service, including all features of your
              current plan, until the end of the current paid billing period
            </li>
            <li>
              Active dunning sequences continue running until the billing period ends,
              unless you manually pause or delete them
            </li>
            <li>
              After the billing period expires, your workspace is deactivated, sequences
              are stopped, and your Stripe connection is paused
            </li>
          </ul>
          <p>
            Canceling your subscription does <strong>not</strong> entitle you to a refund
            for the current billing period. You have already purchased access for that
            period and the Service remains available to you until it ends.
          </p>
        </section>

        {/* 7. Non-Refundable Items */}
        <section id="non-refundable" className="space-y-2 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">7. Non-Refundable Items</h2>
          <p>
            The following are <strong>not eligible</strong> for refunds under any
            circumstances:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              Subscription renewal payments (monthly or annual) after the charge has been
              processed
            </li>
            <li>
              Unused time remaining on a canceled subscription
            </li>
            <li>
              Plan downgrades — the difference in price between your current and new plan
            </li>
            <li>
              Periods during which the Service was available but not actively used by you
            </li>
            <li>
              Fees for billing periods where your dunning sequences were active and sending
              emails on your behalf
            </li>
            <li>
              Charges resulting from failure to cancel before a renewal date
            </li>
            <li>
              Accounts terminated by DunningDog for violation of the{" "}
              <Link href="/policies/terms" className="text-accent-700 hover:underline">
                Terms of Service
              </Link>{" "}
              or Acceptable Use Policy
            </li>
          </ul>
        </section>

        {/* 8. Refund Exceptions */}
        <section id="exceptions" className="space-y-3 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">8. Refund Exceptions</h2>
          <p>
            While our general policy is that payments beyond the 14-day initial window are
            non-refundable, we may, at our <strong>sole discretion</strong>, grant
            exceptions in the following cases:
          </p>

          <h3 className="font-semibold text-zinc-800">8.1 Billing Errors</h3>
          <p>
            If you were charged an incorrect amount due to a system error, or if a
            duplicate charge occurred, we will refund the incorrect or duplicated amount.
            You must report billing errors within <strong>30 days</strong> of the charge.
          </p>

          <h3 className="font-semibold text-zinc-800">8.2 Extended Service Outage</h3>
          <p>
            If DunningDog experiences a continuous, unscheduled outage lasting more than{" "}
            <strong>72 hours</strong> that materially prevents you from using the core
            Service (dunning sequences, dashboard, and Stripe integration), you may request
            a prorated credit for the affected period. Credits are applied to future
            billing cycles and are <strong>not</strong> refunded as cash.
          </p>

          <h3 className="font-semibold text-zinc-800">8.3 Exceptional Circumstances</h3>
          <p>
            We reserve the right to consider refund requests outside these guidelines on a
            case-by-case basis. Such exceptions are entirely at DunningDog&apos;s discretion
            and do not establish precedent for future requests.
          </p>
        </section>

        {/* 9. Refund Method & Timing */}
        <section id="refund-method" className="space-y-3 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">9. Refund Method &amp; Processing Time</h2>

          <h3 className="font-semibold text-zinc-800">9.1 Method</h3>
          <p>
            Approved refunds are processed through <strong>Stripe</strong> and returned to
            the <strong>original payment method</strong> used for the charge. We cannot
            issue refunds to alternative payment methods, bank accounts, or third parties.
          </p>

          <h3 className="font-semibold text-zinc-800">9.2 Processing Time</h3>
          <p>
            Refund requests are reviewed within <strong>5 business days</strong> of receipt.
            Once approved, refunds are initiated immediately via Stripe. Depending on your
            payment provider and bank, it may take an additional{" "}
            <strong>5–10 business days</strong> for the refund to appear on your statement.
          </p>

          <h3 className="font-semibold text-zinc-800">9.3 Currency</h3>
          <p>
            Refunds are issued in the same currency as the original charge. Exchange rate
            differences between the time of charge and refund are determined by your bank
            or card issuer and are outside DunningDog&apos;s control.
          </p>
        </section>

        {/* 10. Chargebacks */}
        <section id="chargebacks" className="space-y-2 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">10. Chargebacks &amp; Payment Disputes</h2>
          <p>
            We encourage you to contact us directly at{" "}
            <a href="mailto:support@dunningdog.com" className="text-accent-700 hover:underline">
              support@dunningdog.com
            </a>{" "}
            before initiating a chargeback or payment dispute with your bank or card issuer.
            We are committed to resolving billing concerns quickly and fairly.
          </p>
          <p>
            If you initiate a chargeback without first contacting us:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              Your account may be <strong>immediately suspended</strong> pending resolution
              of the dispute
            </li>
            <li>
              Active dunning sequences will be paused, which may interrupt payment recovery
              for your business
            </li>
            <li>
              We will provide evidence to your card issuer demonstrating that the charge
              was authorized and the Service was provided
            </li>
            <li>
              If the chargeback is resolved in DunningDog&apos;s favor, you remain
              responsible for the original charge plus any chargeback fees incurred by us
            </li>
          </ul>
          <p>
            Repeated or fraudulent chargebacks may result in permanent account termination.
          </p>
        </section>

        {/* 11. Consumer Rights */}
        <section id="consumer-rights" className="space-y-2 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">11. Statutory Consumer Rights</h2>
          <p>
            DunningDog is a business-to-business (B2B) service designed for companies and
            business professionals. However, we acknowledge that certain jurisdictions
            provide mandatory consumer protection rights that cannot be waived by contract.
          </p>
          <p>
            If you are a consumer within the European Union or European Economic Area, you
            may have a statutory right of withdrawal for digital services under the{" "}
            <strong>Consumer Rights Directive (2011/83/EU)</strong>. By subscribing and
            accessing the Service immediately, you acknowledge that:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              The Service begins immediately upon subscription and payment
            </li>
            <li>
              You expressly consent to the Service being provided before the end of any
              applicable withdrawal period
            </li>
            <li>
              You acknowledge that you lose your right of withdrawal once the Service has
              been fully provided, or, for ongoing services, upon commencement of
              performance
            </li>
          </ul>
          <p>
            Notwithstanding the above, our 14-day initial purchase refund (Section 2)
            provides a voluntary right that exceeds the statutory minimum in most cases.
            Nothing in this policy limits or excludes any rights you may have under
            mandatory consumer protection laws in your jurisdiction that cannot be
            contractually waived.
          </p>
        </section>

        {/* 12. How to Request */}
        <section id="how-to-request" className="space-y-3 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">12. How to Request a Refund</h2>
          <p>
            To request a refund, email{" "}
            <a href="mailto:support@dunningdog.com" className="text-accent-700 hover:underline">
              support@dunningdog.com
            </a>{" "}
            with the following information:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Subject line:</strong> &quot;Refund Request&quot;
            </li>
            <li>
              The email address associated with your DunningDog account
            </li>
            <li>
              The Stripe invoice ID or charge ID (found in your billing email or Stripe
              dashboard)
            </li>
            <li>
              The date of the charge
            </li>
            <li>
              A brief explanation of the reason for your request
            </li>
          </ul>
          <p>
            Incomplete requests may delay processing. We aim to respond to all refund
            requests within <strong>5 business days</strong>.
          </p>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
            <p className="font-semibold text-amber-900">Important</p>
            <p className="mt-1 text-amber-800">
              Refund requests must be submitted within the applicable time windows
              described in this policy. Requests received after the deadline will not be
              processed. We recommend canceling your subscription promptly if you no longer
              wish to use the Service, rather than waiting and requesting a refund later.
            </p>
          </div>
        </section>

        {/* 13. Changes */}
        <section id="changes" className="space-y-2 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">13. Changes to This Policy</h2>
          <p>
            We may update this Refund Policy from time to time. When we make material
            changes:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>We will update the &quot;Last updated&quot; date at the top of this page</li>
            <li>
              We will notify active subscribers via email at least{" "}
              <strong>14 days</strong> before changes take effect
            </li>
            <li>
              Changes will not apply retroactively to charges made before the effective
              date
            </li>
          </ul>
          <p>
            Your continued use of DunningDog after the effective date constitutes
            acceptance of the updated Refund Policy.
          </p>
        </section>

        {/* 14. Contact */}
        <section id="contact" className="space-y-2 scroll-mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">14. Contact</h2>
          <p>
            If you have questions about this Refund Policy or your billing, contact us at:
          </p>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm">
            <p><strong>DunningDog — Billing Support</strong></p>
            <p>
              Email:{" "}
              <a
                href="mailto:support@dunningdog.com"
                className="text-accent-700 hover:underline"
              >
                support@dunningdog.com
              </a>
            </p>
          </div>
          <p>
            For general inquiries about your account, subscription, or the Service, please
            also refer to our{" "}
            <Link href="/policies/terms" className="text-accent-700 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/policies/privacy" className="text-accent-700 hover:underline">
              Privacy Policy
            </Link>.
          </p>
        </section>
      </div>
    </PolicyPageLayout>
  );
}
