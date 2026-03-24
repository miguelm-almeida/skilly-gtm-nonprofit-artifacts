"use client";

import { useState, useMemo } from "react";
import { ArrowLeft, ArrowUpDown, CircleHelp, MapPin, Printer } from "lucide-react";
import { cn, fmtDollars, fmtPct } from "@/lib/utils";
import { OrgDetail } from "./org-detail";
import type { CategoryBenchmark, OrgBenchmark } from "@/lib/types";

type SortKey = "rank" | "name" | "revenue" | "expenses" | "assets" | "programRatio" | "adminRatio" | "debtRatio" | "contribPct";
type SortDir = "asc" | "desc";
const EXAMPLE_BASE_DOLLARS = 4990;

function fmtExampleDollars(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function ratioColor(val: number | null, good: number, warn: number, higherBetter = true): string {
  if (val === null) return "text-[#9A999D]";
  if (higherBetter) {
    if (val >= good) return "text-emerald-600 font-semibold";
    if (val >= warn) return "text-amber-600 font-semibold";
    return "text-red-500 font-semibold";
  }
  if (val <= good) return "text-emerald-600 font-semibold";
  if (val <= warn) return "text-amber-600 font-semibold";
  return "text-red-500 font-semibold";
}

function getSortValue(org: OrgBenchmark, key: SortKey, index: number): number | string {
  switch (key) {
    case "rank": return index;
    case "name": return org.profile.name.toLowerCase();
    case "revenue": return org.latestRevenue;
    case "expenses": return org.latestExpenses;
    case "assets": return org.latestAssets;
    case "programRatio": return org.ratios[0]?.programExpenseRatio ?? -1;
    case "adminRatio": return org.ratios[0]?.administrativeRatio ?? 999;
    case "debtRatio": return org.ratios[0]?.liabilitiesToAssets ?? 999;
    case "contribPct": return org.ratios[0]?.contributionPct ?? -1;
  }
}

interface BenchmarkViewProps {
  benchmark: CategoryBenchmark;
  onBack: () => void;
}

export function BenchmarkView({ benchmark, onBack }: BenchmarkViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const hasCharityNavigatorRatios = benchmark.orgs.some(
    (org) => org.ratios[0]?.programExpenseRatio !== null || org.ratios[0]?.administrativeRatio !== null,
  );

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  }

  const sortedOrgs = useMemo(() => {
    const indexed = benchmark.orgs.map((org, i) => ({ org, originalIndex: i }));
    indexed.sort((a, b) => {
      const aVal = getSortValue(a.org, sortKey, a.originalIndex);
      const bVal = getSortValue(b.org, sortKey, b.originalIndex);
      const cmp = typeof aVal === "string" && typeof bVal === "string"
        ? aVal.localeCompare(bVal)
        : (aVal as number) - (bVal as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return indexed;
  }, [benchmark.orgs, sortKey, sortDir]);

  const dateStr = new Date(benchmark.generatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const sourceLabel = hasCharityNavigatorRatios
    ? "Generated from IRS Form 990 financial data with benchmark ratios for program and administrative spending"
    : "Generated from IRS Form 990 financial data";

  const SortButton = ({
    label,
    sortKeyVal,
    tooltip,
  }: {
    label: string;
    sortKeyVal: SortKey;
    tooltip?: { title: string; body: string };
  }) => (
    <button
      onClick={() => toggleSort(sortKeyVal)}
      className={cn(
        "group relative inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors",
        sortKey === sortKeyVal ? "text-[#5848F7]" : "text-[#77757B] hover:text-[#36333C]",
      )}
    >
      {label}
      {tooltip && <CircleHelp className="h-3.5 w-3.5 text-[#B0AFC7] transition-colors group-hover:text-[#5848F7]" />}
      <ArrowUpDown className="h-3 w-3" />
      {tooltip && (
        <span className="pointer-events-none absolute left-1/2 top-[calc(100%+10px)] z-20 w-72 -translate-x-1/2 rounded-2xl border border-[#D8D6E8] bg-[#F7F7F8] px-3 py-3 text-left normal-case tracking-normal text-[11px] font-medium leading-5 text-[#36333C] opacity-0 shadow-[0_12px_30px_rgba(31,28,38,0.10)] transition duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="block text-xs font-semibold text-[#1F1C26] underline underline-offset-2">{tooltip.title}</span>
          <span className="mt-1 block text-[#4C4951]" style={{ textAlign: "justify", textJustify: "inter-word" }}>{tooltip.body}</span>
        </span>
      )}
    </button>
  );

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-[#77757B] hover:text-[#36333C] transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            All categories
          </button>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#1F1C26] tracking-tight" style={{ letterSpacing: "-0.01em" }}>
              {benchmark.config.label}
            </h2>
            <p className="text-sm text-[#77757B]">Generated {dateStr}. {sourceLabel}</p>
          </div>
          {benchmark.locationFilter && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#F1F1FE] px-3 py-1 text-xs font-semibold text-[#5848F7]">
              <MapPin className="h-3.5 w-3.5" />
              Within {benchmark.locationFilter.radiusMiles} miles of {benchmark.locationFilter.label}
            </div>
          )}
        </div>
        <button
          onClick={() => window.print()}
          className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[#D2D2D4] bg-white px-4 py-2 text-sm font-bold text-[#4C4951] shadow-[0_1px_2px_rgba(10,13,18,0.05)] hover:bg-[#F7F7F8] transition-colors print:hidden"
        >
          <Printer className="h-4 w-4" />
          Print
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {([
          [String(benchmark.orgCount), "Organizations"],
          [fmtDollars(benchmark.medianRevenue), "Median Revenue"],
          [fmtDollars(benchmark.medianAssets), "Median Total Assets"],
        ] as [string, string][]).map(([value, label]) => (
          <div key={label} className="rounded-md border border-[#E9E9EA] bg-white p-5 text-center">
            <p className="text-2xl font-bold text-[#5848F7] tabular-nums">{value}</p>
            <p className="text-sm text-[#77757B] mt-1 font-medium">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-[#E9E9EA] bg-white overflow-hidden shadow-[0_1px_2px_rgba(10,13,18,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E9E9EA] bg-[#F7F7F8]">
                <th className="py-3 px-4 text-left w-10">
                  <SortButton label="#" sortKeyVal="rank" />
                </th>
                <th className="py-3 px-4 text-left">
                  <SortButton label="Organization" sortKeyVal="name" />
                </th>
                <th className="py-3 px-4 text-right hidden md:table-cell">
                  <SortButton
                    label="Revenue"
                    sortKeyVal="revenue"
                    tooltip={{
                      title: "Latest annual revenue",
                      body: `Total incoming funds reported in the latest filed year. For example, ${fmtExampleDollars(EXAMPLE_BASE_DOLLARS)} indicates ${fmtExampleDollars(EXAMPLE_BASE_DOLLARS)} in annual revenue across contributed, earned, and other sources.`,
                    }}
                  />
                </th>
                <th className="py-3 px-4 text-right hidden lg:table-cell">
                  <SortButton
                    label="Expenses"
                    sortKeyVal="expenses"
                    tooltip={{
                      title: "Latest annual expenses",
                      body: `Total spending reported in the latest filed year. For example, ${fmtExampleDollars(EXAMPLE_BASE_DOLLARS)} indicates ${fmtExampleDollars(EXAMPLE_BASE_DOLLARS)} in annual expenses across programs, administration, and fundraising.`,
                    }}
                  />
                </th>
                <th className="py-3 px-4 text-right hidden lg:table-cell">
                  <SortButton
                    label="Assets"
                    sortKeyVal="assets"
                    tooltip={{
                      title: "Total assets at year end",
                      body: `Resources held at year end, including cash, investments, receivables, property, and similar balance-sheet items. For example, ${fmtExampleDollars(EXAMPLE_BASE_DOLLARS)} in assets indicates ${fmtExampleDollars(EXAMPLE_BASE_DOLLARS)} held on the year-end balance sheet.`,
                    }}
                  />
                </th>
                <th className="py-3 px-4 text-right hidden sm:table-cell">
                  <SortButton
                    label={hasCharityNavigatorRatios ? "Program %" : "Debt Ratio"}
                    sortKeyVal={hasCharityNavigatorRatios ? "programRatio" : "debtRatio"}
                    tooltip={
                      hasCharityNavigatorRatios
                        ? {
                            title: "Program spending share",
                            body: `Share of total expenses allocated to mission delivery. For example, if expenses were ${fmtExampleDollars(EXAMPLE_BASE_DOLLARS)} and Program % was 82%, approximately ${fmtExampleDollars(EXAMPLE_BASE_DOLLARS * 0.82)} supported programs and services.`,
                          }
                        : {
                            title: "Debt ratio",
                            body: `Year-end liabilities divided by year-end assets. For example, if liabilities were ${fmtExampleDollars(EXAMPLE_BASE_DOLLARS)} and assets were ${fmtExampleDollars(EXAMPLE_BASE_DOLLARS * 2)}, the debt ratio would be 50.0%. Lower values generally indicate a stronger balance-sheet position.`,
                          }
                    }
                  />
                </th>
                <th className="py-3 px-4 text-right hidden sm:table-cell">
                  <SortButton
                    label={hasCharityNavigatorRatios ? "Admin %" : "Contrib. %"}
                    sortKeyVal={hasCharityNavigatorRatios ? "adminRatio" : "contribPct"}
                    tooltip={
                      hasCharityNavigatorRatios
                        ? {
                            title: "Administrative spending share",
                            body: `Share of total expenses allocated to management and general operations. For example, if expenses were ${fmtExampleDollars(EXAMPLE_BASE_DOLLARS)} and Admin % was 15%, approximately ${fmtExampleDollars(EXAMPLE_BASE_DOLLARS * 0.15)} supported administrative functions.`,
                          }
                        : {
                            title: "Contribution share",
                            body: `Share of annual revenue coming from contributions, gifts, and grants. For example, if revenue were ${fmtExampleDollars(EXAMPLE_BASE_DOLLARS)} and Contrib. % was 40.0%, approximately ${fmtExampleDollars(EXAMPLE_BASE_DOLLARS * 0.4)} came from contributed support.`,
                          }
                    }
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedOrgs.map(({ org, originalIndex }) => {
                const r = org.ratios[0];
                return (
                  <tr key={org.profile.ein} className="border-b border-[#E9E9EA] hover:bg-[#F7F7F8] transition-colors">
                    <td className="py-2.5 px-4 text-xs font-bold text-[#5848F7] tabular-nums">{originalIndex + 1}</td>
                    <td className="py-2.5 px-4">
                      <p className="font-semibold text-[#1F1C26] truncate max-w-[280px]">{org.profile.name}</p>
                      <p className="text-xs text-[#77757B]">{org.profile.city}, {org.profile.state}</p>
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-[#36333C] hidden md:table-cell">{fmtDollars(org.latestRevenue)}</td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-[#36333C] hidden lg:table-cell">{fmtDollars(org.latestExpenses)}</td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-[#36333C] hidden lg:table-cell">{fmtDollars(org.latestAssets)}</td>
                    <td
                      className={cn(
                        "py-2.5 px-4 text-right tabular-nums hidden sm:table-cell",
                        hasCharityNavigatorRatios
                          ? ratioColor(r?.programExpenseRatio ?? null, 0.75, 0.65, true)
                          : ratioColor(r?.liabilitiesToAssets ?? null, 0.5, 0.8, false),
                      )}
                    >
                      {hasCharityNavigatorRatios ? fmtPct(r?.programExpenseRatio ?? null) : fmtPct(r?.liabilitiesToAssets ?? null)}
                    </td>
                    <td
                      className={cn(
                        "py-2.5 px-4 text-right tabular-nums hidden sm:table-cell",
                        hasCharityNavigatorRatios
                          ? ratioColor(r?.administrativeRatio ?? null, 0.15, 0.25, false)
                          : "text-[#36333C]",
                      )}
                    >
                      {hasCharityNavigatorRatios ? fmtPct(r?.administrativeRatio ?? null) : fmtPct(r?.contributionPct ?? null)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-[#1F1C26] mb-3" style={{ letterSpacing: "-0.01em" }}>Organization Details</h3>
        <div className="space-y-2">
          {benchmark.orgs.map((org, i) => (
            <OrgDetail key={org.profile.ein} org={org} rank={i + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}
