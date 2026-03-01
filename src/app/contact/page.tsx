import type { Metadata } from "next";
import { SiteFooter } from "@/components/marketing/site-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { ContactForm } from "@/components/forms/contact-form";

export const metadata: Metadata = {
  title: "Contact — DunningDog",
  description: "Get in touch with the DunningDog team. We'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-zinc-50">
      <MarketingHeader variant="minimal" />

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
                className="font-medium text-accent-600 hover:text-accent-700"
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
