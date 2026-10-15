# Founder Campaign Intelligence — visible demonstration

## Current scope

The founder is the customer. The core output is an evidence-backed campaign performance report supporting the next marketing decision. Creator identities and contributions remain internal analysis records. An individual creator portfolio, permanent career-history product and public creator reward leaderboard are not part of this extension.

This supersedes the portfolio-product scope in CAMPAIGN_EVIDENCE_ENGINE_SPEC.md. That document remains design history. Basic identity ownership is still necessary for accounts, but it is not a new creator-facing product commitment.

## Explore the prototype

Enter Demo to open the founder report directly, or use `#/founder-demo` for a fresh demo-founder entry link. Founder navigation also has Reports and History. Routes:

- `#/campaign-records/founder`: organisation-private fictional campaign report.
- `#/campaign-records/evidence`: CSV preview, claim corrections/review, post-level snapshots and version freezing.
- `#/campaign-records/history`: report versions and audit history.
- `#/campaign-records/case-study`: aggregate case-study draft, separate founder/reviewer approvals and withdrawal.
- `#/campaign-records/public`: approved public-projection preview, simulated in this browser only.

The clearly labelled Founder view and IFAGRITHM review controls switch existing demo personas, not production permissions. A real creator, pending founder or another organisation cannot use the model's private campaign operations. The existing production HTTP API still denies private requests. All fixtures are fictional; no real evidence or private client data belongs in browser storage.

## Implemented behaviour

A single fictional closed Consumer App Adoption campaign backs the report and optional case-study projection. It is separate from historical Breshna, SEND and PRINT3R research, and from the 32 sample campaign concepts.

The report leads with accepted post-level impressions, likes, replies, reposts, participant/post counts, aggregate product outcomes, internal creator comparison, reported spend and next-campaign considerations. Impressions are displays, not unique people. Unknown totals remain unavailable. A spend/depositor ratio is explicitly descriptive, not causal CPA, revenue or ROI.

One stable source-post ID has one working snapshot, with revision/capture date/source/creator; updating it replaces the working observation instead of adding cumulative totals twice. Reviewed frozen reports keep their own snapshot copy. Social aggregation is derived from accepted post records, with missing-metric coverage. Product aggregate claims are not added to creator subsets. Unknown attribution is never allocated among creators.

CSV upload is local file reading, not a server upload. Preview uses fictional metric,value,scope,creator_id,source,period_start,period_end columns. A built-in sample adds an aggregate returning-account claim. Product CSV rows must use this demo campaign's exact reporting window; overlap/duplicate rows are rejected. Social metrics use the post-snapshot form instead of a second aggregate import. A commit produces self-reported submitted claims; it never verifies them. This small demo rejects an invalid batch as a whole; partial acceptance and production-grade import processing remain future work.

A founder may correct/attest claims. The IFAGRITHM demo reviewer accepts/disputes/rejects claims with evidence level and method; independent-verification examples require an explicit independence checkbox. All labels remain Demo regardless of review status. Real verification access/methods are not connected. Report freeze creates a new immutable snapshot; old versions remain inspectable. New evidence/review invalidates prior publication approvals immediately.

The demo case study requires separate founder disclosure and IFAGRITHM review approval for the current frozen version. It contains aggregate results only, no named creators or republished posts; therefore no individual creator publication consent is simulated. A future release identifying creators or displaying their content must add the applicable rights-holder approvals. Admin cannot bypass the required founder approval. Withdrawn or stale projections are unavailable. Publication exists only in browser-local storage and is not a real shared public release.

The public projection allowlists title, demonstration relationship, report version, aggregate product claims and distribution totals. It excludes spend, customer-level data, internal creator identities, raw files and private notes. The relationship always stays demonstration; no client engagement is implied.

## Code and persistence

- `src/evidenceDemoModel.js`: single-campaign fixture, permission checks, claim/post revisions, CSV validation, report snapshots and case-study approval/withdrawal.
- `src/evidenceDemoUi.js`: founder report, evidence/import review, history and case-study views.
- `src/app.js`, `src/workspaceUi.js`, `src/workspace.css`: routing, navigation and themed responsive UI.
- `tests/evidence-demo.test.mjs`: separation of aggregate/subset data, authorisation, versions, imports, post replacement, publication and withdrawal.

Storage key: `ifagrithm-founder-evidence-demo-v1`, separate from both existing demo stores. All demo source assets/state remain inspectable and editable in the browser; these checks demonstrate intended contracts, not secure persistence.

## Not implemented by this prototype

Real authentication/database/RLS, private file storage, creator acceptance/contracts, source-platform verification, X ingestion/retention automation, on-chain reconciliation, production publication/consent, public distribution caching, payments and predictive models remain unconnected. The fixed fixture demonstrates reporting/review rather than creating real campaigns. Evidence source ownership and reviewed business relationships must be established before real use.

Existing reward simulations remain optional tools; this evidence campaign has no configured compensation. No payout or real business outcome is claimed. No new credentials, migrations, real campaigns or external services were provisioned.
