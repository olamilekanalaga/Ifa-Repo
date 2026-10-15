# Connected creator network and campaign MVP

This extension uses the existing IFAGRITHM app shell, creator directory, matching inputs, CSV parsers and impact charts. It replaces the disconnected founder demo entry with one campaign journey. It does not replace the website or publish to production.

## Entry and routes

- `/#/founder-demo` signs into the existing approved-founder **demo** and opens Campaign studio.
- `/#/campaign-workflow` lists the current demo organisation's campaigns and creates a blank campaign.
- `/#/campaign-workflow/<campaign-id>/brief` records the client/product, customer motivation, barriers, hypothesis, dates, outcome definition, measurement plan and budget allocations.
- `.../creators` searches the existing 1,000 synthetic content profiles, records a shortlist, founder eligibility decisions, fees and availability.
- `.../execution` assigns deliverables to participating creators, records delivery status and registers managed posts or wider discussion.
- `.../evidence` captures dated post snapshots, imports social/product/attribution CSVs and inspects history.
- `.../contribution` assigns referral codes, imports or manually records authorised EVM wallet mappings and product events, reviews source claims and selects product ranking rules.
- `.../report` selects 24h/7d/30d/custom measurements, compares product observations, shows managed vs wider distribution, product contributions and rule-based findings. Save frozen versions; download standalone HTML or complete JSON; print/save PDF through the browser.
- `/#/creator-campaigns` lets the existing creator demo identity apply, accept an approved invitation and view only their own participation, referral code, work and contribution projection. Existing creator profile/classification and legacy marketplace pages remain available.

Legacy evidence reports, historical research and the standalone impact prototype remain on their existing direct routes. They are not silently merged into new campaigns: source ownership and evidence would need explicit mapping. This avoids implying that historical research or unrelated fixtures are managed campaign results.

## Shared campaign record

`src/campaignJourneyModel.js` is the browser-local application service. `src/campaignJourneyUi.js` renders the connected flow. `src/productContribution.js` parses referral/event evidence and calculates reviewed contribution metrics. `src/campaignJourney.css` extends the existing responsive styles and themes. No new packages, credentials or environment variables are required.

All stages use one `campaign.id`: brief, roster, applications, deliverables, content register, social snapshots, aggregate product records, referral codes, wallet links, product events, rules, audit records and frozen reports. New campaigns start empty. Campaign creation never copies the example's creators or outcomes. Data persists under `ifagrithm-campaign-journey-v1:<organisation-id>`; the administrator demo reviews `org-wallet`.

The example has five synthetic participating creators, fictional daily post snapshots, one wider-discussion post, fictional daily product aggregates and **no supplied attribution by default**. The Product contribution page can load a separately labelled fictional referral example. It begins pending and requires manual demo source review; it never creates payment authorisation.

## Participation and permissions

Topic relevance is a selection signal, not an automatic eligibility ban. Creators can apply to open Planning/Active campaigns regardless of content mix. Founders approve or reject applications with a reason. Approved invitees explicitly accept participation on the creator side. IFAGRITHM operators can also record agreed participation manually for their managed roster; doing so remains an operator assertion, not proof of consent or outreach.

The model refuses creator/pending/non-demo identities for private campaign operations even through direct method calls. Creator methods return a narrow projection: no private founder reports, other creators' wallet records, client budgets or internal settings. In this local demonstration creator opportunities come from the example organisation; cross-organisation creator opportunities require a real authenticated backend and publication model.

These are **demo safeguards**, not production security. Browser-local role switching is intentionally available through existing demo controls. Production API handlers remain fail-closed and ignore browser roles. No multi-user authentication, database persistence, live OAuth, provider API access, event ingestion service, payout or external invitation is enabled. Do not upload confidential client or customer data into the public preview.

## Measurement definitions

