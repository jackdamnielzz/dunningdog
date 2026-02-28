"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface DateRangePickerProps {
  onChange: (range: { startDate: string; endDate: string }) => void;
}

const presets = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "All time", days: 0 },
] as const;

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function DateRangePicker({ onChange }: DateRangePickerProps) {
  const today = formatDate(new Date());
  const thirtyDaysAgo = formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);
  const [activePreset, setActivePreset] = useState<number | null>(30);

  function applyPreset(days: number) {
    const end = formatDate(new Date());
    const start = days === 0
      ? "2020-01-01"
      : formatDate(new Date(Date.now() - days * 24 * 60 * 60 * 1000));
    setStartDate(start);
    setEndDate(end);
    setActivePreset(days);
    onChange({ startDate: start, endDate: end });
  }

  function handleCustomChange(newStart: string, newEnd: string) {
    setStartDate(newStart);
    setEndDate(newEnd);
    setActivePreset(null);
    onChange({ startDate: newStart, endDate: newEnd });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map((preset) => (
        <Button
          key={preset.days}
          type="button"
          variant={activePreset === preset.days ? "default" : "outline"}
          size="sm"
          onClick={() => applyPreset(preset.days)}
        >
          {preset.label}
        </Button>
      ))}
      <div className="flex items-center gap-1.5">
        <input
          type="date"
          value={startDate}
          onChange={(e) => handleCustomChange(e.target.value, endDate)}
          className="rounded-md border border-zinc-200 px-2 py-1 text-sm text-zinc-700"
        />
        <span className="text-sm text-zinc-400">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => handleCustomChange(startDate, e.target.value)}
          className="rounded-md border border-zinc-200 px-2 py-1 text-sm text-zinc-700"
        />
      </div>
    </div>
  );
}
