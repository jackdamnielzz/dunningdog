import type { Metadata } from "next";
import { SolutionPage } from "@/components/marketing/solution-page";
import { SOLUTIONS } from "@/components/marketing/solution-data";

const data = SOLUTIONS["dunning-automation"];

export const metadata: Metadata = {
  title: "Dunning Automation — Automated Dunning Email Sequences for Stripe",
  description:
    "Set up automated dunning email sequences in minutes. Customizable multi-step workflows with branded emails and secure payment update links.",
  openGraph: {
    title: "Dunning Automation | DunningDog",
    description:
      "Fully automated dunning sequences with custom timing, branding, and secure payment links. Setup in under 5 minutes.",
  },
};

export default function DunningAutomationPage() {
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
