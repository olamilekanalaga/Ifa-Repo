# IFAGRITHM — Campaign Impact MVP

**What:** A founder-facing campaign experiment integrated into the existing IFAGRITHM application. It preserves the creator-style campaign screens and the existing frozen evidence reports. New route: `/#/campaign-impact`, accessible from the approved **Founder Demo** or IFAGRITHM admin demo. It does not build a second website.

**Demo limitations:** Browser-local, no authentication or database for the new report, no actual X, Dune or Formo credentials or API requests. Synthetic examples are clearly labelled. Imported CSV data remains in the browser's localStorage and is not independently verified. **Do not import confidential client data into a public demo.** A first import clears all fictional datasets, preventing mixed evidence.

## What the report actually shows

## Integrated implementation

Integrated from the user-supplied `IFAGRITHM_Campaign_Impact_MVP.zip` onto a feature branch based on production `main`, without the discarded replacement-dashboard preview. The existing shell, creator experience, historical records and reports are preserved. Open `/#/founder-demo/impact` to enter the founder demonstration directly, or select **Campaign impact** in the founder/admin menu.

Files: `src/campaignImpactModel.js`, `src/campaignImpactUi.js`, `src/campaignImpact.css`; route/event integration in `src/app.js`, navigation in `src/workspaceUi.js`, and explicit role gating in `src/workspaceModel.js`. No new dependencies or environment variables are required.

Local storage is scoped by demo organisation (`ifagrithm-impact-mvp-v1:<org-id>`); the IFAGRITHM admin demo reviews the `org-wallet` example. The model refuses creator, pending-founder and non-demo identities even when called directly. These client-side demo checks do not provide production security. The real API stays fail-closed; this feature creates no production data endpoints.

Additional safeguards: post IDs must match source URLs; snapshots cannot silently change post ownership/publication dates; incomplete engagement totals are withheld; missing calendar days break the line chart; per-metric observation coverage is shown; source inputs can be inspected; numeric overflow and failed storage writes leave existing data unchanged. Reset asks before replacing imported observations. Inputs outside the configured windows are retained but excluded with explicit counts.

Daily volume and fees are displayed separately from transactions. Percentage comparisons describe observed-period differences, are provisional with incomplete coverage, and are never attributed campaign lift. A provider-style CSV and a typed source label do not prove that the provider produced or verified the data. No AI assistant, live connection or retention-cohort inference is implemented.

## Report contents

- Campaign metadata and a configurable start/end date.
- Separate pre-campaign and follow-up windows, 7–90 days.
- Social distribution: captured post impressions and engagements, grouped by creator, latest snapshot per post.
- On-chain behaviour: daily active wallet trend, daily transactions, volume and fees; before/during/after comparisons.
- Optional third-party referral/wallet attribution data.
- Reported coverage and missing-data status, downloadable JSON including the input observations and analysis.

**It does not claim** that contemporaneous on-chain activity was caused by the marketing campaign, that wallets represent unique people, or that a change in overall activity implies retention of the same wallets.

## Import format

Exactly these CSV headers (column order matters):

**X/social**
`post_id,creator,published_at,captured_at,impressions,likes,replies,reposts,post_url,source`

Posts must include a real-format X status URL. The latest captured snapshot per post is used. The metric total is the sum of recorded post impressions at those snapshot times, not a reconstructed daily time series and not unique reach. Blank metric cells represent unavailable measurements.

**Dune**
`date,active_wallets,transactions,volume_usd,fees_usd,source`

One row per UTC date; `active_wallets` is a daily unique-wallet count defined by your SQL. Compare averages across periods; do not sum daily uniques into unique users. `transactions`, `volume_usd` and `fees_usd` are observed daily totals. Blank means missing, not zero. `source` should identify the Dune query ID or query URL and refresh time. Periods with incomplete coverage must be read cautiously.

**Formo/attribution (optional)**
`date,visits,new_wallets,source`

One row per UTC date, representing campaign-linked measurements produced through an appropriately configured integration. These are provider-reported attributed results, **not incremental lift or evidence of a unique human per wallet**.

## The questions you can now ask providers

**X**: Can we retrieve these posts by their IDs, with `created_at`, `author_id`, `public_metrics` and impressions under our developer app? Can the creators grant approved user-context access where needed? Are historical reads, metric display, retention and redistribution permitted? Can we capture source timestamp and data status? What do repeated reads cost?

**Dune**: Which verified contract/event tables describe the product's qualifying actions? Can you supply a parameterised saved query by chain, contract and campaign window returning daily active wallets, transactions, fee/volume metrics and query ID? What is the time-zone and wallet definition? What data is missing from public on-chain records? What API/result-access fees and reuse terms apply?

**Formo**: Can the project implement referral/UTM capture *before the campaign* and associate eligible product wallet events with that attribution? How do you handle repeat visits, several wallets, unknown identities and consent? Which daily export or API reports are available, and under which plan? Can a founder reproduce results for an agency?

## Integration and verification

The extension is already integrated in this branch. Do not rerun the ZIP installer. Run `npm run check` for syntax, the full test suite and build; run `npm run dev` for local review. The original installation steps below describe the supplied kit for a fresh checkout only.

1. Clone `https://github.com/olamilekanalaga/Ifa-Repo` and create a feature branch from its current main.
2. Run `node /path/to/IFAGRITHM_Campaign_Impact_MVP/scripts/install.mjs /path/to/Ifa-Repo`.
3. Run `npm ci`, `npm test` and `npm run build` in your repository (Node 24 LTS preferred).
4. Open the demo (e.g., `npm run dev`), select **Demo → Founder**, then **Campaign impact**.
5. Compare a few sample values, try source CSV imports, export JSON and use Reset.
6. Review the changes on a preview deployment. Do not merge or push to production without approval.

If the current repository's source anchors have changed, the installer fails before changing any files. Adjust the minimal route/nav integration rather than overwriting newer work.
