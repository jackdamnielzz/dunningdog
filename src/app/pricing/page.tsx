import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "Starter",
    price: "$29/mo",
    cap: "Up to $5k MRR tracked",
    features: ["Pre-dunning alerts", "3-step sequence", "Basic dashboard"],
  },
  {
    name: "Pro",
    price: "$49/mo",
    cap: "Up to $20k MRR tracked",
    features: ["5-step customizable sequence", "Custom branding", "Slack/Discord alerts"],
  },
  {
    name: "Growth",
    price: "$79/mo",
    cap: "Up to $50k MRR tracked",
    features: ["Unlimited sequence steps", "White-label update page", "Advanced exports"],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-14">
      <main className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-semibold text-zinc-900">Pricing</h1>
        <p className="mt-3 max-w-xl text-zinc-600">
          Simple plans designed for Stripe-first indie teams. Start with a fixed monthly
          subscription and scale when your MRR grows.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {tiers.map((tier) => (
            <Card key={tier.name}>
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-3xl font-semibold text-zinc-900">{tier.price}</p>
                  <p className="text-sm text-zinc-600">{tier.cap}</p>
                </div>
                <ul className="space-y-2 text-sm text-zinc-700">
                  {tier.features.map((feature) => (
                    <li key={feature}>• {feature}</li>
                  ))}
                </ul>
                <Link href="/app">
                  <Button className="w-full">Choose {tier.name}</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
