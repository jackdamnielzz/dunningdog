import type { Metadata } from "next";
import { ComparisonPage } from "@/components/marketing/comparison-page";
import { COMPETITORS } from "@/components/marketing/compare-data";

const data = COMPETITORS["baremetrics-recover"];

export const metadata: Metadata = {
  title: `DunningDog vs ${data.name} — Best Baremetrics Recover Alternative`,
  description: `Compare DunningDog and ${data.name} for automated payment recovery. See features, pricing, and why SaaS teams choose DunningDog over Baremetrics Recover.`,
  openGraph: {
    title: `DunningDog vs ${data.name} | Feature & Pricing Comparison`,
    description: `Side-by-side comparison of DunningDog and ${data.name}. Baremetrics Recover requires a Baremetrics subscription, DunningDog is standalone from $49/mo.`,
  },
};

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Do I need a Baremetrics subscription to use their Recover feature?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Baremetrics Recover is only available as an add-on to a Baremetrics analytics subscription. You cannot use Recover standalone, which means you pay for both analytics and recovery tooling. DunningDog is a standalone product that works directly with your Stripe account.",
      },
    },
    {
      "@type": "Question",
      name: "Is DunningDog cheaper than Baremetrics Recover?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In most cases, yes. DunningDog starts at $49/mo with no additional subscriptions required. Baremetrics Recover requires a Baremetrics plan (starting at $108/mo) plus the Recover add-on, making the total cost significantly higher for most teams.",
      },
    },
    {
      "@type": "Question",
      name: "What does DunningDog offer that Baremetrics Recover doesn't?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "DunningDog offers pre-dunning alerts that notify customers before a payment fails, fully customizable multi-step email sequences, and branded recovery pages. It also works as a standalone tool without requiring any analytics subscription.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use DunningDog without any other analytics tool?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely. DunningDog is a standalone payment recovery platform that connects directly to your Stripe account. You do not need Baremetrics, ProfitWell, or any other analytics tool to use it. Just connect Stripe and start recovering failed payments.",
      },
    },
    {
      "@type": "Question",
      name: "Does DunningDog have pre-dunning alerts?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. DunningDog can detect at-risk payments before they fail and send pre-dunning alerts to customers, prompting them to update their payment method. This proactive approach helps prevent involuntary churn before it happens, which is not a standard feature in Baremetrics Recover.",
      },
    },
  ],
};

export default function BaremetricsRecoverComparisonPage() {
  return (
    <>
      <ComparisonPage data={data} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
    </>
  );
}
