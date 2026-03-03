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
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-500">
            No recovery attempts found yet.
          </p>
        ) : (
          <>
            {/* Mobile: card layout */}
            <div className="space-y-3 md:hidden">
              {items.map((item) => (
                <div
                  key={item.attempt.id}
                  className="rounded-lg border border-zinc-200 p-3"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant={statusVariant(item.attempt.status)}>
                      {item.attempt.status}
                    </Badge>
                    <span className="text-sm font-medium text-zinc-800">
                      {currencyFromCents(item.attempt.amountDueCents)}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-zinc-600">
                    <span>Customer</span>
                    <span className="truncate font-mono text-zinc-700">{item.attempt.stripeCustomerId}</span>
                    <span>Decline</span>
                    <span className="capitalize text-zinc-700">{item.attempt.declineType}</span>
                    <span>Recovered</span>
                    <span className="text-zinc-700">{currencyFromCents(item.attempt.recoveredAmountCents ?? 0)}</span>
                    <span>Started</span>
                    <span className="text-zinc-700">{new Date(item.attempt.startedAt).toLocaleDateString("en-US")}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: table layout */}
            <div className="hidden overflow-x-auto md:block">
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
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
