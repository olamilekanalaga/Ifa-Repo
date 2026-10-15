# Creator, Founder and IFAGRITHM administrator workspaces

## Implemented status

This extension is a **non-production browser demo**. No authentication or database environment variables were configured in the existing Vercel project when inspected. No provider was provisioned, no credentials were created, and no database migration was applied. No passwords are collected. Creator registration, founder applications, manual approval and sign-in in the UI are simulations only. Existing historical records, creator workflows, matching and reward engines remain available.

The production HTTP boundary in `server/workspaceApi.js` deliberately ignores all demo state, `x-role` headers, local-storage flags, claimed organisation IDs and fake bearer tokens. It returns 401 for all private operations, 503 for unconfigured production registration/application submission, and a public session capability response with `user: null`. This prevents private production functionality from accidentally going live. It is not a working authentication integration.

## Code structure

```text
api/workspace/[...path].js   Vercel HTTP entry point
server/workspaceApi.js      Fail-closed production API
src/workspaceModel.js       Demo API, roles, approvals, org scoping and lifecycle
src/workspaceUi.js          Access, founder and admin views/forms
src/workspace.css           Responsive extension styles
src/app.js                  Existing shell and route integration
src/engine.js               Existing points/scoring/allocation engine
src/campaignRuleEngine.js   Existing campaign-specific referral engine
src/campaignAnalytics.js    Public historical project reports (not private data)
db/schema.sql              Unapplied Supabase/Postgres RLS reference schema
tests/workspace.test.mjs    Role, approval, org, events, report and ledger tests
tests/production-api.test.mjs  Production-denial tests
```

## Routes and navigation

Routes use the existing hash router. `/#/access` offers Creator or Founder before entry. `/#/access/creator` creates a local demo creator; `/#/access/founder` captures company name, website, work email, product description and relevant social account. Returning demo identities appear under **Demo experiences**; no email/password authentication is claimed.

Creator: `/#/discover` (Discover), `/#/my-campaigns`, `/#/rewards`, `/#/profile`. Only own workspace attribution events are returned by the demo API. Public historical Breshna, SEND and PRINT3R records remain under Discover → Past, with the existing public `/#/reports` and `/#/analytics` links preserved. Public sample leaderboards are not private founder reports.

Approved founder: `/#/founder/overview`, `/#/founder/campaigns`, `/#/founder/reports`, `/#/founder/settings`. Design and campaign management share Campaigns. Pending, rejected, suspended and revoked identities see their status instead of founder tools. `/#/studio` is the preserved legacy synthetic sandbox, restricted in the demo router to approved-founder/admin personas. It is not an organisation's production workspace.

Administrator: `/#/admin/applications` and `/#/admin/campaigns`. Founder reviews require an internal note and retain history. Notes are not included in founder status responses. Campaign reviews are separate from founder approval.

Role switching is explicitly simulated. All demo fixtures are public source assets and browser storage is editable; no real secrets, companies, customer information or private financial data may be put there.

## API contract

The demo adapter exposes `request(method, path, body)` synchronously, returning JSON-compatible objects or `ApiError(status, message)`. A real network adapter must wrap these operations asynchronously after production authentication is connected. The production prefix is `/api/workspace`.

| Operation | Demo contract path |
| --- | --- |
| Session and sign-out | GET /session; DELETE /session |
| Explicit demo persona/sign-in | POST /demo/session |
| Local creator registration | POST /creator/register |
| Founder application/status | POST /founder/applications; GET /founder/application |
| Admin application list/review | GET /admin/applications; POST /admin/applications/:id |
| Admin campaign review | GET /admin/campaigns; POST /admin/campaigns/:id |
| Founder summary/campaigns | GET /founder/overview; GET/POST /founder/campaigns |
| Draft edits | PATCH /founder/campaigns/:id |
| Lifecycle/finalisation | POST /founder/campaigns/:id/transition; POST .../finalise |
| Report filters | GET /founder/reports?campaignId=&creatorId=&startDate=&endDate=&eventType=&status= |
| Simulated ingestion/review | POST /founder/campaigns/:id/events; POST .../review-event |
| Settings and invitations | GET/PATCH /founder/settings; POST /founder/invitations |
| Creator public briefs/own outcomes | GET /creator/campaigns; GET /creator/outcomes |

## Data structures and rules

`ifagrithm-workspace-demo-v1` is separate from the existing `ifagrithm-demo-v1` storage key. User records have an independent `roles` array; approval is stored on founder applications bound to user and organisation. Status is pending, approved, rejected, suspended or revoked. All private demo operations re-evaluate status from the store; they do not accept a role/approval field from form data. Invitations are pending identity verification and grant no access.

Campaign lifecycle: draft → pending_review → approved → live ↔ paused → closed → finalised. Rejected specifications may be edited and resubmitted. Only IFAGRITHM demo admins approve campaign specifications. Reviewed rules are immutable; closed/finalised campaigns accept no new events. Finalisation locks a cent-exact allocation snapshot and never authorises payment.

The new founder editor uses the existing points-pool engine. Breshna's fixed-referral model and SEND/PRINT3R historical records are kept separate rather than converted into pools. Product events are registration, activation, volume and retention; an activation label names the founder's desired action. Only selected event types earn points. Registration/activation prerequisites, duplicate IDs, duplicate milestones, self-referrals and conflicting attribution are checked in the demo. No X engagement conditions are accepted.

Reports: event filters select the event table and outcome metrics. Attributed accounts are distinct per campaign, not deduplicated human beings. Conversion is the proportion of verified registered accounts that also have a verified qualifying action inside the same filters. No denominator means unavailable. Reward points and allocations remain campaign-lifetime values, visibly labelled; filtering never redistributes a pool. Paid expenditure is unknown until actual settlement data exists. Sample events are labelled simulations, never real conversions.

## Production connection requirements

Suggested server-auth integration: a maintained auth library such as Better Auth with Postgres, or an approved managed provider. Use one verified identity, server sessions, verified email, secure HttpOnly/SameSite cookies, CSRF protection, rate limits and server-controlled roles. Never implement password handling or session signing in browser code.

No environment variables are required for this demo. For a future Better Auth/Postgres adapter, configure `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` privately. The current API does **not** read these or become enabled just because they exist. The auth adapter, DB driver, production migrations and API implementation still need engineering and verification. No secret should be prefixed as public or placed in `src/`.

`db/schema.sql` is a reference for Supabase/Postgres, not an executed migration. It requires `auth.users`, `auth.uid()`, `authenticated` and `service_role`. It separates roles from approvals, enables organisation-scoped RLS, restricts creator reads to their own attribution/events/ledger, keeps internal notes admin-only, and denies all authenticated direct writes. If a different auth/Postgres provider is chosen, adapt identity functions before running it. Backend writes must validate authenticated actors and use database transactions; service credentials never go to the browser. Bootstrap the first administrator through a trusted server/operator process, never self-service registration.

Before production: implement and test authenticated signup/sign-in/sign-out, verified identity, email delivery, application review, role revocation, SQL RLS isolation between two real organisations, immutable audit history, append-only event/reversal handling, signed product webhook verification, replay limits, invite acceptance, deployment caching and production event/settlement reconciliation. X historical-content classification is a separate, unconnected pipeline. Do not deploy to production until these controls are verified.
