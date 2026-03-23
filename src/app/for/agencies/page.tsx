import type { Metadata } from "next";
import { UseCasePage } from "@/components/marketing/usecase-page";
import { USE_CASES } from "@/components/marketing/usecase-data";

const data = USE_CASES["agencies"];

export const metadata: Metadata = {
  title: "Payment Recovery for Agencies — Protect Retainer Revenue Automatically",
  description:
    "Failed retainer payments create awkward client conversations. DunningDog automates recovery with branded emails and alerts so you never chase clients manually.",
  openGraph: {
    title: "Payment Recovery for Agencies | DunningDog",
    description:
      "Protect recurring retainer revenue across all clients. Automated, branded payment recovery for agencies.",
  },
};

export default function AgenciesPage() {
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
