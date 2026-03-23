import type { Metadata } from "next";
import { ComparisonPage } from "@/components/marketing/comparison-page";
import { COMPETITORS } from "@/components/marketing/compare-data";

const data = COMPETITORS["stripe-smart-retries"];

export const metadata: Metadata = {
  title: `DunningDog vs ${data.name} — Why You Need More Than Retries`,
  description: `Stripe Smart Retries recover 15-25% of failed payments. Add DunningDog to reach 50-70% with dunning emails, pre-dunning alerts, and a recovery dashboard.`,
  openGraph: {
    title: `DunningDog vs ${data.name} | Boost Recovery Beyond Retries`,
    description: `Stripe Smart Retries alone recover ~15-25% of failures. DunningDog adds customer communication to reach 50-70% recovery rates.`,
  },
};

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Are Stripe Smart Retries enough to recover failed payments?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Stripe Smart Retries use machine learning to optimize retry timing and typically recover 15-25% of failed payments. However, many failures require customer action like updating an expired card, which retries alone cannot solve. Adding a communication layer like DunningDog can push recovery rates to 50-70%.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use DunningDog together with Stripe Smart Retries?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely — DunningDog is designed to work alongside Stripe Smart Retries, not replace them. Smart Retries handle the automatic retry logic behind the scenes, while DunningDog adds the customer communication layer with dunning emails and pre-dunning alerts. Together they cover both the technical and human sides of payment recovery.",
      },
    },
    {
      "@type": "Question",
      name: "How much more do I recover with DunningDog vs Smart Retries alone?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Businesses using only Stripe Smart Retries typically recover 15-25% of failed payments. By adding DunningDog's dunning email sequences and pre-dunning alerts, recovery rates increase to 50-70% — a 2-3x improvement. The exact lift depends on your customer base and failure reasons.",
      },
    },
    {
      "@type": "Question",
      name: "Does DunningDog replace Stripe's built-in retry logic?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No, DunningDog complements Stripe's retry logic rather than replacing it. You should keep Smart Retries enabled so Stripe handles the automatic payment retry scheduling. DunningDog focuses on what Stripe doesn't do: notifying customers about failed payments, guiding them to update their payment method, and alerting them before cards expire.",
      },
    },
    {
      "@type": "Question",
      name: "What does DunningDog add that Stripe doesn't have?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "DunningDog adds branded dunning email sequences, pre-dunning alerts before cards expire, a real-time recovery dashboard with metrics, and customizable recovery workflows. Stripe focuses on the payment infrastructure and retry timing, while DunningDog handles the customer-facing communication that drives action on failures requiring human intervention.",
      },
    },
  ],
};

export default function StripeSmartRetriesComparisonPage() {
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
