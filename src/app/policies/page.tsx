import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { policyLinks } from "@/components/marketing/policy-links";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata: Metadata = {
  title: "Policies | DunningDog",
  description: "Legal and billing policies for using DunningDog.",
};

export default function PoliciesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <main className="mx-auto flex-1 max-w-5xl px-6 py-14">
        <div className="space-y-3">
          <p className="text-sm font-medium text-accent-700">Legal</p>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">Policy Center</h1>
          <p className="max-w-2xl text-zinc-600">
            Review the official policies that govern data handling, account usage,
            billing, and refunds for DunningDog.
          </p>
        </div>

        <div className="mt-8 grid gap-4">
          {policyLinks.map((policy) => (
            <Card key={policy.href}>
              <CardHeader>
                <CardTitle>{policy.label}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4">
                <p className="text-sm text-zinc-600">{policy.description}</p>
                <Link
                  href={policy.href}
                  className="text-sm font-medium text-accent-700 hover:text-accent-600"
                >
                  Read
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
