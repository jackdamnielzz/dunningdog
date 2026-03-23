import type { Metadata } from "next";
import { ComparisonPage } from "@/components/marketing/comparison-page";
import { COMPETITORS } from "@/components/marketing/compare-data";

const data = COMPETITORS["churn-buster"];

export const metadata: Metadata = {
  title: `DunningDog vs ${data.name} — Best Churn Buster Alternative`,
  description: `Compare DunningDog and ${data.name} for automated payment recovery. See features, pricing, and why SaaS teams choose DunningDog as a ${data.name} alternative.`,
  openGraph: {
    title: `DunningDog vs ${data.name} | Feature & Pricing Comparison`,
    description: `Side-by-side comparison of DunningDog and ${data.name}. ${data.name} starts at ${data.priceRange}, DunningDog starts at $49/mo with a free trial.`,
  },
};

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is DunningDog a good alternative to Churn Buster?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, DunningDog is an excellent Churn Buster alternative, especially for indie founders and growing SaaS teams. It offers automated dunning emails, pre-dunning card expiry alerts, and a real-time recovery dashboard at a fraction of the cost, starting at just $49/mo compared to Churn Buster's $249+/mo.",
      },
    },
    {
      "@type": "Question",
      name: "How much cheaper is DunningDog than Churn Buster?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "DunningDog starts at $49/mo while Churn Buster starts at $249+/mo, making DunningDog roughly 80% cheaper. DunningDog also offers a free 7-day trial with no credit card required, whereas Churn Buster does not offer a free trial.",
      },
    },
    {
      "@type": "Question",
      name: "Does DunningDog offer the same recovery features as Churn Buster?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "DunningDog covers all core dunning features including automated email sequences, smart retry logic via Stripe, custom branding, and a recovery dashboard. DunningDog also offers features Churn Buster lacks, such as pre-dunning card expiry alerts, Slack/Discord notifications, REST API access, and CSV exports.",
      },
    },
    {
      "@type": "Question",
      name: "Can I migrate from Churn Buster to DunningDog?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Migrating from Churn Buster to DunningDog is straightforward. DunningDog connects to your Stripe account via one-click OAuth and can be set up in under 5 minutes. Simply disconnect Churn Buster from your Stripe account and connect DunningDog to start recovering failed payments immediately.",
      },
    },
    {
      "@type": "Question",
      name: "Does DunningDog have pre-dunning like Churn Buster?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "DunningDog offers pre-dunning card expiry alerts, which Churn Buster does not. Pre-dunning proactively detects expiring credit cards and notifies customers before a payment fails, preventing involuntary churn before it even starts.",
      },
    },
  ],
};

export default function ChurnBusterComparisonPage() {
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
