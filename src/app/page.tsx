import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/marketing/site-footer";
import { getAuthenticatedUserIdFromHeaders } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function Home() {
  const requestHeaders = await headers();
  const userId = await getAuthenticatedUserIdFromHeaders(requestHeaders);
  if (userId) {
    redirect("/app");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_20%_20%,#d9f5ee_0%,transparent_30%),radial-gradient(circle_at_90%_10%,#e2f4ff_0%,transparent_25%),linear-gradient(180deg,#f8fdfb_0%,#f6f8fb_100%)]">
      <main className="mx-auto max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-14">
        <header className="mb-10 flex items-center justify-between sm:mb-16">
          <Link href="/" className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            DunningDog
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/pricing"
              className="hidden text-sm font-medium text-zinc-600 hover:text-zinc-900 sm:inline"
            >
              Pricing
            </Link>
            <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
              Sign in
            </Link>
            <Link href="/register">
              <Button size="sm">Try for Free</Button>
            </Link>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold text-accent-700">
              Revenue recovery for Stripe subscriptions
            </p>
            <h1 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
              Recover failed payments before they become churn.
            </h1>
            <p className="max-w-xl text-lg text-zinc-600">
              DunningDog helps indie SaaS teams and creators automate
              pre-dunning, run smart retry sequences, and track every recovered
              dollar from one dashboard.
            </p>
            <Link href="/register">
              <Button className="gap-2">
                Try for Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <p className="text-sm text-zinc-500">7-day free trial — no credit card required</p>
          </div>
          <Card className="border-accent-200 bg-white/90">
            <CardHeader>
              <CardTitle>This month</CardTitle>
              <CardDescription>Example ROI snapshot</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-accent-50 p-4">
                <p className="text-sm text-zinc-600">Recovered revenue</p>
                <p className="text-3xl font-semibold text-accent-700">
                  $412.00
                </p>
              </div>
              <ul className="space-y-2 text-sm text-zinc-700">
                {[
                  "65.4% failed-payment recovery rate",
                  "4 active recovery attempts",
                  "11 subscriptions flagged before failure",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <section className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Connect in minutes",
              body: "OAuth with Stripe and enable your first sequence in one setup flow.",
            },
            {
              title: "Automate recovery",
              body: "Pre-dunning alerts and scheduled follow-ups run without manual chasing.",
            },
            {
              title: "Prove ROI weekly",
              body: "Track failed revenue, recovered revenue, and recovery rate in one place.",
            },
          ].map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-600">{feature.body}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
