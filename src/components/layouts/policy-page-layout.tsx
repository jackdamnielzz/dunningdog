import { SiteFooter } from "@/components/marketing/site-footer";

interface PolicyPageLayoutProps {
  children: React.ReactNode;
}

export function PolicyPageLayout({ children }: PolicyPageLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto max-w-4xl px-6 py-14">
        <article className="rounded-xl border border-zinc-200 bg-white p-8 sm:p-12">
          {children}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
