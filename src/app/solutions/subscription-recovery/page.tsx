import type { Metadata } from "next";
import { SolutionPage } from "@/components/marketing/solution-page";
import { SOLUTIONS } from "@/components/marketing/solution-data";

const data = SOLUTIONS["subscription-recovery"];

export const metadata: Metadata = {
  title: "Subscription Revenue Recovery — Recover Thousands in Lost MRR",
  description:
    "SaaS businesses lose 5-10% of MRR to failed payments monthly. DunningDog recovers 50-70% with automated sequences and measurable ROI tracking.",
  openGraph: {
    title: "Subscription Revenue Recovery | DunningDog",
    description:
      "Turn failed subscription payments into recovered revenue. 10-30x typical ROI with flat-rate pricing.",
  },
};

export default function SubscriptionRecoveryPage() {
  return (
    <>
      <SolutionPage data={data} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: data.faqs.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: { "@type": "Answer", text: faq.a },
            })),
          }),
        }}
      />
    </>
  );
}
