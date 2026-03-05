import {
  CheckCircle2,
  BarChart3,
  RefreshCw,
  TrendingUp,
  Clock,
} from "lucide-react";
import { HERO_RECOVERIES } from "@/components/marketing/landing-data";

const DASHBOARD_STATS = [
  { label: "Recovery rate", value: "68%", icon: BarChart3 },
  { label: "Active recoveries", value: "24", icon: RefreshCw },
  { label: "Avg. recovery time", value: "1.8d", icon: Clock },
] as const;

export function DashboardPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-2xl shadow-zinc-300/30">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50/80 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-300" />
          <span className="h-3 w-3 rounded-full bg-amber-300" />
          <span className="h-3 w-3 rounded-full bg-green-300" />
        </div>
        <div className="mx-auto rounded-md bg-white/80 px-4 py-1 text-xs text-zinc-400 border border-zinc-200/50">
          app.dunningdog.com/dashboard
        </div>
      </div>

      {/* Dashboard content */}
      <div className="p-5 sm:p-7">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              This month&apos;s recovery
            </p>
            <p className="text-3xl font-extrabold text-accent-700 tabular-nums sm:text-4xl">
              $4,128
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-100">
            <TrendingUp className="h-6 w-6 text-accent-600" />
          </div>
        </div>

        {/* Recovery progress bar */}
        <div className="mb-5 rounded-xl bg-zinc-50 p-4">
          <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
            <span>Recovery progress</span>
            <span className="font-bold text-accent-700">68% recovered</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-zinc-200">
            <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-accent-500 to-accent-600 shadow-sm shadow-accent-500/30" />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          {DASHBOARD_STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl bg-zinc-50 p-3 text-center"
            >
              <stat.icon className="mx-auto mb-1 h-4 w-4 text-zinc-400" />
              <p className="text-lg font-bold text-zinc-900 tabular-nums sm:text-xl">{stat.value}</p>
              <p className="text-[11px] text-zinc-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Recent recovery timeline */}
        <div className="mt-5 space-y-2.5 border-t border-zinc-100 pt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Recent recoveries
          </p>
          {HERO_RECOVERIES.map((r) => (
            <div
              key={r.customer}
              className="flex items-center justify-between rounded-lg bg-accent-50/50 px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent-500" />
                <span className="text-zinc-600">{r.customer}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-accent-700 tabular-nums">{r.amount}</span>
                <span className="text-[11px] text-zinc-400">{r.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
