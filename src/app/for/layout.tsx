import { MarketingHeader } from "@/components/marketing/marketing-header";
import { SiteFooter } from "@/components/marketing/site-footer";

export default function ForLayout({
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
