import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata: Metadata = {
  title: "Failed Payment Revenue Calculator — How Much Are You Losing?",
  description:
    "Calculate how much revenue your SaaS loses to failed payments every month. See your potential recovery with DunningDog's automated dunning.",
  openGraph: {
    title: "Failed Payment Revenue Calculator | DunningDog",
    description:
      "Enter your MRR and see how much revenue you could recover with automated dunning.",
  },
};

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MarketingHeader variant="landing" />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
