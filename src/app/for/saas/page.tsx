import type { Metadata } from "next";
import { UseCasePage } from "@/components/marketing/usecase-page";
import { USE_CASES } from "@/components/marketing/usecase-data";

const data = USE_CASES["saas"];

export const metadata: Metadata = {
  title: "Payment Recovery for SaaS — Recover Failed Stripe Subscription Payments",
  description:
    "SaaS businesses lose 5-10% of MRR to failed payments. DunningDog recovers 50-70% with automated dunning sequences, pre-dunning alerts, and a real-time recovery dashboard.",
  openGraph: {
    title: "Payment Recovery for SaaS | DunningDog",
    description:
      "Stop losing MRR to failed subscription payments. Automated recovery for Stripe-based SaaS businesses.",
  },
};

export default function SaaSPage() {
  return (
    <>
      <UseCasePage data={data} />
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
