# Connected Campaign Evidence, Reporting and Creator Portfolio

**Status:** implementation specification, 15 October 2026. Proposed workflows below are not yet implemented. The current deployment remains a browser-local demonstration with private production APIs disabled.

## 1. Product principle and scope

One campaign evidence graph generates three projections: an organisation-private **Founder Report**, an individual **Creator Track Record**, and a permission-approved **IFAGRITHM Case Study**. They reference the same reviewed source/claim versions; they do not maintain separately editable totals.

Campaign documentation and professional history are the core. Compensation is optional and private. MVP uses periodic collection, not mandatory live streaming, payment infrastructure, predictions or reward leaderboards. A creator's platform identity is independent of X, while retention of source content remains subject to its rights and restrictions.

### Existing implementation versus proposed work

| Area | Currently implemented | Proposed extension |
| --- | --- | --- |
| Identity/roles | Browser-local creator, founder and admin personas; private production requests denied | Verified independent login, ownership and real organisation-scoped persistence |
| Creator intelligence | Synthetic classifications, sector shortlists, confidence and time-window examples | Dated, source-linked classification versions; authorised X retrieval later |
| Campaign design | Objectives, dates, eligibility text, points/fixed rewards | Measurement definitions, accepted roster, publication rules, reporting-only default |
| Product reports | Simulated attributed events, funnels and optional calculators | Periodic imports, aggregate-only outcomes and claim-level review |
| Social reporting | No campaign evidence intake | Post references, ownership checks and dated performance snapshots |
| Report history | Mutable demo calculations | Reviewed source manifests and immutable frozen versions |
| Creator portfolios | Profiles and demo directory | Creator-reviewed campaign entries and authorised public projections |
| IFAGRITHM portfolio | Three historical research records | Research library plus managed/commissioned/independent/demo case studies |

## 2. Foundational independent identity

### Stable identity and credentials

- Assign an immutable internal Creator ID and a stable public portfolio identifier. Neither is derived from X handle, X user ID, email address or chosen authentication provider.
- Before onboarding is complete, require at least one verified independent sign-in/recovery method: email-based login or passkey, with an appropriate recovery process. X can be a connected account or convenience login, never the only access path.
- The existing Google button is not a substitute for implemented account recovery. Buttons remain inactive until a real identity adapter is connected and tested.
- Separate authenticated users/credentials from creator records. Credential/provider changes must not change campaign participation ownership or the public portfolio ID.
- Account connections record provider, stable provider subject, ownership verification time, permission scopes, status and connection history. Handles are mutable display fields, not identity keys.
- Linking/replacing an account requires a recently authenticated IFAGRITHM session plus new account ownership proof. Do not merge accounts by matching handles, names, avatars or unverified email.
- A provider subject may have one active owner. Linking conflicts go through a logged ownership dispute process; they never silently transfer a portfolio.
- Notify independent recovery contacts of link, unlink, credential and ownership changes. Require reauthentication for sensitive actions and revoke compromised sessions.
- Recovery requires established credential/recovery proof. A social screenshot or unsupported support request is not sufficient to transfer a Creator ID. Manual recovery must be dual-reviewed and audited.
- Account ownership transfer/merge is an exceptional reviewed operation with history, affected-party notifications and no change to source campaign attribution without evidence.

### Loss of X access

X suspension/disconnection changes the connection state, not the IFAGRITHM identity or the owner of independently supported campaign contributions. A replacement X account links to the same Creator ID after ownership checks; it does not inherit old followers or historical claims about the replacement account.

Keep two retention domains: restricted platform-derived content/metrics/classifications, and independently supported campaign agreements, participation, product analytics and founder attestations. Loss of source access must trigger source-specific review/deletion and invalidate unsupported derived claims. Independently supported records may remain only where their own rights, privacy basis and retention policy allow it.

Do not promise permanent retention of tweets, social metrics, screenshots or all derived X data. No backup/export is a deletion-policy bypass. Retained auditability must respect deletion requirements; use permissible tombstones rather than keeping prohibited content. Public portfolios identify unavailable support rather than presenting an inaccessible source as currently verified.

