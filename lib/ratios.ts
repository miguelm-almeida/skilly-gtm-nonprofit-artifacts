import type { Filing, FilingRatios, FilingTrend, OrgDetail, OrgBenchmark, CategoryBenchmark, CategoryConfig } from "./types";

function num(val: unknown): number | null {
  if (val === null || val === undefined || val === "") return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

function safeDiv(numerator: number | null, denominator: number | null): number | null {
  if (numerator === null || denominator === null || denominator === 0) return null;
  return numerator / denominator;
}

function programExpenses(f: Filing): number | null {
  const direct = num(f["totprgmservexp"]);
  if (direct !== null) return direct;
  const totalExp = num(f.totfuncexpns);
  const admin = num(f["totmulandgenexp"]);
  const fundraising = num(f["totfundfees"]) ?? num(f.profndraising);
  if (totalExp !== null && admin !== null && fundraising !== null) {
    return totalExp - admin - fundraising;
  }
  return null;
}

function adminExpenses(f: Filing): number | null {
  return num(f["totmulandgenexp"]);
}

function fundraisingExpenses(f: Filing): number | null {
  return num(f["totfundfees"]) ?? num(f.profndraising);
}

export function computeRatios(filing: Filing): FilingRatios {
  const totalExp = num(filing.totfuncexpns);
  const contributions = num(filing.totcntrbgfts);
  const programRev = num(filing.totprgmrevnue);
  const totalRev = num(filing.totrevenue);
  const progExp = programExpenses(filing);
  const adminExp = adminExpenses(filing);
  const fundExp = fundraisingExpenses(filing);

  let revenueConcentration: number | null = null;
  if (totalRev !== null && totalRev > 0) {
    const sources = [contributions ?? 0, programRev ?? 0, num(filing.invstmntinc) ?? 0];
    const maxSource = Math.max(...sources);
    revenueConcentration = maxSource / totalRev;
  }

  return {
    taxYear: filing.tax_prd_yr,
    programExpenseRatio: safeDiv(progExp, totalExp),
    administrativeRatio: safeDiv(adminExp, totalExp),
    fundraisingRatio: safeDiv(fundExp, totalExp),
    fundraisingEfficiency: safeDiv(contributions, fundExp),
    revenueConcentration,
  };
}

export function computeTrend(filing: Filing): FilingTrend {
  return {
    taxYear: filing.tax_prd_yr,
    revenue: num(filing.totrevenue),
    expenses: num(filing.totfuncexpns),
    assets: num(filing.totassetsend),
    liabilities: num(filing.totliabend),
    netAssets: num(filing.totnetassetend),
    contributions: num(filing.totcntrbgfts),
    programRevenue: num(filing.totprgmrevnue),
  };
}

export function buildOrgBenchmark(detail: OrgDetail): OrgBenchmark {
  const filings = detail.filings_with_data
    .filter((f) => f.formtype === 0 || f.formtype === 1)
    .sort((a, b) => b.tax_prd_yr - a.tax_prd_yr)
    .slice(0, 5);

  const latest = filings[0];

  return {
    profile: detail.organization,
    latestRevenue: (num(latest?.totrevenue) ?? 0) as number,
    latestExpenses: (num(latest?.totfuncexpns) ?? 0) as number,
    latestAssets: (num(latest?.totassetsend) ?? 0) as number,
    filingCount: filings.length,
    trends: filings.map(computeTrend),
    ratios: filings.map(computeRatios),
  };
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function buildCategoryBenchmark(
  config: CategoryConfig,
  details: OrgDetail[],
): CategoryBenchmark {
  const orgs = details.map(buildOrgBenchmark);
  const revenues = orgs.map((o) => o.latestRevenue).filter((r) => r > 0);
  const assets = orgs.map((o) => o.latestAssets).filter((a) => a > 0);

  return {
    config,
    generatedAt: new Date().toISOString(),
    orgCount: orgs.length,
    medianRevenue: median(revenues),
    medianAssets: median(assets),
    orgs,
  };
}
