import type { CategoryBenchmark, CharityNavigatorRating, SSEProgress } from "./types";

const DEFAULT_GRAPHQL_URL = "https://data.charitynavigator.org/";
const FALLBACK_GRAPHQL_URL = "https://api.charitynavigator.org/graphql";
const REQUEST_TIMEOUT_MS = 15000;
const REQUEST_DELAY_MS = 200;

type SearchResponse = {
  publicSearchFaceted?: {
    results?: Array<{
      ein?: string | null;
      name?: string | null;
      charity_navigator_url?: string | null;
      encompass_score?: number | null;
      encompass_star_rating?: number | null;
      highest_level_alert?: string | null;
      encompass_rating_id?: string | null;
    }>;
  };
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getApiKey(): string | null {
  const value = process.env.CHARITY_NAVIGATOR_API_KEY?.trim() ?? "";
  if (!value) return null;
  if (value === "your_api_key_here") return null;
  if (value.toLowerCase() === "changeme") return null;
  return value;
}

function getApiUrls(): string[] {
  const configured = process.env.CHARITY_NAVIGATOR_API_URL?.trim();
  const urls = [configured, DEFAULT_GRAPHQL_URL, FALLBACK_GRAPHQL_URL].filter(
    (value): value is string => Boolean(value),
  );
  return [...new Set(urls)];
}

function normalizeGraphqlUrl(url: string): string {
  return url.endsWith("/") ? url : `${url}/`;
}

function asNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function runQuery<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Missing CHARITY_NAVIGATOR_API_KEY");
  }

  let lastError: Error | null = null;

  for (const url of getApiUrls()) {
    try {
      const response = await fetch(normalizeGraphqlUrl(url), {
        method: "POST",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        headers: {
          "Content-Type": "application/json",
          Authorization: apiKey,
          "Stellate-Api-Token": apiKey,
        },
        body: JSON.stringify({ query, variables }),
      });

      if (!response.ok) {
        throw new Error(`Charity Navigator HTTP ${response.status}`);
      }

      const payload = (await response.json()) as {
        data?: T;
        errors?: Array<{ message?: string }>;
      };

      if (payload.errors?.length) {
        throw new Error(payload.errors.map((item) => item.message ?? "Unknown GraphQL error").join("; "));
      }

      if (!payload.data) {
        throw new Error("Charity Navigator response did not include data");
      }

      return payload.data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw lastError ?? new Error("Charity Navigator request failed");
}

const SEARCH_QUERY = `
query PublicSearchFaceted(
  $term: String!
  $states: [String!]!
  $sizes: [String!]!
  $causes: [String!]!
  $ratings: [String!]!
  $c3: Boolean!
  $result_size: Int!
  $from: Int!
  $beacons: [String!]!
  $advisories: [String!]!
  $orderBy: String!
) {
  publicSearchFaceted(
    term: $term
    states: $states
    sizes: $sizes
    causes: $causes
    ratings: $ratings
    c3: $c3
    result_size: $result_size
    from: $from
    beacons: $beacons
    advisories: $advisories
    order_by: $orderBy
  ) {
    results {
      ein
      name
      charity_navigator_url
      encompass_score
      encompass_star_rating
      highest_level_alert
      encompass_rating_id
    }
  }
}
`;

const DETAIL_QUERIES = [
  `
  query OrganizationByEin($ein: String!) {
    organization(ein: $ein) {
      ein
      charity_navigator_url
      highest_level_alert
      ratings {
        score
        programExpensesRatio
        administrationExpensesRatio
        liabilitiesToAssetsRatio
      }
    }
  }
  `,
  `
  query NonprofitByEin($ein: String!) {
    nonprofit(ein: $ein) {
      ein
      charity_navigator_url
      highest_level_alert
      ratings {
        score
        programExpensesRatio
        administrationExpensesRatio
        liabilitiesToAssetsRatio
      }
    }
  }
  `,
  `
  query RatingById($id: String!) {
    rating(id: $id) {
      score
      programExpensesRatio
      administrationExpensesRatio
      liabilitiesToAssetsRatio
    }
  }
  `,
  `
  query EncompassRatingById($id: String!) {
    encompassRating(id: $id) {
      score
      programExpensesRatio
      administrationExpensesRatio
      liabilitiesToAssetsRatio
    }
  }
  `,
];

function findObjectWithMetrics(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;

  if (Array.isArray(value)) {
    for (const item of value) {
      const match = findObjectWithMetrics(item);
      if (match) return match;
    }
    return null;
  }

  const record = value as Record<string, unknown>;
  if (
    "programExpensesRatio" in record ||
    "administrationExpensesRatio" in record ||
    "liabilitiesToAssetsRatio" in record ||
    "score" in record
  ) {
    return record;
  }

  for (const child of Object.values(record)) {
    const match = findObjectWithMetrics(child);
    if (match) return match;
  }

  return null;
}

async function lookupSearchHit(ein: string) {
  const data = await runQuery<SearchResponse>(SEARCH_QUERY, {
    term: ein,
    states: [],
    sizes: [],
    causes: [],
    ratings: [],
    c3: false,
    result_size: 5,
    from: 0,
    beacons: [],
    advisories: [],
    orderBy: "relevance",
  });

  const results = data.publicSearchFaceted?.results ?? [];
  return results.find((item) => item.ein === ein) ?? results[0] ?? null;
}

async function lookupDetailedMetrics(ein: string, ratingId: string | null): Promise<Partial<CharityNavigatorRating> | null> {
  for (const query of DETAIL_QUERIES) {
    const variables = query.includes("$id") ? { id: ratingId } : { ein };
    if (query.includes("$id") && !ratingId) continue;

    try {
      const data = await runQuery<Record<string, unknown>>(query, variables);
      const metrics = findObjectWithMetrics(data);
      if (!metrics) continue;

      return {
        score: asNumber(metrics.score),
        programExpensesRatio: asNumber(metrics.programExpensesRatio),
        administrationExpensesRatio: asNumber(metrics.administrationExpensesRatio),
        liabilitiesToAssetsRatio: asNumber(metrics.liabilitiesToAssetsRatio),
      };
    } catch {
      continue;
    }
  }

  return null;
}

export function hasCharityNavigatorApiKey(): boolean {
  return Boolean(getApiKey());
}

export async function fetchCharityNavigatorRating(ein: string): Promise<CharityNavigatorRating | null> {
  if (!hasCharityNavigatorApiKey()) {
    return null;
  }

  const searchHit = await lookupSearchHit(ein);
  if (!searchHit) {
    return null;
  }

  const detailed = await lookupDetailedMetrics(ein, searchHit.encompass_rating_id ?? null);

  return {
    score: detailed?.score ?? asNumber(searchHit.encompass_score),
    stars: asNumber(searchHit.encompass_star_rating),
    programExpensesRatio: detailed?.programExpensesRatio ?? null,
    administrationExpensesRatio: detailed?.administrationExpensesRatio ?? null,
    liabilitiesToAssetsRatio: detailed?.liabilitiesToAssetsRatio ?? null,
    charityNavigatorUrl: asString(searchHit.charity_navigator_url),
    highestLevelAlert: asString(searchHit.highest_level_alert),
  };
}

export async function enrichCategoryBenchmarkWithCharityNavigator(
  benchmark: CategoryBenchmark,
  onProgress?: (event: SSEProgress) => void,
): Promise<CategoryBenchmark> {
  if (!hasCharityNavigatorApiKey()) {
    return benchmark;
  }

  const enrichedOrgs = [];

  for (let i = 0; i < benchmark.orgs.length; i++) {
    const org = benchmark.orgs[i];
    onProgress?.({
      phase: "enrich",
      current: i + 1,
      total: benchmark.orgs.length,
      message: `Enriching ${i + 1} of ${benchmark.orgs.length} with Charity Navigator...`,
    });

    try {
      const charityNavigator = await fetchCharityNavigatorRating(String(org.profile.ein));
      const ratios = org.ratios.map((ratio, index) =>
        index === 0
          ? {
              ...ratio,
              programExpenseRatio: charityNavigator?.programExpensesRatio ?? ratio.programExpenseRatio,
              administrativeRatio: charityNavigator?.administrationExpensesRatio ?? ratio.administrativeRatio,
            }
          : ratio,
      );

      enrichedOrgs.push({
        ...org,
        ratios,
        charityNavigator,
      });
    } catch {
      enrichedOrgs.push(org);
    }

    if (i < benchmark.orgs.length - 1) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  return {
    ...benchmark,
    orgs: enrichedOrgs,
  };
}
