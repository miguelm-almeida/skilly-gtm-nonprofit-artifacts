# Nonprofit GTM Artifact Data Coverage

## ProPublica Nonprofit Explorer API

**Primary data types**
- organization identity and profile data
- IRS classification data
- filing history
- filing-level financial data
- links to filing PDFs and digital filing records where available

**Representative fields**
- organization: [`ein`](https://projects.propublica.org/nonprofits/api#:~:text=%60ein%60) (Employer Identification Number), [`strein`](https://projects.propublica.org/nonprofits/api#:~:text=%60strein%60) (formatted EIN string), [`name`](https://projects.propublica.org/nonprofits/api#:~:text=%60name%60) (organization name), [`sub_name`](https://projects.propublica.org/nonprofits/api#:~:text=%60sub_name%60) (secondary or chapter name), [`address`](https://projects.propublica.org/nonprofits/api#:~:text=%60address%60) (street address), [`city`](https://projects.propublica.org/nonprofits/api#:~:text=%60city%60) (city), [`state`](https://projects.propublica.org/nonprofits/api#:~:text=%60state%60) (state), [`zipcode`](https://projects.propublica.org/nonprofits/api#:~:text=%60zipcode%60) (postal code), [`subseccd`](https://projects.propublica.org/nonprofits/api#:~:text=%60subseccd%60) (IRS tax subsection code), [`ntee_code`](https://projects.propublica.org/nonprofits/api#:~:text=%60ntee_code%60) (National Taxonomy of Exempt Entities code)
- filing metadata: [`tax_prd`](https://projects.propublica.org/nonprofits/api#:~:text=%60tax_prd%60) (tax period), [`tax_prd_yr`](https://projects.propublica.org/nonprofits/api#:~:text=%60tax_prd_yr%60) (tax period year), [`formtype`](https://projects.propublica.org/nonprofits/api#:~:text=%60formtype%60) (IRS form type), [`pdf_url`](https://projects.propublica.org/nonprofits/api#:~:text=%60pdf_url%60) (filing PDF link), [`updated`](https://projects.propublica.org/nonprofits/api#:~:text=%60updated%60) (last updated timestamp)
- common financial aliases: [`totrevenue`](https://projects.propublica.org/nonprofits/api#:~:text=%60totrevenue%60) (total revenue), [`totfuncexpns`](https://projects.propublica.org/nonprofits/api#:~:text=%60totfuncexpns%60) (total functional expenses), [`totassetsend`](https://projects.propublica.org/nonprofits/api#:~:text=%60totassetsend%60) (end-of-year total assets), [`totliabend`](https://projects.propublica.org/nonprofits/api#:~:text=%60totliabend%60) (end-of-year total liabilities), [`pct_compnsatncurrofcr`](https://projects.propublica.org/nonprofits/api#:~:text=%60pct_compnsatncurrofcr%60) (percent of expenses paid to current officers and directors)
- additional form-specific filing fields based on IRS element names

**What this enables**
- org lookup by EIN or name
- category and tax-status filtering
- multi-year filing history by organization
- basic financial trend artifacts
- revenue, expense, asset, and liability summaries
- filing-backed benchmarking inputs

## Charity Navigator API

**Primary data types**
- charity profile data
- ratings and scores
- financial health metrics
- accountability and transparency tests
- category and cause taxonomy
- advisory and alert data

**Representative fields**
- organization: [`ein`](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html#:~:text=%60ein%60) (Employer Identification Number), [`charityName`](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html#:~:text=%60charityName%60) (charity name), [`websiteURL`](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html#:~:text=%60websiteURL%60) (website URL), [`mission`](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html#:~:text=%60mission%60) (mission statement), [`categoryName`](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html#:~:text=%60categoryName%60) (category name), [`causeName`](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html#:~:text=%60causeName%60) (cause name)
- rating: [`score`](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html#:~:text=%60score%60) (overall score), [`rating`](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html#:~:text=%60rating%60) (star rating), [`publicationDate`](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html#:~:text=%60publicationDate%60) (rating publication date)
- financial form subset: [`fundraisingExpenses`](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html#:~:text=%60fundraisingExpenses%60) (fundraising expenses), [`administrativeExpenses`](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html#:~:text=%60administrativeExpenses%60) (administrative expenses), [`programExpenses`](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html#:~:text=%60programExpenses%60) (program expenses), [`totalExpenses`](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html#:~:text=%60totalExpenses%60) (total expenses), [`totalRevenue`](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html#:~:text=%60totalRevenue%60) (total revenue), [`totalNetAssets`](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html#:~:text=%60totalNetAssets%60) (total net assets), [`totalContributions`](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html#:~:text=%60totalContributions%60) (total contributions), [`primaryRevenue`](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html#:~:text=%60primaryRevenue%60) (primary revenue), [`otherRevenue`](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html#:~:text=%60otherRevenue%60) (other revenue)
- performance metrics: [`fundraisingEfficiency`](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html#:~:text=%60fundraisingEfficiency%60) (cost to raise one dollar), [`programExpensesGrowth`](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html#:~:text=%60programExpensesGrowth%60) (program expense growth), [`programExpensesRatio`](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html#:~:text=%60programExpensesRatio%60) (program expense ratio), [`administrationExpensesRatio`](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html#:~:text=%60administrationExpensesRatio%60) (administrative expense ratio), [`liabilitiesToAssetsRatio`](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html#:~:text=%60liabilitiesToAssetsRatio%60) (liabilities-to-assets ratio), [`workingCapitalRatio`](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html#:~:text=%60workingCapitalRatio%60) (working capital ratio)
- accountability: [`boardListStatus`](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html#:~:text=%60boardListStatus%60) (board list disclosure status), [`staffListStatus`](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html#:~:text=%60staffListStatus%60) (staff list disclosure status), [`auditedFinancialStatus`](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html#:~:text=%60auditedFinancialStatus%60) (audited financial statement status), [`form990Status`](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html#:~:text=%60form990Status%60) (Form 990 availability status), [`privacyStatus`](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html#:~:text=%60privacyStatus%60) (donor privacy policy status), [`independentBoard`](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html#:~:text=%60independentBoard%60) (independent board status)
- advisory data: [`severity`](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html#:~:text=%60severity%60) (advisory severity), [`sources`](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html#:~:text=%60sources%60) (advisory source records), [`activeAdvisories`](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html#:~:text=%60activeAdvisories%60) (active advisories)

**What this enables**
- quality and trust overlays on top of financial data
- fundraising efficiency and program-spend comparisons
- accountability and transparency summaries
- category and cause-based segmentation
- exclusion or flagging of organizations with active advisories
- donor-facing or governance-facing artifact language

## Candid

### Grants API

**Primary data types**
- grant summaries
- grant recipients
- funders
- grant transactions
- subject area, geography, and funding activity filters

**Representative fields and outputs**
- summary outputs: [grant counts](https://developer.candid.org/reference/get-started-with-grants-api#:~:text=grant%20counts) (number of grants), [funder counts](https://developer.candid.org/reference/get-started-with-grants-api#:~:text=funder%20counts) (number of funders), [recipient counts](https://developer.candid.org/reference/get-started-with-grants-api#:~:text=recipient%20counts) (number of recipients), [dollar value of grants](https://developer.candid.org/reference/get-started-with-grants-api#:~:text=dollar%20value%20of%20grants) (total grant dollars)
- recipient outputs: [recipient](https://developer.candid.org/reference/get-started-with-grants-api#:~:text=including%20the%20recipient) (recipient organization), [location](https://developer.candid.org/reference/get-started-with-grants-api#:~:text=location) (recipient location), [total dollar amount received](https://developer.candid.org/reference/get-started-with-grants-api#:~:text=total%20dollar%20amount%20received) (total grant dollars received), [grant counts](https://developer.candid.org/reference/get-started-with-grants-api#:~:text=grant%20counts) (number of grants received)
- funder outputs: [funder](https://developer.candid.org/reference/get-started-with-grants-api#:~:text=including%20the%20funder) (grantmaker), [dollar amount granted](https://developer.candid.org/reference/get-started-with-grants-api#:~:text=dollar%20amount%20granted) (total dollars granted), [grant counts](https://developer.candid.org/reference/get-started-with-grants-api#:~:text=grant%20counts) (number of grants made)
- transaction outputs: [funder](https://developer.candid.org/reference/get-started-with-grants-api#:~:text=funder%2C%20recipient%2C%20and%20grant%20transaction%20information) (grantmaker), [recipient](https://developer.candid.org/reference/get-started-with-grants-api#:~:text=funder%2C%20recipient%2C%20and%20grant%20transaction%20information) (recipient organization), [grant transaction information](https://developer.candid.org/reference/get-started-with-grants-api#:~:text=funder%2C%20recipient%2C%20and%20grant%20transaction%20information) (grant-level transaction record), [`year`](https://developer.candid.org/reference/get-started-with-grants-api#:~:text=%26year%3D2023) (grant year), [`amount`](https://developer.candid.org/reference/get-started-with-grants-api#:~:text=sort_by%3Damount) (grant amount)
- common filters: [`subject`](https://developer.candid.org/reference/get-started-with-grants-api#:~:text=%26subject%3DSC02) (subject area), [`location`](https://developer.candid.org/reference/get-started-with-grants-api#:~:text=%26location%3D5332921) (geographic filter), [`year`](https://developer.candid.org/reference/get-started-with-grants-api#:~:text=%26year%3D2023) (calendar or grant year), [`min_amt`](https://developer.candid.org/reference/get-started-with-grants-api#:~:text=%26min_amt%3D10000) (minimum grant amount), [`max_amt`](https://developer.candid.org/reference/get-started-with-grants-api#:~:text=%26max_amt%3D25000) (maximum grant amount), [`profile_levels`](https://developer.candid.org/reference/get-started-with-grants-api#:~:text=%26profile_levels%3DBronze%2C%20Silver%2CGold%2CPlatinum) (Candid Seal of Transparency profile levels)

**What this enables**
- grant flow analysis
- top funder identification
- recipient funding history
- cause and geography-based grant landscape artifacts
- "who funds orgs like this" views

### Premier API

**Primary data types**
- enriched nonprofit profile data
- deeper financial data
- people and contact data
- IRS compliance validation
- downloadable forms and key documents

**What this enables**
- richer nonprofit profile enrichment
- more complete organizational context
- CRM enrichment with nonprofit-specific fields
- document-backed profile artifacts

### Essentials API

**Primary data types**
- nonprofit discovery and search
- core nonprofit profile fields

**What this enables**
- nonprofit search experiences
- lighter profile enrichment
- basic filtering and record enrichment

## API combinations

### ProPublica only

**Data available**
- EIN and org profile
- IRS subsection and NTEE classification
- filing history
- filing-level financial data

**Enables**
- org fact sheets
- financial snapshot artifacts
- multi-year revenue, expense, asset, and liability trends
- category-level nonprofit datasets for internal analysis

**Typical artifact outputs**
- "most recent financial profile"
- "five-year filing history"
- "category and tax-status lookup"

### ProPublica + Charity Navigator

**Data available**
- all ProPublica organization and filing data
- Charity Navigator ratings, financial ratios, accountability tests, and advisories

**Enables**
- financial + trust composite artifacts
- org profile + rating profile in one record
- stronger segmentation by governance quality, fundraising efficiency, and advisory status
- copy that combines financial posture with accountability posture

**Typical artifact outputs**
- "financial summary + rating summary"
- "program spend and fundraising efficiency profile"
- "accountability and transparency snapshot"

### ProPublica + Charity Navigator + Candid

**Data available**
- all ProPublica filing data
- all Charity Navigator ratings and governance overlays
- Candid grants, funders, recipients, and transaction activity

**Enables**
- full nonprofit profile + financial + grant landscape artifacts
- analysis of both internal financials and external funding flows
- funder ecosystem views by category, subject, geography, or recipient type
- artifacts that connect nonprofit financial posture to real grantmaking activity

**Typical artifact outputs**
- "org financial profile + trust profile + funding landscape"
- "peer funder map"
- "grant flow summary by cause or region"

## Current relevance to this codebase

The current `ifast` generation flow already uses ProPublica and currently extracts a narrow revenue value from the organization endpoint and latest filing fallback. ProPublica is therefore already present as the base financial data source in the current artifact path.

## Sources

- `scripts/nonprofit-outreach-bulk-data/ui/app/api/ifast/generate/route.ts`
- [ProPublica Nonprofit Explorer API](https://projects.propublica.org/nonprofits/api)
- [Charity Navigator generated API docs](https://charitynavigator.github.io/api/CharityNavigatorAPI/generated/RZenHtmlDocs/CharityNavigator_doc.html)
- [Charity Navigator developer portal](https://developer.charitynavigator.org/)
- [Charity Navigator API product page](https://developer.charitynavigator.org/portal/catalogue-products/charity-navigator-api-product-1)
- [Candid Grants API getting started](https://developer.candid.org/reference/get-started-with-grants-api)
- [Candid API catalog](https://candid.org/use-our-data/apis)
