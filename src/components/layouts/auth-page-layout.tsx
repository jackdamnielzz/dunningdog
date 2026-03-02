import Link from "next/link";
import { SiteFooter } from "@/components/marketing/site-footer";

interface AuthPageLayoutProps {
  children: React.ReactNode;
}

export function AuthPageLayout({ children }: AuthPageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_15%_15%,#d9f5ee_0%,transparent_35%),radial-gradient(circle_at_85%_10%,#e2f4ff_0%,transparent_28%),linear-gradient(180deg,#f8fdfb_0%,#f6f8fb_100%)] px-4 pt-12 sm:px-6 sm:pt-16">
      <main className="mx-auto flex w-full max-w-[460px] flex-1 flex-col gap-6">
        <Link href="/" className="text-center text-2xl font-semibold tracking-tight text-zinc-900">
          DunningDog
        </Link>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
