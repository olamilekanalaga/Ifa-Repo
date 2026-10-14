# From simulation to a real service

The first milestone is a publicly reachable **demo**, which this package already supports. Real campaigns are a separate engineering and operating milestone.

## Authentication

The current X button explains setup and offers demo mode. It must not claim a real connection. To add real sign-in, use a maintained auth library/provider with X OAuth support, server-held secrets, state validation, PKCE, secure cookies and callback allowlisting. Register callback URLs for the stable deployment domain. Keep provider credentials out of static files and client bundles. Add a durable user/creator identity table and role-controlled founder access.

X reference: https://docs.x.com/fundamentals/authentication/oauth-2-0/authorization-code (verify the current documentation when implementing). No credentials are necessary for the demo. Actual provider access, scopes and pricing must be confirmed at setup; do not assume X login or data access is unconditionally free.

## X data use

This demo does not depend on X: content fit is seeded synthetic data, and outcomes are simulated product events. Do not add payments, Odu or participation conditions tied to X posting, tags, likes, follows or engagement.

Before adding live X data, disclose and establish approval for the specific use case. Consult the current Developer Policy, including pay-to-engage, off-X matching, consent, content retention and redistribution: https://docs.x.com/developer-terms/policy . This design is not an assurance of permission from X.

Content research and product outcome attribution should remain separate. An X identity is not automatically linked to a wallet, browser or customer identity without the necessary consent. An AI service does not remove the obligations attached to its source data.

## Shared data model

Suggested tables: users, creator_profiles, profile_evidence, campaigns, campaign_rule_versions, campaign_memberships, applications, referral_links, customers, attribution_records, outcome_events, event_reviews, allocation_snapshots, payouts and audit_log.

All mutations affecting money belong on the server. Authenticate the actor; verify the role and campaign scope. The current founder sandbox and localStorage are explicitly not authorization or payout systems.

## Outcome ingestion

The client’s server sends signed, timestamped webhook events containing a unique event ID, campaign ID, customer ID, outcome type, amount/currency, occurrence timestamp and the evidence required by the campaign.

Verify the signature and replay window; enforce idempotency with a database uniqueness constraint. Store events immutably. Model refunds, cancellations, duplicate identities and invalidated volume with reversals/adjustments and an audit trail. Do not accept a browser-supplied amount or claimed customer conversion as verified evidence.

Use a declared attribution model such as first eligible referral within a fixed window; record consent and the original source. Handle cross-device journeys, referral code entry, pre-existing users and multiple creators explicitly. A wallet address is not proof of a unique person.

The demo enforces event shape, duplicate milestones, attribution ownership and prerequisite events. It does not detect real Sybil activity, wash volume or circular transfers. In a live campaign, define qualifying amounts, transaction types, elapsed retention periods and review evidence. Do not reward risky financial activity without the appropriate product, eligibility and jurisdiction review.

## Rules and allocations

Publish versioned rules before participation and lock them at launch. The demo intentionally allows edits for learning; never silently carry that ability into live campaigns. Specify the funding currency, total pool, attribution/earning windows, verification delay, caps, exclusions, tie-breaking and appeal process.

Separate estimated allocation, reviewed allocation, payable amount and paid amount. Odu is a display of progress; payout uses the uncapped verified contribution score. A 256-Odu cap must not flatten all high contributors to the same payout.

Use decimal/integer money arithmetic and explicit rounding. Reproduce the pool conservation tests against the production database. Settlement must be idempotent, auditable, authorized and independent from UI refreshes. Real custody and payment rails are not supplied by this prototype.

## Matching and AI

Replace synthetic topic signals with licensed/consented evidence and a transparent classification rubric. Version the model, prompt and taxonomy; record evidence links and confidence. Treat missing evidence separately from mismatch. Give applicants a review path. Topic change alone is not manipulation.

OpenAI or another model can assist classification and evidence summaries once the source terms permit processing. Deterministic server code should apply scoring rules and calculate payouts. Human review should handle disputed eligibility or evidence affecting payment.

## Suggested delivery sequence

1. Deploy and user-test this demo with its labels intact.
2. Validate the campaign objective, customer actions and budget with one willing founder.
3. Add production auth, database and one signed client integration.
4. Run a non-paying shadow campaign to reconcile attribution and outcomes.
5. Add reviewed allocation and settlement only after the economics and verification are credible.

The existing ten brand campaigns are fictional. Replace them with agreed campaigns before a real launch.
