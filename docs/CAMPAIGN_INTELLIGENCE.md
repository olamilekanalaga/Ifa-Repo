# Campaign intelligence implementation

## Available in the demo

- Profile switches between creator and approved-founder sample workspaces.
- Creators directory: multi-label illustrative consumer-app topic mix, sector thresholds, relevance ordering, and explicit separation of fit from approval and outcomes.
- Founder Campaigns: lifecycle, objective, eligibility text, product milestones, points weights, capped or uncapped sign-ups (`breadthCap: null`), budget, or fixed reward per qualifying referred account.
- Founder Campaigns simulator: 100 sign-ups versus one sign-up plus first deposit, configurable weights/caps/budget, GBP or USD display without exchange-rate conversion, fixed rates, cent-exact pool allocation, unused budget and shortfall.
- Reports: campaign/creator/date/event/verification filters; verified cohort funnel (tracked visit, sign-up, activation, first deposit), stage conversion/drop-off, returning accounts, reward allocation ledger and fixed-reward budget shortfall.
- Product events: visit, signup, activation, deposit, volume, retention. Visits never earn points. A deposit is a once-per-account milestone, not deposit value or revenue. Sign-up and activation must be verified first. Duplicate IDs/milestones, self-referrals and conflicting attribution are rejected.
- Fixed rewards need one selected milestone (signup, activation or deposit), not a points score. Unspent budget is not redistributed. Over-budget liabilities remain visible; finalisation is blocked instead of silently changing the promised rate. Finalisation snapshots model, rules and rate and never authorises a payout.
- Original 32 sample campaigns and Breshna/SEND/PRINT3R historical reports keep their existing models and figures.

## Scope and definitions

All new simulations and event records use the existing browser-local demo API. Founder organisation checks and manual approval are demonstrated locally. The production HTTP boundary still denies private access; this release does not enable real authentication, approvals or integrations.

`src/campaignIntelligence.js` provides deterministic simulation and cohort calculations; `src/rewardSimulatorUi.js` renders the interactive founder tool. `src/engine.js` supports optional deposit weights and nullable sign-up caps without changing legacy defaults. `src/workspaceModel.js` dispatches workspace reward models and validates events; `src/workspaceUi.js` renders design and reporting.

Points pools allocate the full pool only when positive points exist. Zero-point pools remain unallocated. Fixed rates calculate liabilities independently of the budget. Deposited principal and traded volume are never described as revenue. Rewards are USD in workspace campaigns; the standalone comparison can display GBP or USD, with no implied FX conversion.

Funnels count verified distinct accounts per campaign, intersecting sign-up, activation and deposit cohorts. Date/event/status filters affect funnel observations; allocations always use lifetime verified campaign events. Missing visits yield no measurable visit-to-signup conversion denominator. Returning accounts are separate from the linear acquisition funnel. Drop-off does not identify its cause, creator quality, incremental acquisition or causal impact.

## Still requires production implementation and data

- Authenticated creator/founder identities, administrator approval, organisation-scoped database transactions and deployed RLS.
- Authorised X OAuth/API access, real historical posts, source evidence, depth/consistency/recency features, calibrated confidence and a human-review workflow for actual creator eligibility.
- Authenticated referral capture, signed product webhooks/on-chain adapters, identity reconciliation, fraud checks and reliable visits/product events.
- Real payout processing, funding and financial controls.
- Creator-to-outcome prediction, controlled experiments and learning whether matching improves economically valuable acquisition. No model training or predictive capability is claimed.

The reference SQL schema remains unapplied; its event whitelist is updated for the new demo vocabulary. There are no new required environment variables or connected services in this change. Platform-policy, financial-promotion or immigration/endorsement compliance has not been assessed by this implementation.
