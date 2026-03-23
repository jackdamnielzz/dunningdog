import type { Metadata } from "next";
import { UseCasePage } from "@/components/marketing/usecase-page";
import { USE_CASES } from "@/components/marketing/usecase-data";

const data = USE_CASES["subscription-boxes"];

export const metadata: Metadata = {
  title: "Payment Recovery for Subscription Boxes — Keep Subscribers Active",
  description:
    "Failed payments disrupt fulfillment and lose subscribers. DunningDog recovers payments before shipment deadlines with automated dunning and pre-dunning alerts.",
  openGraph: {
    title: "Payment Recovery for Subscription Boxes | DunningDog",
    description:
      "Recover failed payments before they disrupt fulfillment. Automated dunning for subscription box businesses.",
  },
};

export default function SubscriptionBoxesPage() {
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
