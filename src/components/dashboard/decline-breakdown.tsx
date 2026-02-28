interface DeclineBreakdownProps {
  soft: { count: number; amountCents: number };
  hard: { count: number; amountCents: number };
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function DeclineBreakdown({ soft, hard }: DeclineBreakdownProps) {
  const total = soft.count + hard.count;
  const softPct = total > 0 ? Math.round((soft.count / total) * 100) : 0;
  const hardPct = total > 0 ? 100 - softPct : 0;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-zinc-700">Decline breakdown</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-600">Soft declines</p>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
              {softPct}%
            </span>
          </div>
          <p className="mt-1 text-2xl font-bold text-zinc-900">{soft.count}</p>
          <p className="text-xs text-zinc-500">{formatCents(soft.amountCents)} at risk</p>
          {/* Bar */}
          <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-100">
            <div
              className="h-1.5 rounded-full bg-amber-400"
              style={{ width: `${softPct}%` }}
            />
          </div>
        </div>
        <div className="rounded-lg border border-zinc-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-600">Hard declines</p>
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
              {hardPct}%
            </span>
          </div>
          <p className="mt-1 text-2xl font-bold text-zinc-900">{hard.count}</p>
          <p className="text-xs text-zinc-500">{formatCents(hard.amountCents)} at risk</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-100">
            <div
              className="h-1.5 rounded-full bg-red-400"
              style={{ width: `${hardPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