- 24 hours is **one UTC calendar day**, because current inputs have daily resolution. It is not a rolling hourly view. 7/30/custom windows must fit inside campaign dates.
- Managed social totals use the latest cumulative snapshot at or before the selected end for campaign posts already published. These totals are **not** impressions generated only inside that window.
- Window changes require exact snapshots on the day before the selected start and on the selected end. No interpolation or invented zero baseline. Missing pairs stay unavailable; decreases are flagged as corrections rather than acquired negative impressions.
- Exact repeated snapshots are idempotent. Conflicting post/date snapshots are rejected; clearing and reimporting that source is explicit and does not alter saved versions.
- Managed campaign posts and wider discussion cannot share a registered post ID and are reported separately. Social imports must match the content register's creator identity and publication date.
- Active-wallet figures are means of observed daily counts, with per-metric coverage. Daily uniques are never summed into unique campaign users. Period comparison windows are before/after the **selected measurement window**, and can include other campaign days; the UI states this.
- Aggregate Dune-style activity and daily provider attribution remain separate evidence streams. They are not summed with wallet-level contribution records or treated as proof of campaign lift.
- First supplied evidence removes fictional social/product/attribution streams. A loaded fictional referral example must be cleared before supplied wallet/event records are imported. Operational sample roster/post references remain labelled.
- Budget, service fees, creator compensation, incentives and outside costs are distinct. Allocations cannot exceed a specified total budget. Rankings and reported spend never establish payouts, profit or ROI.

## Referral and event contracts

Referral codes belong to participating creators and are unique across campaigns in the current organisation. A code is an identifier, **not an active tracking link**: the product must implement capture and supply the resulting mapping.

Wallet CSV:

```csv
campaign_id,referral_code,wallet,linked_at,source,authorised
lending-pilot,LEND01,0x1111111111111111111111111111111111111111,2026-09-19T12:00:00Z,Authorised fictional export,yes
```

Product-event CSV:

```csv
campaign_id,event_id,wallet,event_type,occurred_at,amount_usd,source
lending-pilot,example:deposit:1,0x1111111111111111111111111111111111111111,deposit,2026-09-25T12:00:00Z,200,Fictional backend event
```

Addresses are EVM-format and normalised to lowercase. Timestamps are exact UTC. Event types: signup, deposit, return. Deposits require a source-defined USD valuation. Event IDs should include chain/transaction/log identity when relevant. Imports remain pending until a founder/admin records a source-review note and explicit confirmation. This is labelled **demo-reviewed**, never independently verified blockchain evidence.

Only participating creators with approved mappings and reviewed events are eligible for contribution counts. Events before the mapping's capture time are excluded. Conflicting referral-wallet mappings, conflicting event IDs and replaying a source event in another campaign are rejected. Repeated events do not create extra credit.

Rankings can use attributed signup wallets, qualifying deposit wallets or returning deposit wallets. Each metric deduplicates wallets per creator. Minimum deposit, optional prior signup and return interval are founder configurable. A returning depositor means reviewed return activity after the configured elapsed interval following an eligible deposit; it **does not prove funds remained deposited**. No likes, impressions, reposts or post frequency influence product rankings. Compensation, fraud investigation and payment approval remain separate.

## Reports and verification

Each saved report freezes the brief, creator roster, delivery, source records, selected dates, rules, calculations and findings. Corrections create a new version instead of rewriting prior reports. Downloads contain internal terms and source records: review privacy and publication permissions before sharing.

Tests cover the complete model journey, all window modes, cumulative snapshots/differences, correction handling, missing data, campaign/organisation isolation, frozen versions, atomic failed writes, creator applications/acceptance, review gating, referral conflicts, event replay, product-only rankings and budget allocations. Desktop/mobile browser checks cover creating a campaign, five creators, deliverables, posts, CSV imports, snapshot differences, reviewed product evidence, both workspace journeys, report versions and HTML/JSON downloads. The real private API is checked for HTTP 401.

Next production boundary: replace the local application service with authenticated organisation-scoped persistence and audited server review; then connect authorised product referral mapping and reproducible provider events. Neither a local review checkbox nor a typed source label proves external data authenticity.
