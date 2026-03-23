import type { Metadata } from "next";
import { ComparisonPage } from "@/components/marketing/comparison-page";
import { COMPETITORS } from "@/components/marketing/compare-data";

const data = COMPETITORS["churnkey"];

export const metadata: Metadata = {
  title: `DunningDog vs ${data.name} — Best Churnkey Alternative`,
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
      name: "Is DunningDog a good alternative to Churnkey?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — DunningDog is the top-rated Churnkey alternative for SaaS teams that need focused payment recovery without enterprise complexity. It starts at $49/mo (80% cheaper than Churnkey) and includes pre-dunning card expiry alerts that Churnkey doesn't offer. You can be up and running in under 5 minutes with one-click Stripe setup.",
      },
    },
    {
      "@type": "Question",
      name: "How much does Churnkey cost vs DunningDog?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Churnkey starts at $250/mo and goes up to $990+/mo, while DunningDog starts at just $49/mo with annual plans as low as $41/mo. Both charge flat-rate pricing with no take rate on recovered revenue, but DunningDog is 5x more affordable at the entry level. DunningDog also offers a free 7-day trial with no credit card required.",
      },
    },
    {
      "@type": "Question",
      name: "Does DunningDog have the same features as Churnkey?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "DunningDog covers all core payment recovery features including automated dunning emails, smart retry logic, custom sequences, and a real-time dashboard. Churnkey adds cancel flow surveys and reactivation campaigns, but DunningDog uniquely offers pre-dunning card expiry alerts that proactively prevent failures before they happen. For most SaaS teams, DunningDog's focused approach recovers more revenue at a fraction of the cost.",
      },
    },
    {
      "@type": "Question",
      name: "Can I switch from Churnkey to DunningDog?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely. DunningDog connects to your Stripe account in one click via OAuth and starts monitoring payments immediately — no migration or data import needed. You can start a free 7-day trial alongside Churnkey, verify recovery performance, and switch over with zero downtime.",
      },
    },
    {
      "@type": "Question",
      name: "Does DunningDog work with Stripe like Churnkey?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, DunningDog is built specifically for Stripe-based businesses with a deep native integration via Stripe Connect OAuth. Setup takes under 5 minutes — just authorize DunningDog and it automatically detects failed payments, sends recovery emails, and tracks results. Unlike Churnkey, DunningDog also leverages Stripe's native smart retry logic alongside its own recovery sequences.",
      },
    },
  ],
};

export default function ChurnkeyComparisonPage() {
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
