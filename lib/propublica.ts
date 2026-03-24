import type { SearchResult, SearchOrg, OrgDetail, CategoryConfig, SSEProgress } from "./types";

const BASE_URL = "https://projects.propublica.org/nonprofits/api/v2";
const REQUEST_DELAY_MS = 250;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJSON<T>(url: string): Promise<T> {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json() as Promise<T>;
}

export async function searchByCategory(
  nteeId: number,
  state?: string,
  maxPages = 4,
): Promise<SearchOrg[]> {
  const allOrgs: SearchOrg[] = [];

  for (let page = 0; page < maxPages; page++) {
    const params = new URLSearchParams();
    params.set("ntee[id]", String(nteeId));
    if (state) params.set("state[id]", state);
    params.set("page", String(page));

    const url = `${BASE_URL}/search.json?${params.toString()}`;
    const result = await fetchJSON<SearchResult>(url);
    allOrgs.push(...result.organizations);

    if (page >= result.num_pages - 1) break;
    await sleep(REQUEST_DELAY_MS);
  }

  return allOrgs;
}

export async function fetchOrg(ein: number): Promise<OrgDetail> {
  const url = `${BASE_URL}/organizations/${ein}.json`;
  return fetchJSON<OrgDetail>(url);
}

export async function fetchCategoryWithProgress(
  config: CategoryConfig,
  topN: number,
  onProgress: (event: SSEProgress) => void,
  state?: string,
): Promise<OrgDetail[]> {
  onProgress({ phase: "search", message: `Searching ProPublica for ${config.label}...` });
  let orgs = await searchByCategory(config.nteeId, state);

  if (config.nteeCodePrefix) {
    orgs = orgs.filter(
      (o) => o.ntee_code && o.ntee_code.toUpperCase().startsWith(config.nteeCodePrefix!),
    );
    onProgress({ phase: "filter", message: `Filtered to ${orgs.length} orgs with NTEE prefix "${config.nteeCodePrefix}"`, total: orgs.length });
  } else {
    onProgress({ phase: "filter", message: `Found ${orgs.length} organizations`, total: orgs.length });
  }

  const eins = orgs.map((o) => o.ein);
  const results: OrgDetail[] = [];

  for (let i = 0; i < eins.length; i++) {
    onProgress({ phase: "fetch", current: i + 1, total: eins.length, message: `Fetching org ${i + 1} of ${eins.length}` });
    try {
      const detail = await fetchOrg(eins[i]);
      results.push(detail);
    } catch {
      // skip failed orgs silently
    }
    if (i < eins.length - 1) await sleep(REQUEST_DELAY_MS);
  }

  const withRevenue = results
    .filter((d) => d.filings_with_data && d.filings_with_data.length > 0)
    .sort((a, b) => {
      const aRev = a.filings_with_data[0]?.totrevenue ?? 0;
      const bRev = b.filings_with_data[0]?.totrevenue ?? 0;
      return (bRev as number) - (aRev as number);
    });

  return withRevenue.slice(0, topN);
}
