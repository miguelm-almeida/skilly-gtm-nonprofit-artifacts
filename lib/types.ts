export interface CategoryConfig {
  slug: string;
  label: string;
  nteeId: number;
  nteeCodePrefix?: string;
}

export const CATEGORIES: CategoryConfig[] = [
  { slug: "mutual-membership-benefit", label: "Mutual/Membership Benefit (VEBA)", nteeId: 9 },
  { slug: "education", label: "Education", nteeId: 2 },
  { slug: "human-services", label: "Human Services", nteeId: 5 },
  { slug: "housing-shelter", label: "Housing & Shelter", nteeId: 5, nteeCodePrefix: "L" },
];

export interface SearchOrg {
  ein: number;
  strein: string;
  name: string;
  sub_name: string;
  city: string;
  state: string;
  ntee_code: string;
  subseccd: number;
  score: number;
}

export interface SearchResult {
  total_results: number;
  num_pages: number;
  cur_page: number;
  per_page: number;
  organizations: SearchOrg[];
}

export interface Filing {
  ein: number;
  tax_prd: number;
  tax_prd_yr: number;
  formtype: number;
  pdf_url: string | null;
  updated: string;

  totrevenue: number | null;
  totfuncexpns: number | null;
  totassetsend: number | null;
  totliabend: number | null;
  totnetassetend: number | null;
  totcntrbgfts: number | null;
  totprgmrevnue: number | null;
  invstmntinc: number | null;
  pct_compnsatncurrofcr: number | null;
  compnsatncurrofcr: number | null;
  othrsalwages: number | null;
  profndraising: number | null;
  grsincfndrsng: number | null;

  [key: string]: unknown;
}

export interface OrgProfile {
  ein: number;
  strein: string;
  name: string;
  city: string;
  state: string;
  ntee_code: string;
  subseccd: number;
}

export interface OrgDetail {
  organization: OrgProfile;
  filings_with_data: Filing[];
  filings_without_data: Array<{ tax_prd: number; tax_prd_yr: number; pdf_url: string | null; formtype: number }>;
}

export interface FilingRatios {
  taxYear: number;
  programExpenseRatio: number | null;
  administrativeRatio: number | null;
  fundraisingRatio: number | null;
  fundraisingEfficiency: number | null;
  revenueConcentration: number | null;
}

export interface FilingTrend {
  taxYear: number;
  revenue: number | null;
  expenses: number | null;
  assets: number | null;
  liabilities: number | null;
  netAssets: number | null;
  contributions: number | null;
  programRevenue: number | null;
}

export interface OrgBenchmark {
  profile: OrgProfile;
  latestRevenue: number;
  latestExpenses: number;
  latestAssets: number;
  filingCount: number;
  trends: FilingTrend[];
  ratios: FilingRatios[];
}

export interface CategoryBenchmark {
  config: CategoryConfig;
  generatedAt: string;
  orgCount: number;
  medianRevenue: number;
  medianAssets: number;
  orgs: OrgBenchmark[];
}

export interface SSEProgress {
  phase: "search" | "filter" | "fetch" | "compute" | "complete" | "error";
  current?: number;
  total?: number;
  message?: string;
  data?: CategoryBenchmark;
}
