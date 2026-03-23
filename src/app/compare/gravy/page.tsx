import type { Metadata } from "next";
import { ComparisonPage } from "@/components/marketing/comparison-page";
import { COMPETITORS } from "@/components/marketing/compare-data";

const data = COMPETITORS["gravy"];

export const metadata: Metadata = {
  title: `DunningDog vs ${data.name} — Automated Alternative to Gravy Solutions`,
  description: `Compare DunningDog's automated payment recovery to ${data.name}'s human-agent service. Instant setup, 24/7 automation, flat pricing from $49/mo.`,
  openGraph: {
    title: `DunningDog vs ${data.name} | Automated vs Human Recovery`,
    description: `${data.name} uses human agents with enterprise pricing. DunningDog automates recovery 24/7 starting at $49/mo.`,
  },
};

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What's the difference between DunningDog and Gravy Solutions?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Gravy Solutions relies on human recovery agents who manually reach out to customers during business hours. DunningDog uses fully automated email sequences that run 24/7, detecting failed payments instantly and recovering revenue without any manual intervention.",
      },
    },
    {
      "@type": "Question",
      name: "Is automated dunning better than human recovery agents?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Automated dunning responds to failed payments instantly, any time of day, with no delays or missed cases. Human agents can only work during business hours and handle a limited number of cases. For most SaaS businesses, automation delivers faster, more consistent recovery at a fraction of the cost.",
      },
    },
    {
      "@type": "Question",
      name: "How much does Gravy Solutions cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Gravy Solutions uses custom enterprise pricing that typically involves a percentage of recovered revenue, making costs unpredictable as you scale. DunningDog offers transparent flat-rate pricing starting at $49/mo with no hidden fees or revenue-share cuts.",
      },
    },
    {
      "@type": "Question",
      name: "Can DunningDog replace Gravy for payment recovery?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. DunningDog connects to your Stripe account in minutes and automatically handles failed payment recovery with customizable email sequences. Many businesses switching from human-agent services see comparable or better recovery rates at significantly lower cost.",
      },
    },
    {
      "@type": "Question",
      name: "Does DunningDog work 24/7 unlike human agents?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. DunningDog monitors your Stripe account around the clock and triggers recovery emails the moment a payment fails. There are no business hours, no weekends off, and no holidays — every failed payment is handled instantly, maximizing your chances of recovery.",
      },
    },
  ],
};

export default function GravyComparisonPage() {
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
