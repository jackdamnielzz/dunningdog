import type { Metadata } from "next";
import { UseCasePage } from "@/components/marketing/usecase-page";
import { USE_CASES } from "@/components/marketing/usecase-data";

const data = USE_CASES["membership-sites"];

export const metadata: Metadata = {
  title: "Payment Recovery for Membership Sites — Keep Members Active",
  description:
    "Members lose access when payments fail. DunningDog recovers 50-70% of failed payments with branded emails and pre-dunning alerts to keep members engaged.",
  openGraph: {
    title: "Payment Recovery for Membership Sites | DunningDog",
    description:
      "Keep members paying and accessing your content. Automated payment recovery for membership and community platforms.",
  },
};

export default function MembershipSitesPage() {
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
