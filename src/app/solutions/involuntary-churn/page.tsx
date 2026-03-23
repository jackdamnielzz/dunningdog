import type { Metadata } from "next";
import { SolutionPage } from "@/components/marketing/solution-page";
import { SOLUTIONS } from "@/components/marketing/solution-data";

const data = SOLUTIONS["involuntary-churn"];

export const metadata: Metadata = {
  title: "Reduce Involuntary Churn — Stop Losing Subscribers to Failed Payments",
  description:
    "20-40% of SaaS churn is involuntary. DunningDog prevents and recovers failed payments with pre-dunning alerts and automated email sequences.",
  openGraph: {
    title: "Reduce Involuntary Churn | DunningDog",
    description:
      "Involuntary churn costs SaaS companies thousands per month. DunningDog's pre-dunning and recovery automation keeps subscribers active.",
  },
};

export default function InvoluntaryChurnPage() {
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
