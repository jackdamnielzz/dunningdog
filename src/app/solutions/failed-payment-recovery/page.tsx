import type { Metadata } from "next";
import { SolutionPage } from "@/components/marketing/solution-page";
import { SOLUTIONS } from "@/components/marketing/solution-data";

const data = SOLUTIONS["failed-payment-recovery"];

export const metadata: Metadata = {
  title: "Failed Payment Recovery — Automatically Recover Failed Stripe Payments",
  description:
    "Recover 50-70% of failed subscription payments automatically. DunningDog detects Stripe payment failures in real-time and runs branded recovery email sequences.",
  openGraph: {
    title: "Failed Payment Recovery | DunningDog",
    description:
      "Stop losing revenue to failed payments. Automated recovery sequences with 50-70% success rate for Stripe businesses.",
  },
};

export default function FailedPaymentRecoveryPage() {
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
