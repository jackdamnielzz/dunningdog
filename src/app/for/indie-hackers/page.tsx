import type { Metadata } from "next";
import { UseCasePage } from "@/components/marketing/usecase-page";
import { USE_CASES } from "@/components/marketing/usecase-data";

const data = USE_CASES["indie-hackers"];

export const metadata: Metadata = {
  title: "Payment Recovery for Indie Hackers — Affordable Dunning for Bootstrapped SaaS",
  description:
    "Every dollar counts when you're bootstrapping. DunningDog recovers failed payments for just $49/mo with 5-minute setup and 10-30x typical ROI.",
  openGraph: {
    title: "Payment Recovery for Indie Hackers | DunningDog",
    description:
      "Affordable automated dunning for solo founders and small teams. $49/mo, 5-minute setup, 10-30x ROI.",
  },
};

export default function IndieHackersPage() {
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
