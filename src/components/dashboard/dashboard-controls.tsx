"use client";

import { useState } from "react";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { ExportButton } from "@/components/dashboard/export-button";

export function DashboardControls() {
  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [range, setRange] = useState({ startDate: thirtyDaysAgo, endDate: today });

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <DateRangePicker onChange={setRange} />
      <ExportButton startDate={range.startDate} endDate={range.endDate} />
    </div>
  );
}
