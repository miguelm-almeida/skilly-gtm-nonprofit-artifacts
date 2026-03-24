import { Command } from "commander";
import { writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { CATEGORIES } from "../lib/types.js";
import { searchByCategory, fetchOrg } from "../lib/propublica.js";
import { buildCategoryBenchmark } from "../lib/ratios.js";
import { generateHTML } from "./template.js";
import type { CategoryConfig, OrgDetail } from "../lib/types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, "..", "output");

const REQUEST_DELAY_MS = 250;
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchCategoryOrgsCLI(
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

  const results: OrgDetail[] = [];
  for (let i = 0; i < eins.length; i++) {
    process.stdout.write(`\r  Fetching org ${i + 1}/${eins.length}`);
    try {
      const detail = await fetchOrg(eins[i]);
      results.push(detail);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      process.stderr.write(`  [warn] Failed to fetch EIN ${eins[i]}: ${msg}\n`);
    }
    if (i < eins.length - 1) await sleep(REQUEST_DELAY_MS);
  }
  process.stdout.write("\n");

  const withRevenue = results
    .filter((d) => d.filings_with_data && d.filings_with_data.length > 0)
    .sort((a, b) => {
      const aRev = a.filings_with_data[0]?.totrevenue ?? 0;
      const bRev = b.filings_with_data[0]?.totrevenue ?? 0;
      return (bRev as number) - (aRev as number);
    });

  process.stdout.write(`  ${withRevenue.length} orgs have filing data, taking top ${topN}\n`);
  return withRevenue.slice(0, topN);
}

const program = new Command();

program
  .name("gtm-nonprofit-artifacts")
  .description("Generate Skilly-branded nonprofit category benchmark fact sheets from ProPublica data")
  .version("0.1.0");

program
  .command("build")
  .description("Generate benchmark fact sheets for nonprofit categories")
  .option("-c, --category <slug>", "Single category slug to build (e.g., education)")
  .option("-t, --top <n>", "Number of top organizations per category", "20")
  .option("-s, --state <code>", "Filter by US state (two-letter code)")
  .action(async (opts) => {
    const topN = parseInt(opts.top, 10);
    const state = opts.state as string | undefined;

    let categories = CATEGORIES;
    if (opts.category) {
      categories = CATEGORIES.filter((c) => c.slug === opts.category);
      if (categories.length === 0) {
        const slugs = CATEGORIES.map((c) => c.slug).join(", ");
        console.error(`Unknown category "${opts.category}". Available: ${slugs}`);
        process.exit(1);
      }
    }

    await mkdir(OUTPUT_DIR, { recursive: true });

    for (const config of categories) {
      try {
        const details = await fetchCategoryOrgsCLI(config, topN, state);
        if (details.length === 0) {
          console.warn(`[${config.label}] No organizations found with filing data. Skipping.`);
          continue;
        }

        const benchmark = buildCategoryBenchmark(config, details);
        const html = generateHTML(benchmark);

        const filename = `${config.slug}-fact-sheet.html`;
        const outPath = join(OUTPUT_DIR, filename);
        await writeFile(outPath, html, "utf-8");
        console.log(`\n  -> Written: ${outPath}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`\n[${config.label}] Error: ${msg}`);
      }
    }

    console.log("\nDone.");
  });

program
  .command("discover <ein>")
  .description("Dump all available fields for a given EIN (useful for mapping IRS element names)")
  .action(async (ein: string) => {
    const einNum = parseInt(ein, 10);
    process.stdout.write(`\nFetching EIN ${einNum} for field discovery...\n\n`);
    const detail = await fetchOrg(einNum);

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
  });

program.parse();
