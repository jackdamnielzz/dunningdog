import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,#d9f5ee_0%,transparent_30%),radial-gradient(circle_at_90%_10%,#e2f4ff_0%,transparent_25%),linear-gradient(180deg,#f8fdfb_0%,#f6f8fb_100%)]">
      <main className="mx-auto max-w-6xl px-6 py-14">
        <header className="mb-16 flex items-center justify-between">
          <Link href="/" className="text-3xl font-semibold tracking-tight text-zinc-900">
            DunningDog
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/pricing"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
            >
              Pricing
            </Link>
            <Link href="/app">
              <Button size="sm">Open app</Button>
            </Link>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Revenue recovery for Stripe subscriptions
            </p>
            <h1 className="max-w-2xl text-5xl font-semibold leading-tight tracking-tight text-zinc-900">
              Recover failed payments before they become churn.
            </h1>
            <p className="max-w-xl text-lg text-zinc-600">
              DunningDog helps indie SaaS teams and creators automate
              pre-dunning, run smart retry sequences, and track every recovered
              dollar from one dashboard.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/app">
                <Button className="gap-2">
                  Launch Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button variant="outline">Read Product Docs</Button>
              </Link>
            </div>
          </div>
          <Card className="border-emerald-200 bg-white/90">
            <CardHeader>
              <CardTitle>This month</CardTitle>
              <CardDescription>Example ROI snapshot</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-emerald-50 p-4">
                <p className="text-sm text-zinc-600">Recovered revenue</p>
                <p className="text-3xl font-semibold text-emerald-700">
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
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
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
    </div>
  );
}
