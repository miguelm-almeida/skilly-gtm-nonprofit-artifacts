import { filterOrgsByRadius, resolveLocationFilter } from "./location";
import type { SearchResult, SearchOrg, OrgDetail, CategoryConfig, FetchCategoryResult, SSEProgress } from "./types";

const BASE_URL = "https://projects.propublica.org/nonprofits/api/v2";
const CONCURRENCY = 6;

function pLimit(concurrency: number) {
  let active = 0;
  const queue: (() => void)[] = [];
  return <T>(fn: () => Promise<T>): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      const run = () => {
        active++;
        fn().then(resolve, reject).finally(() => {
          active--;
          if (queue.length > 0) queue.shift()!();
        });
      };
      active < concurrency ? run() : queue.push(run);
    });
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
  const firstParams = new URLSearchParams();
  firstParams.set("ntee[id]", String(nteeId));
  if (state) firstParams.set("state[id]", state);
  firstParams.set("page", "0");

  const first = await fetchJSON<SearchResult>(`${BASE_URL}/search.json?${firstParams.toString()}`);
  const allOrgs: SearchOrg[] = [...first.organizations];
  const totalPages = Math.min(maxPages, first.num_pages);

  if (totalPages > 1) {
    const limit = pLimit(CONCURRENCY);
    const remaining = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) => {
        const p = new URLSearchParams();
        p.set("ntee[id]", String(nteeId));
        if (state) p.set("state[id]", state);
        p.set("page", String(i + 1));
        return limit(() => fetchJSON<SearchResult>(`${BASE_URL}/search.json?${p.toString()}`));
      }),
    );
    for (const r of remaining) allOrgs.push(...r.organizations);
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
  locationLabel?: string,
  locationLatitude?: number,
  locationLongitude?: number,
): Promise<FetchCategoryResult> {
  const locationFilter = await resolveLocationFilter({
    label: locationLabel,
    latitude: locationLatitude,
    longitude: locationLongitude,
    radiusMiles: 100,
  });
  const effectiveState = locationFilter?.stateCode ?? state;

  onProgress({ phase: "search", message: `Searching ProPublica for ${config.label}...` });
  let orgs = await searchByCategory(config.nteeId, effectiveState, locationFilter ? 8 : 4);
  let distancesByEin: Record<number, number> = {};

  if (config.nteeCodePrefix) {
    orgs = orgs.filter(
      (o) => o.ntee_code && o.ntee_code.toUpperCase().startsWith(config.nteeCodePrefix!),
    );
    onProgress({ phase: "filter", message: `Filtered to ${orgs.length} orgs with NTEE prefix "${config.nteeCodePrefix}"`, total: orgs.length });
  } else {
    onProgress({ phase: "filter", message: `Found ${orgs.length} organizations`, total: orgs.length });
  }

  if (locationFilter) {
    onProgress({
      phase: "filter",
      message: `Filtering nonprofits within ${locationFilter.radiusMiles} miles of ${locationFilter.label}...`,
    });
    const filtered = await filterOrgsByRadius(orgs, locationFilter, onProgress);
    orgs = filtered.orgs;
    distancesByEin = filtered.distancesByEin;
    onProgress({
      phase: "filter",
      message: `Found ${orgs.length} nonprofits within ${locationFilter.radiusMiles} miles of ${locationFilter.label}`,
      total: orgs.length,
    });
  }

  const eins = orgs.map((o) => o.ein);
  let completed = 0;
  const limit = pLimit(CONCURRENCY);

  const settled = await Promise.allSettled(
    eins.map((ein) =>
      limit(async () => {
        const detail = await fetchOrg(ein);
        completed++;
        onProgress({ phase: "fetch", current: completed, total: eins.length, message: `Fetched org ${completed} of ${eins.length}` });
        return detail;
      }),
    ),
  );
  const results = settled.filter((r): r is PromiseFulfilledResult<OrgDetail> => r.status === "fulfilled").map((r) => r.value);

  const withRevenue = results
    .filter((d) => d.filings_with_data && d.filings_with_data.length > 0)
    .sort((a, b) => {
      const aDistance = distancesByEin[a.organization.ein];
      const bDistance = distancesByEin[b.organization.ein];
      if (locationFilter && aDistance !== undefined && bDistance !== undefined && aDistance !== bDistance) {
        return aDistance - bDistance;
      }
      const aRev = a.filings_with_data[0]?.totrevenue ?? 0;
      const bRev = b.filings_with_data[0]?.totrevenue ?? 0;
      return (bRev as number) - (aRev as number);
    });

  return {
    details: withRevenue.slice(0, topN),
    locationFilter,
    distancesByEin,
  };
}
