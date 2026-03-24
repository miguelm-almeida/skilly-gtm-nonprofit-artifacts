import type { SearchResult, SearchOrg, OrgDetail, CategoryConfig } from "./types.js";

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

export async function fetchOrgsWithProgress(
  eins: number[],
  label: string,
  onProgress?: (current: number, total: number) => void,
): Promise<OrgDetail[]> {
  let completed = 0;
  const limit = pLimit(CONCURRENCY);

  const settled = await Promise.allSettled(
    eins.map((ein) =>
      limit(async () => {
        const detail = await fetchOrg(ein);
        completed++;
        onProgress?.(completed, eins.length);
        return detail;
      }),
    ),
  );

  for (const r of settled) {
    if (r.status === "rejected") {
      const msg = r.reason instanceof Error ? r.reason.message : String(r.reason);
      process.stderr.write(`  [warn] Failed to fetch an org: ${msg}\n`);
    }
  }

  return settled
    .filter((r): r is PromiseFulfilledResult<OrgDetail> => r.status === "fulfilled")
    .map((r) => r.value);
}

export async function fetchCategoryOrgs(
  config: CategoryConfig,
  topN: number,
  state?: string,
): Promise<OrgDetail[]> {
  process.stdout.write(`\n[${config.label}] Searching ProPublica...\n`);
  let orgs = await searchByCategory(config.nteeId, state);

  if (config.nteeCodePrefix) {
    orgs = orgs.filter(
      (o) => o.ntee_code && o.ntee_code.toUpperCase().startsWith(config.nteeCodePrefix!),
    );
    process.stdout.write(`  Filtered to ${orgs.length} orgs with NTEE prefix "${config.nteeCodePrefix}"\n`);
  } else {
    process.stdout.write(`  Found ${orgs.length} orgs in search results\n`);
  }

  const eins = orgs.map((o) => o.ein);
  process.stdout.write(`  Fetching filing data for ${eins.length} organizations...\n`);

  const details = await fetchOrgsWithProgress(eins, config.label, (cur, tot) => {
    process.stdout.write(`\r  Fetching org ${cur}/${tot}`);
  });
  process.stdout.write("\n");

  const withRevenue = details
    .filter((d) => d.filings_with_data && d.filings_with_data.length > 0)
    .sort((a, b) => {
      const aRev = a.filings_with_data[0]?.totrevenue ?? 0;
      const bRev = b.filings_with_data[0]?.totrevenue ?? 0;
      return (bRev as number) - (aRev as number);
    });

  process.stdout.write(`  ${withRevenue.length} orgs have filing data, taking top ${topN}\n`);
  return withRevenue.slice(0, topN);
}

export async function discoverFields(ein: number): Promise<void> {
  process.stdout.write(`\nFetching EIN ${ein} for field discovery...\n\n`);
  const detail = await fetchOrg(ein);

  process.stdout.write(`Organization: ${detail.organization.name}\n`);
  process.stdout.write(`EIN: ${detail.organization.ein}\n`);
  process.stdout.write(`NTEE: ${detail.organization.ntee_code}\n`);
  process.stdout.write(`Filings with data: ${detail.filings_with_data.length}\n\n`);

  if (detail.filings_with_data.length === 0) {
    process.stdout.write("No filings with data found.\n");
    return;
  }

  const filing = detail.filings_with_data[0];
  process.stdout.write(`--- Latest filing (${filing.tax_prd_yr}, formtype=${filing.formtype}) ---\n\n`);

  const entries = Object.entries(filing)
    .filter(([k]) => k !== "organization")
    .sort(([a], [b]) => a.localeCompare(b));

  for (const [key, value] of entries) {
    process.stdout.write(`  ${key}: ${value}\n`);
  }
}
