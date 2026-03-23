import type { Metadata } from "next";
import { SolutionPage } from "@/components/marketing/solution-page";
import { SOLUTIONS } from "@/components/marketing/solution-data";

const data = SOLUTIONS["pre-dunning"];

export const metadata: Metadata = {
  title: "Pre-Dunning Alerts — Prevent Payment Failures Before They Happen",
  description:
    "The best recovery is prevention. DunningDog identifies expiring cards 14 days in advance and proactively contacts customers before their payment fails.",
  openGraph: {
    title: "Pre-Dunning Alerts | DunningDog",
    description:
      "Proactive payment failure prevention. Detect expiring cards and alert customers before the charge fails.",
  },
};

export default function PreDunningPage() {
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
