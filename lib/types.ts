export interface CategoryConfig {
  slug: string;
  label: string;
  nteeId: number;
  nteeCodePrefix?: string;
}

export interface LocationFilter {
  label: string;
  latitude: number;
  longitude: number;
  radiusMiles: number;
  stateCode: string | null;
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
  liabilitiesToAssets: number | null;
  contributionPct: number | null;
  officerCompPct: number | null;
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
  charityNavigator: CharityNavigatorRating | null;
  distanceMiles: number | null;
}

export interface CharityNavigatorRating {
  score: number | null;
  stars: number | null;
  programExpensesRatio: number | null;
  administrationExpensesRatio: number | null;
  liabilitiesToAssetsRatio: number | null;
  charityNavigatorUrl: string | null;
  highestLevelAlert: string | null;
}

export interface CategoryBenchmark {
  config: CategoryConfig;
  generatedAt: string;
  orgCount: number;
  medianRevenue: number;
  medianAssets: number;
  orgs: OrgBenchmark[];
  locationFilter: LocationFilter | null;
}

export interface SSEProgress {
  phase: "search" | "filter" | "fetch" | "enrich" | "compute" | "complete" | "error";
  current?: number;
  total?: number;
  message?: string;
  data?: CategoryBenchmark;
}

export interface FetchCategoryResult {
  details: OrgDetail[];
  locationFilter: LocationFilter | null;
  distancesByEin: Record<number, number>;
}
