# Codex task — Breshna historical campaign + campaign-specific Studio models

Repository: https://github.com/olamilekanalaga/Ifa-Repo
Branch: create a new feature branch. Inspect latest code and preserve existing founder setup and UI.

## Objective
Add Breshna as the first **historical, evidence-labelled** campaign case, without presenting the founder's campaign as a live contract, and without replacing synthetic data silently. This ZIP is an integration patch, not a full repo.

## Implementation
1. Import `breshnaHistorical` from `src/breshnaHistorical.js`. Add a visible Breshna card in Discover and a Studio detail view. Preserve the existing ten fictional campaigns and their current workflows. Add visible `Historical reconstruction` and `Attribution unverified` labels.
2. Create a campaign adapter / discriminated model type so that `fixed_per_qualified_referral` and existing `points_pool` are both supported. Never run Breshna through the existing `score()`/`ranking()` fixed-pool formula.
3. Implement a founder-side design workflow: natural-language campaign brief -> editable structured fields -> human review -> saved versioned specification -> preview. For the demo, use a deterministic parser or explicit editable form; do NOT claim AI integration unless real server-side model calls are implemented.
4. Show Breshna conversion funnel: referral visit (unknown), email registration ($0), first game created (qualifying), referrer reward ($1 per unique verified referred account). Unknown counts must display `Not available`, not zero.
5. The only factual company identity and description currently verified is `https://breshna.io`. Locate the exact official logo asset from the website and verify usage rights/obtain permission before bundling; otherwise use a clearly labelled text-based Breshna brand placeholder. Do not use an invented logo or claim an unverified asset is official.
6. Evidence tab: separate founder/company-published figures from operator recollections. ~100,000 campaign users is an **unverified operator report**, NOT verified conversions or payouts. Do not infer total cost by multiplying this by $1.
7. Missing creator accounts remain `Unknown`; never fabricate accounts, metrics, historical posts or payout receipts. Suspended accounts must not be silently counted as zero.
8. X is ONLY for optional creator discovery/matching, not rewarded engagement. Breshna verification is via client product events, not X. Do not imply the historical 2023 campaign has live integrations.
9. Add tests for: signup alone pays zero; first game after signup pays once; duplicate first-game events don't double-pay; missing referral pays zero; self-referral pays zero; conflicting attribution pays zero; unverified events pay zero; unknown metrics remain null; synthetic campaigns still work.
10. Build/test and deploy only after review. No real payouts, wallet connections, backend integrations or production claims.

## Historical caveats
Dates, eligible regions, campaign cap, attribution window, identity verification, actual payouts and original creator-level logs are unknown. Keep these nullable and editable by admins with evidence attached.

## Deliverables
Provide changed files, test results, preview screenshots and Vercel preview URL. Do not overwrite current production until approved.
