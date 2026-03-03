import { SiteFooter } from "@/components/marketing/site-footer";

interface PolicyPageLayoutProps {
  children: React.ReactNode;
}

export function PolicyPageLayout({ children }: PolicyPageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <main className="mx-auto flex-1 max-w-4xl px-4 py-8 sm:px-6 sm:py-14">
        <article className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-8 lg:p-12">
          {children}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
