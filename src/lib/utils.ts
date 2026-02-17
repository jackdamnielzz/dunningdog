import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function currencyFromCents(
  cents: number,
  currency: string = "USD",
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function toIsoDate(date: Date): string {
  return date.toISOString();
}

export function parseWindow(window?: string): "7d" | "30d" | "90d" | "month" | "lifetime" {
  if (window === "7d" || window === "30d" || window === "90d" || window === "lifetime") {
    return window;
  }
  return "month";
}
