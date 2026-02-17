import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { currencyFromCents } from "@/lib/utils";

interface SummaryCardsProps {
  failedRevenueCents: number;
  recoveredRevenueCents: number;
  recoveryRate: number;
  atRiskCount: number;
  activeSequences: number;
}

export function SummaryCards(props: SummaryCardsProps) {
  const cards = [
    {
      title: "Failed Revenue",
      value: currencyFromCents(props.failedRevenueCents),
      description: "Revenue currently exposed to involuntary churn.",
    },
    {
      title: "Recovered Revenue",
      value: currencyFromCents(props.recoveredRevenueCents),
      description: "Revenue recovered by automated dunning.",
    },
    {
      title: "Recovery Rate",
      value: `${props.recoveryRate.toFixed(2)}%`,
      description: "Golden metric for DunningDog performance.",
    },
    {
      title: "Subscriptions At Risk",
      value: props.atRiskCount.toString(),
      description: `${props.activeSequences} active sequence(s) currently running.`,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader>
            <CardTitle>{card.title}</CardTitle>
            <CardDescription>{card.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-zinc-900">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
