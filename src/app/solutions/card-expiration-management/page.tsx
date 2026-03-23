import type { Metadata } from "next";
import { SolutionPage } from "@/components/marketing/solution-page";
import { SOLUTIONS } from "@/components/marketing/solution-data";

const data = SOLUTIONS["card-expiration-management"];

export const metadata: Metadata = {
  title: "Card Expiration Management — Catch Expiring Cards Before Payments Fail",
  description:
    "Expired cards are the #1 cause of failed payments. DunningDog detects expiring cards 14 days in advance and proactively notifies customers to update.",
  openGraph: {
    title: "Card Expiration Management | DunningDog",
    description:
      "Proactive card expiry detection and customer alerts. Prevent payment failures from expired credit cards.",
  },
};

export default function CardExpirationManagementPage() {
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
