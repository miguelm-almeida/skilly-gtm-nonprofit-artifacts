import type { CategoryBenchmark, OrgBenchmark, FilingRatios } from "../lib/types.js";

const SKILLY_LOGO_SVG = `<svg width="100" height="32" viewBox="0 0 339 107" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M35.0724 54.5296C35.0724 58.3889 31.7707 55.2344 27.7277 55.2344C23.6511 55.2344 20.3494 58.3218 20.3494 54.4289C20.3494 50.5696 23.6848 47.4486 27.7614 47.4822C31.838 47.4822 35.1061 50.6703 35.0724 54.5296Z" fill="#4F46E5"/>
<path d="M64.4847 54.6976C64.4847 58.5569 61.183 55.4023 57.1401 55.4023C53.0634 55.4023 49.7617 58.4898 49.7617 54.5969C49.7617 50.7376 53.0971 47.6166 57.1738 47.6502C61.2504 47.6837 64.5184 50.8383 64.4847 54.6976Z" fill="#4F46E5"/>
<path d="M61.3174 0.399414C62.5303 -0.103973 63.8784 -0.137796 65.125 0.332031C66.3378 0.768282 67.3144 1.67452 67.8535 2.81543C68.3589 3.95644 68.3926 5.23168 67.9209 6.40625C67.2471 8.017 65.7314 9.05705 64.0469 9.29199L59.6328 20.0312C68.7968 23.555 76.1416 29.9651 80.1846 37.9521C81.7681 38.3884 83.251 39.194 84.4639 40.335V40.3008C86.3169 42.0794 87.2939 44.4288 87.2939 46.9121L87.2266 59.0273C87.2265 61.5105 86.1819 63.8595 84.3291 65.6045C82.9141 66.9133 81.1616 67.7855 79.2412 68.1211C72.6041 79.5311 59.0607 87.2838 43.4619 87.2168C27.8629 87.1497 14.4199 79.2292 7.88379 67.752C5.9634 67.3828 4.21141 66.5103 2.83008 65.168C0.977281 63.3895 0.000117543 61.0408 0 58.5576L0.0673828 46.4424C0.0673828 43.959 1.11183 41.6093 2.96484 39.8643C4.17768 38.7234 5.66028 37.9515 7.27734 37.5488C11.6235 29.2263 19.6086 22.6488 29.4463 19.3936L26.8516 12.917C26.4137 12.8499 26.0096 12.7488 25.6055 12.5811C24.3926 12.0777 23.4824 11.1384 23.0107 9.96387C22.5391 8.78936 22.5733 7.51401 23.1123 6.37305C23.6514 5.23204 24.6284 4.35912 25.875 3.92285C27.1214 3.45315 28.4689 3.52018 29.6816 4.02344C30.8945 4.52682 31.8047 5.46703 32.2764 6.6416C32.7479 7.81605 32.7138 9.09155 32.1748 10.2324C32.0063 10.6349 31.7035 10.937 31.4004 11.2725L34.1289 18.1182C37.2621 17.447 40.4967 17.0781 43.832 17.0781C47.7402 17.1117 51.48 17.615 55.0176 18.5547L59.498 7.68164C58.3864 6.40648 58.0158 4.62764 58.6895 2.9834C59.1611 1.84253 60.1047 0.902847 61.3174 0.399414ZM9.56836 39.3945C5.59294 39.3945 2.35861 42.6164 2.3584 46.5762V58.8594C2.35849 62.8193 5.59287 66.041 9.56836 66.041H77.7588C81.7343 66.041 84.9687 62.8193 84.9688 58.8594V46.5762C84.9685 42.6164 81.7342 39.3945 77.7588 39.3945H9.56836Z" fill="#4F46E5"/>
<g clip-path="url(#clip0)">
<path d="M303.938 50.1172L308.45 61.8623L323.29 23.0029H339L324.694 61.8623L317.775 79.8486L307.38 106.996H291.671L300.862 81.5596L277.833 23.0029H293.543L303.938 50.1172ZM131.567 21.0234C136.046 21.0235 140.023 21.7278 143.466 23.1035C146.942 24.4793 149.716 26.4254 151.855 28.9756C153.995 31.5259 155.298 34.5466 155.8 38.0029L141.126 40.6543C140.892 38.5402 139.957 36.8617 138.386 35.6201C136.781 34.3785 134.642 33.6408 131.935 33.4395C129.294 33.2717 127.188 33.6402 125.584 34.5127C123.98 35.4187 123.178 36.661 123.178 38.3389C123.178 39.3118 123.512 40.1503 124.214 40.8213C124.916 41.4924 126.32 42.1976 128.492 42.9023C130.631 43.607 133.94 44.5134 138.386 45.6543C142.697 46.7952 146.207 48.1032 148.814 49.6133C151.455 51.1233 153.293 52.8352 154.496 54.9492C155.699 57.0633 156.301 59.5799 156.301 62.5664C156.301 68.4389 154.162 73.0701 149.95 76.4258C145.705 79.7813 139.588 81.459 132.402 81.459C125.216 81.4589 119.4 79.8146 114.988 76.5596C110.576 73.3046 107.87 68.674 106.934 62.7012L121.606 60.4863C122.208 63.1708 123.512 65.2849 125.584 66.7949C127.656 68.3049 130.263 69.0761 133.438 69.0762C136.046 69.0762 138.051 68.5731 139.455 67.5664C140.859 66.5598 141.56 65.1507 141.561 63.3389C141.561 62.2315 141.294 61.3248 140.726 60.6201C140.157 59.9154 138.887 59.2444 136.948 58.5732C134.976 57.9021 131.934 57.0292 127.823 55.9219C123.178 54.7139 119.468 53.3719 116.693 51.8955C113.919 50.419 111.913 48.6401 110.677 46.5596C109.44 44.4791 108.838 41.9624 108.838 39.043C108.838 35.3854 109.774 32.1975 111.646 29.4795C113.517 26.7949 116.125 24.7138 119.534 23.2373C122.943 21.7608 127.089 21.0234 131.567 21.0234ZM178.629 42.3311L192.166 23.0029H210.215L189.291 52.0625L211.585 81.1572H192.601L178.629 61.627V81.1572H163.722L163.821 2.06348H178.629V42.3311ZM230.203 81.1572H215.63V23.0029H230.203V81.1572ZM252.13 81.1572H237.557V1.99609H252.13V81.1572ZM274.09 81.1572H259.517V1.99609H274.09V81.1572ZM215.83 11.1572C214.527 5.68743 219.307 0.921744 224.722 2.23047C227.262 2.8345 229.367 4.94892 229.969 7.49902C231.272 12.9688 226.493 17.7345 221.078 16.4258C218.538 15.8218 216.432 13.7076 215.83 11.1572Z" fill="#4F46E5"/>
</g>
<defs>
<clipPath id="clip0">
<rect width="232" height="105" fill="white" transform="translate(107 1.99609)"/>
</clipPath>
</defs>
</svg>`;

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtDollars(val: number | null): string {
  if (val === null) return "N/A";
  if (Math.abs(val) >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
  if (Math.abs(val) >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
  if (Math.abs(val) >= 1e3) return `$${(val / 1e3).toFixed(0)}K`;
  return `$${val.toLocaleString("en-US")}`;
}

function fmtPct(val: number | null): string {
  if (val === null) return "N/A";
  return `${(val * 100).toFixed(1)}%`;
}

function fmtRatio(val: number | null): string {
  if (val === null) return "N/A";
  return val.toFixed(1);
}

function ratioClass(val: number | null, thresholds: { good: number; warn: number; higher?: boolean }): string {
  if (val === null) return "ratio-na";
  const higherIsBetter = thresholds.higher !== false;
  if (higherIsBetter) {
    if (val >= thresholds.good) return "ratio-good";
    if (val >= thresholds.warn) return "ratio-warn";
    return "ratio-poor";
  }
  if (val <= thresholds.good) return "ratio-good";
  if (val <= thresholds.warn) return "ratio-warn";
  return "ratio-poor";
}

function renderTrendRow(label: string, values: (number | null)[], formatter: (v: number | null) => string): string {
  return `<tr><td class="trend-label">${esc(label)}</td>${values.map((v) => `<td>${formatter(v)}</td>`).join("")}</tr>`;
}

function renderOrgDetail(org: OrgBenchmark, index: number): string {
  const trends = [...org.trends].sort((a, b) => a.taxYear - b.taxYear);
  const years = trends.map((t) => t.taxYear);
  const latestRatios = org.ratios[0];

  return `
<details class="org-detail">
  <summary class="org-summary">
    <span class="org-rank">#${index + 1}</span>
    <span class="org-name">${esc(org.profile.name)}</span>
    <span class="org-meta">${esc(org.profile.city || "")}, ${esc(org.profile.state || "")} | EIN: ${org.profile.ein} | ${fmtDollars(org.latestRevenue)} revenue</span>
  </summary>
  <div class="org-body">
    <div class="trend-section">
      <h4>Financial Trends (${years[0] || "?"} - ${years[years.length - 1] || "?"})</h4>
      <table class="trend-table">
        <thead><tr><th></th>${years.map((y) => `<th>${y}</th>`).join("")}</tr></thead>
        <tbody>
          ${renderTrendRow("Revenue", trends.map((t) => t.revenue), fmtDollars)}
          ${renderTrendRow("Expenses", trends.map((t) => t.expenses), fmtDollars)}
          ${renderTrendRow("Assets", trends.map((t) => t.assets), fmtDollars)}
          ${renderTrendRow("Liabilities", trends.map((t) => t.liabilities), fmtDollars)}
          ${renderTrendRow("Net Assets", trends.map((t) => t.netAssets), fmtDollars)}
          ${renderTrendRow("Contributions", trends.map((t) => t.contributions), fmtDollars)}
          ${renderTrendRow("Program Revenue", trends.map((t) => t.programRevenue), fmtDollars)}
        </tbody>
      </table>
    </div>
    ${latestRatios ? `
    <div class="ratios-section">
      <h4>Latest Financial Ratios (${latestRatios.taxYear})</h4>
      <div class="ratio-grid">
        <div class="ratio-card">
          <div class="ratio-value ${ratioClass(latestRatios.liabilitiesToAssets, { good: 0.5, warn: 0.8, higher: false })}">${fmtPct(latestRatios.liabilitiesToAssets)}</div>
          <div class="ratio-label">Debt Ratio</div>
        </div>
        <div class="ratio-card">
          <div class="ratio-value ${ratioClass(latestRatios.contributionPct, { good: 0.5, warn: 0.2 })}">${fmtPct(latestRatios.contributionPct)}</div>
          <div class="ratio-label">Contribution %</div>
        </div>
        <div class="ratio-card">
          <div class="ratio-value ${ratioClass(latestRatios.officerCompPct, { good: 0.05, warn: 0.15, higher: false })}">${fmtPct(latestRatios.officerCompPct)}</div>
          <div class="ratio-label">Officer Compensation</div>
        </div>
        <div class="ratio-card">
          <div class="ratio-value ${ratioClass(latestRatios.revenueConcentration, { good: 0.5, warn: 0.8, higher: false })}">${fmtPct(latestRatios.revenueConcentration)}</div>
          <div class="ratio-label">Revenue Concentration</div>
        </div>
      </div>
    </div>` : ""}
  </div>
</details>`;
}

function bestWorst(orgs: OrgBenchmark[], accessor: (r: FilingRatios) => number | null, label: string, higherBetter: boolean): string {
  const entries = orgs
    .map((o) => ({ name: o.profile.name, value: accessor(o.ratios[0]) }))
    .filter((e): e is { name: string; value: number } => e.value !== null);

  if (entries.length === 0) return "";

  entries.sort((a, b) => higherBetter ? b.value - a.value : a.value - b.value);
  const best = entries[0];
  const worst = entries[entries.length - 1];

  return `
<div class="highlight-row">
  <span class="highlight-label">${esc(label)}</span>
  <span class="highlight-best">Best: ${esc(best.name)} (${fmtPct(best.value)})</span>
  <span class="highlight-worst">Weakest: ${esc(worst.name)} (${fmtPct(worst.value)})</span>
</div>`;
}

export function generateHTML(benchmark: CategoryBenchmark): string {
  const date = new Date(benchmark.generatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const tableRows = benchmark.orgs
    .map((org, i) => {
      const r = org.ratios[0];
      return `<tr>
      <td class="rank-cell">${i + 1}</td>
      <td class="name-cell">${esc(org.profile.name)}</td>
      <td>${org.profile.ein}</td>
      <td>${esc(org.profile.city || "")}, ${esc(org.profile.state || "")}</td>
      <td class="num-cell">${fmtDollars(org.latestRevenue)}</td>
      <td class="num-cell">${fmtDollars(org.latestExpenses)}</td>
      <td class="num-cell">${fmtDollars(org.latestAssets)}</td>
      <td class="num-cell ${r ? ratioClass(r.liabilitiesToAssets, { good: 0.5, warn: 0.8, higher: false }) : ""}">${r ? fmtPct(r.liabilitiesToAssets) : "N/A"}</td>
      <td class="num-cell">${r ? fmtPct(r.contributionPct) : "N/A"}</td>
    </tr>`;
    })
    .join("\n");

  const orgDetails = benchmark.orgs.map((org, i) => renderOrgDetail(org, i)).join("\n");

  const highlights = [
    bestWorst(benchmark.orgs, (r) => r?.liabilitiesToAssets, "Debt Ratio", false),
    bestWorst(benchmark.orgs, (r) => r?.contributionPct, "Contribution %", true),
    bestWorst(benchmark.orgs, (r) => r?.officerCompPct, "Officer Compensation", false),
  ]
    .filter(Boolean)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Category Benchmark - ${esc(benchmark.config.label)}</title>
  <style>${CSS}</style>
</head>
<body>

<div class="header-section">
  <div class="header-actions">
    <button class="pdf-button" onclick="window.print()">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 4V14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M8.5 10.5L12 14L15.5 10.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M4 16.5V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V16.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
      Download PDF
    </button>
  </div>
  ${SKILLY_LOGO_SVG}
  <h1>Category Benchmark</h1>
  <h2 class="header-subtitle">${esc(benchmark.config.label)}</h2>
  <p class="header-date">Generated on ${date}</p>
</div>

<div class="section-header"><h2>Category Summary</h2></div>

<div class="summary-grid">
  <div class="summary-card">
    <div class="summary-value">${benchmark.orgCount}</div>
    <div class="summary-label">Organizations</div>
  </div>
  <div class="summary-card">
    <div class="summary-value">${fmtDollars(benchmark.medianRevenue)}</div>
    <div class="summary-label">Median Revenue</div>
  </div>
  <div class="summary-card">
    <div class="summary-value">${fmtDollars(benchmark.medianAssets)}</div>
    <div class="summary-label">Median Total Assets</div>
  </div>
</div>

<div class="section-header"><h2>Top ${benchmark.orgCount} Organizations</h2></div>

<div class="table-wrapper">
  <table class="main-table">
    <thead>
      <tr>
        <th>#</th>
        <th>Organization</th>
        <th>EIN</th>
        <th>Location</th>
        <th>Revenue</th>
        <th>Expenses</th>
        <th>Assets</th>
        <th>Debt Ratio</th>
        <th>Contrib. %</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>
</div>

${highlights ? `
<div class="section-header"><h2>Ratio Highlights</h2></div>
<div class="info-card">
  ${highlights}
</div>` : ""}

<div class="section-header"><h2>Organization Details</h2></div>
${orgDetails}

<div class="footer">
  ${SKILLY_LOGO_SVG}
  <p>Category Benchmark Fact Sheet - Powered by Skilly AI</p>
  <p>Data source: ProPublica Nonprofit Explorer API (IRS Form 990 filings). For internal use only.</p>
</div>

</body>
</html>`;
}

const CSS = `
body {
  background-color: #FAFAFC;
  color: #374151;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
h1 { color: #4F46E5; font-size: 2em; margin: 20px 0 10px 0; }
h2 { color: #3730A3; border-bottom: 3px solid #C7D2FE; padding-bottom: 10px; margin-top: 40px; }
h3 { color: #6366F1; margin-top: 25px; }
h4 { color: #4F46E5; margin-top: 16px; margin-bottom: 8px; }

.header-section {
  position: relative;
  text-align: center;
  padding: 20px 0 30px 0;
  border-bottom: 2px solid #C7D2FE;
  margin-bottom: 30px;
}
.header-actions { position: absolute; bottom: 10px; right: 0; }
.header-subtitle { border: none; margin-top: 10px; padding: 0; }
.header-date { color: #6B7280; font-size: 0.9em; }
.pdf-button {
  display: inline-flex; align-items: center; gap: 8px;
  background: #FFFFFF; color: #111827; border: 1px solid #E5E7EB;
  border-radius: 10px; padding: 8px 12px; font-size: 13px;
  font-weight: 600; line-height: 1; cursor: pointer;
  box-shadow: 0 1px 2px rgba(0,0,0,0.06);
}
.pdf-button:hover { background: #F9FAFB; border-color: #D1D5DB; }
.pdf-button svg { width: 14px; height: 14px; color: #6B7280; }

.section-header {
  background: linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%);
  border-left: 4px solid #4F46E5;
  padding: 16px 20px;
  border-radius: 0 12px 12px 0;
  margin: 30px 0 20px 0;
}
.section-header h2 { margin: 0; border: none; padding: 0; }

.summary-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 20px 0;
}
.summary-card {
  background: white; border: 1px solid #C7D2FE; border-radius: 12px;
  padding: 24px; text-align: center;
  box-shadow: 0 1px 3px rgba(79,70,229,0.1);
}
.summary-value { font-size: 1.8em; font-weight: 700; color: #4F46E5; }
.summary-label { font-size: 0.9em; color: #6B7280; margin-top: 4px; }

.info-card {
  background: white; border: 1px solid #C7D2FE; border-radius: 12px;
  padding: 20px 24px; margin: 20px 0;
  box-shadow: 0 1px 3px rgba(79,70,229,0.1);
}

.table-wrapper { overflow-x: auto; margin: 20px 0; }
.main-table {
  width: 100%; border-collapse: collapse; background: white;
  border: 1px solid #C7D2FE; border-radius: 12px;
  box-shadow: 0 1px 3px rgba(79,70,229,0.1);
}
.main-table th {
  background: linear-gradient(135deg, #4F46E5, #6366F1);
  color: white; padding: 12px 14px; text-align: left;
  font-size: 0.85em; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em;
}
.main-table th:first-child { border-radius: 12px 0 0 0; }
.main-table th:last-child { border-radius: 0 12px 0 0; }
.main-table td { padding: 10px 14px; border-bottom: 1px solid #EEF2FF; font-size: 0.9em; }
.main-table tbody tr:hover { background: #F5F3FF; }
.main-table tbody tr:last-child td { border-bottom: none; }
.rank-cell { font-weight: 700; color: #3730A3; text-align: center; width: 36px; }
.name-cell { font-weight: 600; color: #1F2937; max-width: 260px; }
.num-cell { text-align: right; font-variant-numeric: tabular-nums; }

.ratio-good { color: #059669; font-weight: 700; }
.ratio-warn { color: #D97706; font-weight: 700; }
.ratio-poor { color: #DC2626; font-weight: 700; }
.ratio-na { color: #9CA3AF; }

.highlight-row {
  display: flex; align-items: center; gap: 16px;
  padding: 12px 0; border-bottom: 1px solid #EEF2FF;
}
.highlight-row:last-child { border-bottom: none; }
.highlight-label { font-weight: 700; color: #3730A3; min-width: 200px; }
.highlight-best { color: #059669; font-weight: 600; flex: 1; }
.highlight-worst { color: #DC2626; font-weight: 600; flex: 1; }

.org-detail {
  background: white; border: 1px solid #C7D2FE; border-radius: 12px;
  margin: 12px 0; box-shadow: 0 1px 3px rgba(79,70,229,0.1);
}
.org-summary {
  cursor: pointer; padding: 14px 20px; display: flex; align-items: center; gap: 12px;
  list-style: none; user-select: none;
}
.org-summary::-webkit-details-marker { display: none; }
.org-summary::before {
  content: "\\25B6"; font-size: 0.7em; color: #6366F1; transition: transform 0.2s;
}
details[open] .org-summary::before { transform: rotate(90deg); }
.org-rank { font-weight: 800; color: #4F46E5; min-width: 32px; }
.org-name { font-weight: 700; color: #1F2937; }
.org-meta { color: #6B7280; font-size: 0.85em; margin-left: auto; }
.org-body { padding: 0 20px 20px 20px; }

.trend-table {
  width: 100%; border-collapse: collapse; font-size: 0.88em; margin: 8px 0;
}
.trend-table th {
  text-align: right; padding: 6px 10px; color: #6366F1; font-weight: 600;
  border-bottom: 2px solid #C7D2FE;
}
.trend-table td { text-align: right; padding: 6px 10px; border-bottom: 1px solid #EEF2FF; }
.trend-label { text-align: left !important; font-weight: 600; color: #3730A3; }

.ratio-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 12px 0; }
.ratio-card {
  background: #FAFAFC; border: 1px solid #E0E7FF; border-radius: 10px;
  padding: 16px; text-align: center;
}
.ratio-card .ratio-value { font-size: 1.5em; }
.ratio-card .ratio-label { font-size: 0.8em; color: #6B7280; margin-top: 4px; }

.footer {
  text-align: center; padding: 40px 0; margin-top: 50px;
  border-top: 2px solid #C7D2FE; background: #EEF2FF;
}
.footer p { color: #6B7280; font-size: 0.9em; margin: 10px 0 0 0; }

@media print {
  .header-actions { display: none; }
  body { max-width: 100%; padding: 0; }
  .org-detail { break-inside: avoid; }
  details { open: true; }
  details > .org-body { display: block !important; }
}
@media (max-width: 768px) {
  .summary-grid { grid-template-columns: 1fr; }
  .ratio-grid { grid-template-columns: repeat(2, 1fr); }
  .highlight-row { flex-direction: column; gap: 4px; }
}
`;
