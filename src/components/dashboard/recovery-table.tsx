import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { currencyFromCents } from "@/lib/utils";

interface RecoveryItem {
  attempt: {
    id: string;
    stripeInvoiceId: string;
    stripeCustomerId: string;
    declineType: "soft" | "hard";
    status: "pending" | "recovered" | "failed" | "abandoned";
    amountDueCents: number;
    recoveredAmountCents: number | null;
    startedAt: string;
    endedAt: string | null;
  };
}

interface RecoveryTableProps {
  items: RecoveryItem[];
  title?: string;
}

function statusVariant(status: RecoveryItem["attempt"]["status"]) {
  if (status === "recovered") return "success";
  if (status === "pending") return "warning";
  if (status === "failed") return "danger";
  return "neutral";
}

export function RecoveryTable({ items, title = "Recent Recoveries" }: RecoveryTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead>
              <tr className="text-left text-zinc-600">
                <th className="px-2 py-3 font-medium">Invoice</th>
                <th className="px-2 py-3 font-medium">Customer</th>
                <th className="px-2 py-3 font-medium">Decline</th>
                <th className="px-2 py-3 font-medium">Status</th>
                <th className="px-2 py-3 font-medium">Amount Due</th>
                <th className="px-2 py-3 font-medium">Recovered</th>
                <th className="px-2 py-3 font-medium">Started</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {items.map((item) => (
                <tr key={item.attempt.id}>
                  <td className="px-2 py-3 font-mono text-xs text-zinc-700">
                    {item.attempt.stripeInvoiceId}
                  </td>
                  <td className="px-2 py-3 font-mono text-xs text-zinc-700">
                    {item.attempt.stripeCustomerId}
                  </td>
                  <td className="px-2 py-3 capitalize text-zinc-700">
                    {item.attempt.declineType}
                  </td>
                  <td className="px-2 py-3">
                    <Badge variant={statusVariant(item.attempt.status)}>
                      {item.attempt.status}
                    </Badge>
                  </td>
                  <td className="px-2 py-3 text-zinc-800">
                    {currencyFromCents(item.attempt.amountDueCents)}
                  </td>
                  <td className="px-2 py-3 text-zinc-800">
                    {currencyFromCents(item.attempt.recoveredAmountCents ?? 0)}
                  </td>
                  <td className="px-2 py-3 text-zinc-600">
                    {new Date(item.attempt.startedAt).toLocaleDateString("en-US")}
                  </td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-2 py-6 text-center text-zinc-500">
                    No recovery attempts found yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
