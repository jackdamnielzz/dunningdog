import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/marketing/site-footer";
import { ContactForm } from "@/components/forms/contact-form";

export const metadata: Metadata = {
  title: "Contact — DunningDog",
  description: "Get in touch with the DunningDog team. We'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-zinc-50">
      <header className="border-b border-zinc-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight text-zinc-900">
            DunningDog
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
              Pricing
            </Link>
            <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-6 py-16">
        <div className="w-full max-w-lg space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Get in touch
            </h1>
            <p className="mt-2 text-zinc-600">
              Questions, feedback, or partnership inquiries — we&apos;d love to hear from you.
            </p>
          </div>

          <ContactForm />

          <div className="text-center text-sm text-zinc-500">
            <p>
              Or email us directly at{" "}
              <a
                href="mailto:info@dunningdog.com"
                className="font-medium text-emerald-600 hover:text-emerald-700"
              >
                info@dunningdog.com
              </a>
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
