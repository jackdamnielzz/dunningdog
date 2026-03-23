import type { Metadata } from "next";
import { ComparisonPage } from "@/components/marketing/comparison-page";
import { COMPETITORS } from "@/components/marketing/compare-data";

const data = COMPETITORS["paddle-retain"];

export const metadata: Metadata = {
  title: `DunningDog vs ${data.name} — Best Paddle Retain Alternative for Stripe`,
  description: `Compare DunningDog and ${data.name} (formerly ProfitWell Retain) for payment recovery. Keep Stripe, skip the 5% take rate.`,
  openGraph: {
    title: `DunningDog vs ${data.name} | Feature & Pricing Comparison`,
    description: `${data.name} charges 5% of all revenue. DunningDog is a flat $49/mo with no take rate and works directly with Stripe.`,
  },
};

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Do I need to migrate away from Stripe to use Paddle Retain?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Paddle Retain is part of the Paddle billing platform, so you would need to migrate your entire payment stack away from Stripe. DunningDog works directly with Stripe, so you can start recovering failed payments without changing your billing infrastructure.",
      },
    },
    {
      "@type": "Question",
      name: "How much does Paddle Retain cost compared to DunningDog?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Paddle Retain charges a 5% take rate on all recovered revenue, which grows as your business scales. DunningDog uses flat monthly pricing starting at $49/mo with no percentage-based fees, making costs predictable regardless of your revenue.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use DunningDog with Stripe without switching to Paddle?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely. DunningDog is built specifically for Stripe and connects via Stripe Connect OAuth in minutes. There is no vendor lock-in and no need to change your existing billing setup.",
      },
    },
    {
      "@type": "Question",
      name: "What's the difference between ProfitWell Retain and Paddle Retain?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ProfitWell Retain was rebranded to Paddle Retain after Paddle acquired ProfitWell in 2022. The product is now tightly integrated into the Paddle ecosystem, which means it primarily serves businesses already using Paddle as their merchant of record.",
      },
    },
    {
      "@type": "Question",
      name: "Does DunningDog have smart retries like Paddle?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. DunningDog uses intelligent retry logic combined with customizable email sequences to maximize recovery rates. You get full control over retry timing and messaging while staying on Stripe, without handing over a percentage of your revenue.",
      },
    },
  ],
};

export default function PaddleRetainComparisonPage() {
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
