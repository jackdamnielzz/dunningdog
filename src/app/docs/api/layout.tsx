import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { DocsSidebar } from "@/components/docs/docs-sidebar";

export const metadata: Metadata = {
  title: "API Documentation | DunningDog",
  description: "Complete API reference for the DunningDog REST API. Authenticate with API keys, manage recoveries, sequences, and workspace settings programmatically.",
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <MarketingHeader variant="minimal" />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-0 px-4 sm:px-6">
        <DocsSidebar />
        <main className="min-w-0 flex-1 py-8 lg:pl-8 lg:py-12">
          {children}
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
