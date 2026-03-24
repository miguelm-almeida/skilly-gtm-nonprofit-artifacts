import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmtDollars(val: number | null): string {
  if (val === null) return "N/A";
  if (Math.abs(val) >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
  if (Math.abs(val) >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
  if (Math.abs(val) >= 1e3) return `$${(val / 1e3).toFixed(0)}K`;
  return `$${val.toLocaleString("en-US")}`;
}

export function fmtPct(val: number | null): string {
  if (val === null) return "N/A";
  return `${(val * 100).toFixed(1)}%`;
}

export function fmtRatio(val: number | null): string {
  if (val === null) return "N/A";
  return val.toFixed(1);
}