Source guidance: [X developer guidelines](https://github.com/xdevplatform/docs/blob/main/developer-guidelines.mdx), [X privacy/developer FAQ](https://privacy.x.com/en/ccpa/des-faq), and [X Developer Policy entry point](https://t.co/devpolicy). Official guidance requires respecting removals and imposes deletion obligations for X content. Confirm the applicable agreement, access tier, retention/deletion rules and derived-data treatment before connecting X; these references are not a substitute for that implementation review.

## 3. Invariants

1. Every participant, source, claim, report, portfolio entry and release references campaign_id. Private records carry organisation_id and composite keys prevent cross-tenant references.
2. Upload, review status, verification level, attribution and publication permission are independent concepts.
3. Measurement definitions, units, time windows, exclusions and attribution methods are versioned before evidence is interpreted.
4. Aggregate-only outcomes remain campaign-level. Never split them among participants or use them to calculate individual rewards.
5. Social metrics can support reports without becoming reward conditions. Outcome-based compensation consumes explicitly eligible product claims only.
6. Campaign close, report freeze, compensation finalisation and publication are independent events.
7. Unknown values are null with a reason. Zero requires an observed zero within a defined source/window.
8. Corrections append revisions; frozen evidence/report records cannot be overwritten. Source withdrawal propagates to dependent claims and public releases.
9. Public objects are server-generated approved-field projections, not private JSON with hidden frontend columns.
10. Demo records remain simulated after demo approval. Historical research never implies management, a client contract, payouts or participation by seeded creators.

## 4. Independent state machines

| Object | States | Authority |
| --- | --- | --- |
| Campaign | draft → submitted → approved → active ↔ paused → closed; rejected → draft | Founder owns brief; IFAGRITHM reviews; closure grants no publication rights |
| Participation | proposed → invited → accepted/declined → completed/withdrawn | Founder selects; creator accepts exact terms version |
| Import | uploaded → mapped → previewed → committed/rejected | Authorised source submitter confirms accepted subset |
| Evidence revision | submitted → in_review → accepted/disputed/rejected → superseded/withdrawn | Assigned reviewer records reason and method |
| Report version | draft → review_requested → reviewed → frozen → superseded/withdrawn | Founder attests own sources; IFAGRITHM freezes exact reviewed manifest |
| Portfolio entry | proposed → creator_review → permission_pending → published → superseded/withdrawn | Creator reviews own contribution; applicable rights holders approve disclosure |
| Case study | draft → evidence_review → permission_pending → published → superseded/withdrawn | IFAGRITHM drafts; required rights holders approve exact release |
| Compensation | none/draft/agreed/calculated/finalised | Separate accepted agreement; paid requires separate settlement evidence |

A frozen report can include labelled unresolved/self-reported claims. Freezing does not upgrade their verification. Disputed claims are excluded from eligible compensation and unsupported public assertions.

## 5. Permission matrix

Enforce permissions on every server operation and in database policies. All local role switching stays demo-only.

| Resource/action | Approved founder/member | Creator | IFAGRITHM reviewer/admin | Anonymous |
| --- | --- | --- | --- | --- |
| Private brief/roster | Own organisation | Own invitation and published participant brief | Assigned campaign scope | Approved brief/names only |
| Submit content | Authorised own campaign | Own accepted participation | Assigned scope | No |
| Product CSV/raw account rows | Own organisation | No | Assigned scope | No |
| Founder attestation | Authorised source-company representative | No | Request attestation, cannot impersonate founder | No |
| Independent verification | Cannot independently verify own source | Cannot independently verify own claim | Documented independent method and reviewer/source relationship | No |
| Founder report | Own organisation | Own contribution projection only | Assigned scope | No |
| Portfolio review | Company-owned disclosure permission | Own entry, wording and identity | Coordinate evidence review | No |
| Case-study approval | Company-owned claims/brand rights | Own identity/content/results where required | Claim/relationship review; publish only after rights approvals | No |
| Compensation/settlement | Explicit finance scope | Own agreement/records | Explicit compensation scope | No |
| Internal review notes | No by default | No | Assigned reviewers/admin | No |
| Public release | Approved audience | Approved audience | Approved audience | Approved projection only |

Company membership does not permit changing creator identity or granting third-party content rights. Production reviewer access must be campaign-assigned; the broad demo admin persona is not the production policy. Founder suspension removes private workspace access immediately. Publication permission has its own withdrawal/expiry lifecycle.

## 6. Data model

Use production UUIDs, UTC timestamps, explicit units, integer monetary minor units with currency, tenant composite keys and immutable revision IDs. A file hash proves integrity, not truth. Synthetic IDs are not production identities.

| Entity | Required fields and constraints |
| --- | --- |
| identities/credentials | authenticated user, verified independent credential/recovery methods, sessions/security history; server-owned |
| creators | immutable id, owner_user_id, stable public_id, display name, visibility, origin=real/demo; no dependency on X handle |
| account_connections | creator_id, provider/subject, ownership verification, scopes, status, linked/unlinked times, connection history; unique active provider subject |
| creator_classifications | creator_id, version, taxonomy/model version, observed window, labels, source revisions, confidence method/value, human review, missing inputs and expiry |
| organisations/memberships | Existing roles, approval, ownership and suspension linked to verified identity |
| campaigns | id, organisation_id, product, objective, audience, dates, relationship/environment, brief/measurement versions, lifecycle; budget optional for reporting-only campaigns |
| measurement_definitions | campaign/version, metric/event, unit, aggregation, qualification, exclusions/reversals, attribution/window, cohort, timezone, retention and optional target |
| campaign_participants | campaign/org/creator, role, responsibilities, selection explanation, classification version, exact terms/acceptance, status; unique campaign+creator |
| evidence_sources | campaign, owner/type, collection method, private file key/source URL, hash, source report ID, capture date/window, rights/retention constraints, environment |
| import_batches/rows | campaign/source, idempotency key/hash, mapping version, actor/state, counts/errors and source row numbers |
| content_evidence | campaign/participant, platform/post ID/canonical URL, ownership status, publication time, source; snapshots separately versioned |
| product_outcomes | campaign, participant nullable, scope=aggregate/attributed, source event/account ID nullable, metric/event, amount/unit, time/window, source, definition and attribution basis |
| metric_claims/revisions | stable claim ID and immutable revision, campaign/scope/participant, metric/value nullable/unit/window, definition/source revisions, formula version, verification level, review status, caveats, predecessor |
| claim_reviews | revision, reviewer/source relationship, method/support, decision, verification level, public reason/private note, timestamp; append-only |
| report_versions | campaign/version/predecessor, exact claim revisions, source-manifest hash, calculation versions, narrative, preparer/reviewer, freeze time/status |
| portfolio_entries | campaign/creator/report version, selected claim revisions, contribution wording, creator review and release ID |
| case_studies | campaign/report version, relationship label, narrative, selected claim revisions and release ID |
| publication_approvals | release, approver/authority, exact claims/narrative hash, identity/content/brand permissions, restrictions/expiry, decisions/withdrawal history |
| publication_releases | report version, view type, allowlisted manifest/hash, required approval set, audience/state and publication/withdrawal times |
| compensation_agreements | campaign/participant, version, model=none/fixed_fee/fixed_referral/points_pool/hybrid, currency/rules/acceptance, eligible claim references, private visibility |
| settlement_records | agreement, payer/payee, amount/currency/date/reference, evidence, status=reported/confirmed/disputed/reversed |
| audit_events | actor/scope, campaign, operation, revision/release, time/reason/request ID; no raw confidential file contents |

Preserve the existing attributed product_events/reward-ledger contract. Add product_outcomes and metric_claims for aggregate imports rather than inventing creator/customer IDs. Aggregate claims require participant=null; attributed claims require accepted campaign participation. Model reporting-only explicitly rather than forcing budget>0 and a points model.

Example: a founder reports 200 depositors with no creator attribution. Founder report: 200 founder-confirmed campaign depositors. Individual creator results: unavailable. If 40 are later attributable, report 40 attributed/160 unattributed only after proving compatible cohorts and disjointness. Never report 240 by adding the subset to the aggregate.

## 7. Claim verification

Keep two axes: review_status and verification_level. Preserve multiple supporting attestations; source observation and founder confirmation can coexist without erasing provenance.

| Level | Required support | Does not establish |
| --- | --- | --- |
| self_reported | Named submitter, timestamp and reported source/value | API observation, ownership or independently correct data |
| source_observed | Permitted primary-source observation with field/window/capture method | Conversion attribution or campaign causality |
| founder_confirmed | Authorised source-company attestation of exact scope/window/value | Independent reconciliation or missing creator attribution |
| independently_verified | Reproducible reconciliation against appropriate primary records, with reviewer relationship/method | Verification of other claims in the report |

An administrator click is not independent verification. Screenshots alone remain self-reported unless additional observation/reconciliation supports another label. Signatures prove sender/file provenance, not measurement correctness. On-chain activity alone does not establish off-chain referral attribution. A valid post URL does not grant republication rights.

## 8. Measurement definitions and calculation rules

Before collection, define registration eligibility/uniqueness, named activation, deposit asset/network/product/minimum/hold duration/finality/cutoff, reversals/refunds/test/internal exclusions, gross/net volume basis, retention cohort/day-N requirements, and attribution method/window/conflict handling. Insufficient observation time means unavailable, not failed retention.

Derived claims keep source revisions, formula version, numerator/denominator, units and exclusions. Narrative cannot manually override totals. Attributed is not synonymous with incremental or causal.

Social snapshots: never add cumulative snapshots of the same post as new increments. A post at 10,000 then 12,000 impressions does not establish 22,000. Impressions are not unique people. Engagement rate states its included events and denominator; use compatible sums, not unweighted averages of creator percentages. Missing source metrics stay null.

Product funnels: intersect the same eligible campaign/account cohort across stages; do not divide unrelated aggregates. Display attribution coverage and unmatched outcomes. Missing denominator means null. Avoid combining incompatible definitions, windows or overlapping sources. Cross-campaign accounts are not automatically unique humans.

Budget, spend, agreed compensation, allocation and supported settlement are distinct. Deposit principal/volume are not revenue. Do not silently combine currencies or claim ROI/acquisition cost with missing spend/denominators. Creator comparisons need sample sizes and coverage; reported drop-off does not identify a creator/product fault.

## 9. Periodic import workflow

MVP: UTF-8 CSV and manual/URL references, proposed initial maximum 5 MiB/10,000 rows. No live stream, XLSX parsing, scraping, remote URL fetching or automatic on-chain verification is required.

1. Select campaign, source, reporting period/unit and definition version.
2. Server validates type/size and stores privately.
3. Map columns; resolve creators by accepted participant ID, never fuzzy names.
4. Preview errors, duplicates, unmatched identities, coverage and totals. Reports are unchanged.
5. Explicitly confirm accepted subset; atomically commit sources/batch/claim revisions under an idempotency key.
6. Review/attest exact claims; commit does not independently verify them.
7. Generate report draft from reviewed manifest.

| Dataset | Minimal columns | Constraints |
| --- | --- | --- |
| Social snapshot | participant_id, platform, post_url, captured_at, period_start/end | Optional publication/post ID/metrics; absent metrics null; ownership separate |
| Aggregate outcome | metric_key, value, unit, period_start/end, source_report_id | scope=aggregate; empty participant; definition version |
| Attributed event | source_event_id, participant_id, pseudonymous_account_id, event_type, occurred_at, definition_version | Accepted participant/stable dedup key; optional amount/unit/referral record |
| Settlement | agreement_id, payment_reference, amount/currency, paid_at, source_report_id | Private receipt; reported does not mean confirmed |

Identical batch retries return the original. Identical event IDs are idempotent; conflicting payloads require correction revisions. Hashes cannot detect semantic overlap: enforce source IDs, snapshot keys and overlap checks. Partial acceptance needs explicit confirmation and error export; the accepted subset is atomic.

Treat URLs/cells/files/prose as untrusted. Support quoted CSV/newlines without executing formulas/HTML; escape display and prevent export formula injection. Store http/https references only; reject script/data URLs. Future fetchers require SSRF controls and authorised access. Raw account identifiers remain private.

## 10. Connected report views

**Founder report:** own-organisation brief/roster, selection classification versions, delivered content, provenance-labelled social/product results, compatible aggregates/funnels, supported creator attribution, caveats/discrepancies and reviewed lessons. Compensation is a separately restricted optional panel; no mandatory reward leaderboard.

**Creator track record:** only own accepted participation and supported attributed results. Creator reviews contribution wording; company and applicable identity/content rights holders approve disclosure. Aggregate business outcomes may appear as explicitly authorised campaign context, never individual achievement. Other creators' private figures, company confidential totals, customer IDs and reward terms are excluded by default.

**IFAGRITHM case study:** explicit relationship enum managed_campaign, commissioned_analysis, independent_analysis, historical_research or demonstration. Support and display the actual relationship in views/exports. Demo cannot be relabelled real. Breshna/SEND/PRINT3R retain historical_research status, original IDs/facts/caveats/sources and no inferred demo participation.

Public outputs contain only approved claim revisions/narrative/identity/brand/content fields. Generate allowlisted objects server-side. Never expose private report JSON or raw evidence through frontend hiding.

## 11. Versioning, publication and withdrawal

Freeze exact claim revisions, definitions/calculation versions, source manifest hash, decisions and caveats. Frozen versions reject edits. Corrections append evidence/claim/report versions with reason and predecessor. Post-closure report correction does not silently rewrite agreed compensation or old allocations.

Every release binds report version, selected claims, narrative hash, audience, identity/content scope, expiry and required approvers. Creator approves own entry, company approves its confidential results/brand use, IFAGRITHM reviews evidence/relationship wording, and other rights holders approve where applicable. Admin access cannot substitute for missing consent/authority.

Material changes invalidate affected approvals. Approve a replacement release; never automatically republish a newer report version or assume approval transfers. Withdrawal/source expiry disables affected public releases immediately and invalidates caches/exports/file access. Use transactional/version checks to prevent publish/withdraw races. Do not retain withdrawn confidential claims in public HTML behind a cosmetic notice.

Permissible audit history remains restricted. Retention/deletion obligations can require redaction/tombstones rather than permanent snapshots. Already downloaded third-party copies cannot be technically recalled; publication permissions must explain that limitation.

## 12. Proposed API contract

Extend the existing /api/workspace boundary with an asynchronous adapter. Paths below are proposed, not operational. Derive user/organisation from server sessions and validate related IDs together.

| Operation | Endpoint |
| --- | --- |
| Brief/measurements | Extend GET/POST /founder/campaigns and PATCH /founder/campaigns/:id |
| Roster | GET/POST /founder/campaigns/:id/participants |
| Accept terms | POST /creator/participations/:id/accept |
| Own content | POST /creator/campaigns/:id/content |
| Stage import | POST /founder/campaigns/:id/imports |
| Preview/commit | POST .../imports/:batch/preview; POST .../imports/:batch/commit with Idempotency-Key |
| Founder attestation | POST /founder/campaigns/:id/claims/:claim/attest |
| Review queue | GET /admin/evidence; POST /admin/claims/:claim/reviews, assigned scope |
| Report versions | POST /founder/campaigns/:id/reports; GET /founder/reports/:id/versions/:version |
| Freeze | POST /admin/reports/:id/freeze with expected_version |
| Creator history/evidence | GET /creator/track-record; GET /creator/evidence |
| Own portfolio review | POST /creator/portfolio/:entry/review |
| Case-study draft | POST /admin/case-studies |
| Publication approval | POST /publications/:release/approvals, appropriate authenticated rights holder |
| Publish/withdraw | POST /admin/publications/:release/publish; POST /publications/:release/withdraw |
| Public views | GET /public/creators/:publicId/portfolio; GET /public/case-studies/:slug |

Independent credentials/connection/recovery operations belong to the selected authentication adapter and a reviewed security design, not hand-written browser authentication. Creator ID remains stable across provider changes.

Return 401 unauthenticated, 403 forbidden, 404 inaccessible/not found where enumeration matters, 409 stale state/version/conflicting duplicate, 413 oversized upload, 422 invalid mapping/units/definitions, 503 unconfigured production capability. Keep current private production routes fail-closed until auth/database services pass real tests.

Writes require transactions, audit, idempotency where appropriate and If-Match/expected_version for edits/reviews/publication. Public reads recheck effective release rights/state. Private object links are scoped, short-lived and revocable. Public exports use the same allowlist projection as public pages. Demo requests never grant production permissions.

## 13. Repository implementation map

| File/module | Planned responsibility |
| --- | --- |
| src/workspaceModel.js | Preserve roles/approvals; delegate versioned demo evidence workflows |
| src/workspaceUi.js and app.js | Routes/navigation, roster, imports, reports/history, portfolio/publication UI; preserve shell/themes |
| src/engine.js and campaignRuleEngine.js | Existing optional calculators; consume eligible product claim revisions only |
| src/campaignIntelligence.js | Reuse calculations with cohort definitions; never set verification/publication |
| src/campaignAnalytics.js | Preserve historical reporting; add reviewed-manifest report renderer separately |
| src/historicalStudio.js | Compatibility and research library without invented engagements |
| src/data.js and portfolioProjects.js | Isolate 1,000 fictional creators/32 concepts from real persistence |
| proposed src/evidence/model.js | Claim revisions, independent state machines and invariants |
| proposed src/evidence/imports.js | CSV mapping, preview, deduplication and reconciliation |
| proposed src/evidence/reports.js | Derived claims, immutable manifests/report versions |
| proposed src/evidence/publications.js | Required approvers, allowlists, supersession/withdrawal |
| proposed src/evidence/ui.js | Imports, evidence review, track record/history and case studies |
| server/workspaceApi.js and proposed server/evidence/* | Preserve unconfigured denial; later authenticated transactions/private storage |
| db/schema.sql and future migrations | Existing unapplied reference plus reviewed additive migrations |
| tests/evidence-*.test.mjs | Permissions, imports, corrections, calculations and publication |

Founder navigation: Overview, Campaigns, Creators, Reports, History; Settings in account menu. Creator: My Profile, Opportunities, My Campaigns, Track Record, Evidence; keep Creators discoverable. IFAGRITHM: Applications, Campaign Review, Evidence Review, Research Library, Case Studies. Retain compatibility routes and separate public research from private reports.

## 14. Delivery and migration

**A — Contracts and demo lifecycle:** evidence/import/report/publication contracts, aggregate/attributed fixtures, independent state machines and versioned local store. New documented campaigns default to reporting-only. Preserve existing reward rules and all regression coverage. No local fixture becomes a real record.

**B — Three connected demo outputs:** accepted roster, CSV preview/commit, claim reviews and frozen manifest feed founder report, creator draft and case-study draft. Add scoped approvals, corrections, withdrawal and source-rights handling. Existing designer/simulator remains optional. Verify desktop/mobile/light/dark.

Map legacy finalised campaigns to closed lifecycle plus separately finalised compensation, preserving old snapshots. Existing published flag means brief visibility, not report publication. Seed membership is not creator acceptance. Historical modules retain IDs/facts/sources; no automatic creator portfolios.

**C — Authenticated persistence and real pilot:** choose identity/database/private storage adapters; implement independent credentials/recovery, stable Creator ID, ownership mapping, transactions and database isolation. Test two organisations and creator ownership before real uploads. Existing env placeholders do not activate services. Document exact server-only variables during implementation; never place secrets in src/.

Run one consenting real campaign with definitions, accepted roster, reviewed sources and private founder report. Publish attributable creator/case-study views only if authorised; refusal is a valid outcome. Stage and verify a preview before enabling production services. No migration/auth/X/payment integration is applied by this specification.

**D — Permitted intelligence and learning:** authorised historical content, dated classifications, human-labelled evaluation with per-sector precision/recall and reviewer disagreement. Assess improvement in real selection decisions. Predictive models need sufficient reliable labels, held-out evaluation and calibrated uncertainty; not an MVP prerequisite.

## 15. Acceptance tests

1. Reporting-only campaign needs no points/Odu/payment fields and has versioned measurement definitions.
2. Founder A cannot access Founder B's campaigns/files/claims/reports/agreements/approvals via routes, APIs or direct database access.
3. Pending/suspended founder cannot use approved-founder tools; creators cannot assign roles or tenant IDs.
4. Invitation is not acceptance; creator must accept exact terms before confirmed attribution.
5. Creators submit only own accepted participation; imported participant IDs belong to campaign/organisation.
6. CSV handles quoting/newlines, encodings/limits/timestamps, null versus zero and malicious data without execution/coercion.
7. Preview changes no totals; retry is idempotent; conflicting events/snapshots/concurrent commits cannot double-count.
8. Aggregate 200 deposits with no attribution appears only in founder aggregate results; individual performance stays unavailable.
9. Attributed subsets are not added to aggregates; incompatible windows/cohorts cannot produce conversion rates.
10. Cumulative 10,000/12,000 impressions do not become 22,000.
11. Metrics link to source/definition/window/status/formula; one reviewed claim does not verify all claims.
12. Independent verification needs method/reviewer relationship, not founder attestation or admin click alone.
13. Social evidence can be reported but never enters product-outcome compensation implicitly; reporting-only creates no allocation obligation.
14. Deposits/volume are not revenue; unknown spend blocks ROI claims; currencies are not silently summed.
15. Campaign close does not freeze/publish/finalise compensation or mark paid.
16. Three views reference identical reviewed revisions; creator sees only own attributable results and authorised context.
17. Frozen versions reject mutation; corrections preserve permissible history and invalidate affected release approvals.
18. Missing/expired/withdrawn rights-holder approvals block publication, including admin requests.
19. Public HTML/API/export contains no raw account IDs, private files, reward terms, unrelated private results or internal notes.
20. Withdrawal wins concurrent publication races and disables affected cache/export/object access.
21. Source expiry/deletion propagates; prohibited content is not kept under an audit/archive exception.
22. Historical records stay research, with no inferred management, creator participation, conversions or payouts.
23. X suspension/unlink does not prevent verified independent login or change Creator ID/portfolio ownership.
24. Replacement X ownership proof links to the same career history without transferring follower counts/old account claims.
25. Duplicate-subject linking, handle reuse, account takeover and unsupported recovery attempts are rejected/audited.
26. Required X-content cleanup invalidates unsupported social claims while retaining only permitted independently supported campaign records.
27. Full desktop/mobile/light/dark workflow: brief → accepted roster → import/preview → review → frozen report → creator review → approvals → publication → correction/withdrawal.
28. Existing 32 sample campaigns, 1,000 profiles, matching/reward engines and private production denial tests keep passing.

## 16. Definition of done

Implementation handoff includes schema/API contracts, fixtures/import templates, role/action/calculation tests, limitations, screenshots, commit SHA and preview URL. Report unapplied migrations and unconnected services honestly. Run full tests/build for executable changes.

MVP success is one auditable evidence graph yielding three properly scoped views, with professional identity independent of any one social account. It is not a perpetual X archive or three pages of independently invented totals. This document makes no claim of current policy, financial-promotion or immigration/endorsement compliance.
