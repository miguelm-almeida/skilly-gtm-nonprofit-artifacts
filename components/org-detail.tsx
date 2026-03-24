"use client";

import { useState } from "react";
import { ChevronRight, ExternalLink } from "lucide-react";
import { cn, fmtDollars, fmtPct } from "@/lib/utils";
import type { OrgBenchmark } from "@/lib/types";

function ratioColor(val: number | null, good: number, warn: number, higherBetter = true): string {
  if (val === null) return "text-[#9A999D]";
  if (higherBetter) {
    if (val >= good) return "text-emerald-600";
    if (val >= warn) return "text-amber-600";
    return "text-red-500";
  }
  if (val <= good) return "text-emerald-600";
  if (val <= warn) return "text-amber-600";
  return "text-red-500";
}

interface OrgDetailProps {
  org: OrgBenchmark;
  rank: number;
}

export function OrgDetail({ org, rank }: OrgDetailProps) {
  const [open, setOpen] = useState(false);
  const trends = [...org.trends].sort((a, b) => a.taxYear - b.taxYear);
  const years = trends.map((t) => t.taxYear);
  const latestRatios = org.ratios[0];
  const charityNavigator = org.charityNavigator;

  return (
    <div className="rounded-md border border-[#E9E9EA] bg-white overflow-hidden transition-shadow hover:shadow-[0_1px_8px_rgba(31,28,38,0.08)]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[#F7F7F8] transition-colors"
      >
        <ChevronRight className={cn(
          "h-4 w-4 shrink-0 text-[#5848F7] transition-transform duration-200",
          open && "rotate-90",
        )} />
        <span className="text-sm font-bold text-[#5848F7] tabular-nums w-8">#{rank}</span>
        <span className="font-semibold text-[#1F1C26] text-sm truncate flex-1">
          {org.profile.name}
        </span>
        <span className="text-xs text-[#77757B] hidden sm:inline">
          {org.profile.city}, {org.profile.state}
        </span>
        <span className="text-sm font-semibold text-[#36333C] tabular-nums">
          {fmtDollars(org.latestRevenue)}
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5 animate-fade-in-up">
          <div className="border-t border-[#E9E9EA] pt-4">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-xs text-[#77757B] font-medium">
                EIN: <span className="font-mono text-[#36333C]">{org.profile.ein}</span>
              </p>
              {org.trends[0] && (
                <a
                  href={`https://projects.propublica.org/nonprofits/organizations/${org.profile.ein}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#5848F7] font-semibold hover:underline"
                >
                  ProPublica <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {charityNavigator?.charityNavigatorUrl && (
                <a
                  href={charityNavigator.charityNavigatorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#5848F7] font-semibold hover:underline"
                >
                  Charity Navigator <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {charityNavigator && (
              <div className="mb-5 grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="rounded-md bg-[#F1F1FE] p-3 text-center">
                  <p className="text-lg font-bold tabular-nums text-[#5848F7]">
                    {charityNavigator.score?.toFixed(1) ?? "N/A"}
                  </p>
                  <p className="text-[11px] text-[#77757B] mt-0.5 font-medium">CN Score</p>
                </div>
                <div className="rounded-md bg-[#F7F7F8] p-3 text-center">
                  <p className="text-lg font-bold tabular-nums text-[#36333C]">
                    {charityNavigator.stars !== null ? `${charityNavigator.stars} Stars` : "N/A"}
                  </p>
                  <p className="text-[11px] text-[#77757B] mt-0.5 font-medium">Star Rating</p>
                </div>
                <div className="rounded-md bg-[#F7F7F8] p-3 text-center">
                  <p className="text-lg font-bold tabular-nums text-[#36333C]">
                    {fmtPct(charityNavigator.programExpensesRatio)}
                  </p>
                  <p className="text-[11px] text-[#77757B] mt-0.5 font-medium">Program %</p>
                </div>
                <div className="rounded-md bg-[#F7F7F8] p-3 text-center">
                  <p className="text-lg font-bold tabular-nums text-[#36333C]">
                    {fmtPct(charityNavigator.administrationExpensesRatio)}
                  </p>
                  <p className="text-[11px] text-[#77757B] mt-0.5 font-medium">Admin %</p>
                </div>
              </div>
            )}

            {trends.length > 0 && (
              <div className="mb-5">
                <h4 className="text-xs font-semibold text-[#77757B] uppercase tracking-wider mb-2">
                  Financial Trends ({years[0]} - {years[years.length - 1]})
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E9E9EA]">
                        <th className="py-2 pr-4 text-left text-xs font-semibold text-[#77757B]"></th>
                        {years.map((y) => (
                          <th key={y} className="py-2 px-3 text-right text-xs font-semibold text-[#5848F7] tabular-nums">{y}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {([
                        ["Revenue", (t: (typeof trends)[0]) => t.revenue],
                        ["Expenses", (t: (typeof trends)[0]) => t.expenses],
                        ["Assets", (t: (typeof trends)[0]) => t.assets],
                        ["Liabilities", (t: (typeof trends)[0]) => t.liabilities],
                        ["Net Assets", (t: (typeof trends)[0]) => t.netAssets],
                        ["Contributions", (t: (typeof trends)[0]) => t.contributions],
                      ] as [string, (t: (typeof trends)[0]) => number | null][]).map(([label, accessor]) => (
                        <tr key={label} className="border-b border-[#E9E9EA]/50">
                          <td className="py-1.5 pr-4 text-xs font-medium text-[#36333C]">{label}</td>
                          {trends.map((t) => (
                            <td key={t.taxYear} className="py-1.5 px-3 text-right text-xs tabular-nums text-[#77757B]">
                              {fmtDollars(accessor(t))}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {latestRatios && (
              <div>
                <h4 className="text-xs font-semibold text-[#77757B] uppercase tracking-wider mb-3">
                  Ratios ({latestRatios.taxYear})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {([
                    ["Program %", latestRatios.programExpenseRatio, fmtPct, 0.75, 0.65, true],
                    ["Admin %", latestRatios.administrativeRatio, fmtPct, 0.15, 0.25, false],
                    ["Debt Ratio", latestRatios.liabilitiesToAssets, fmtPct, 0.5, 0.8, false],
                    ["Contrib. %", latestRatios.contributionPct, fmtPct, 0.5, 0.2, true],
                    ["Officer Comp.", latestRatios.officerCompPct, fmtPct, 0.05, 0.15, false],
                    ["Rev. Concentration", latestRatios.revenueConcentration, fmtPct, 0.5, 0.8, false],
                  ] as [string, number | null, (v: number | null) => string, number, number, boolean][]).map(
                    ([label, value, formatter, good, warn, higher]) => (
                      <div key={label} className="rounded-md bg-[#F7F7F8] p-3 text-center">
                        <p className={cn("text-lg font-bold tabular-nums", ratioColor(value, good, warn, higher))}>
                          {formatter(value)}
                        </p>
                        <p className="text-[11px] text-[#77757B] mt-0.5 font-medium">{label}</p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
