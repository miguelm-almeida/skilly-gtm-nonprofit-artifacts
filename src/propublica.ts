import type { SearchResult, SearchOrg, OrgDetail, CategoryConfig } from "./types.js";

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

export async function fetchOrgsWithProgress(
  eins: number[],
  label: string,
  onProgress?: (current: number, total: number) => void,
): Promise<OrgDetail[]> {
  const results: OrgDetail[] = [];

  for (let i = 0; i < eins.length; i++) {
    onProgress?.(i + 1, eins.length);
    try {
      const detail = await fetchOrg(eins[i]);
      results.push(detail);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      process.stderr.write(`  [warn] Failed to fetch EIN ${eins[i]}: ${msg}\n`);
    }
    if (i < eins.length - 1) await sleep(REQUEST_DELAY_MS);
  }

  return results;
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
