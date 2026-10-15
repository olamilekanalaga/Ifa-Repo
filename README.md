# IFAGRITHM — Founder Campaign Intelligence

## Current founder reporting demo

[Founder reporting implementation](docs/FOUNDER_REPORTING_DEMO.md) describes the connected campaign report, post-level snapshots, product claims, CSV preview, evidence review, version history and separately approved case study. Individual creator portfolios are deferred; creator records support internal campaign analysis.

## Previous architecture specification

[Connected Campaign Evidence and Creator Portfolio](docs/CAMPAIGN_EVIDENCE_ENGINE_SPEC.md) defines the proposed shared campaign record, three report views, claim-level verification, independent creator identity, imports, publication permissions, migrations and acceptance tests. It is a specification; these evidence and production identity workflows are not yet live.

A working, deployable prototype of Ola’s outcome-based campaign model. Includes **1,000 unique synthetic creator profiles**, **32 illustrative campaigns**, real locally saved brand logos, CC0 Nouns avatar artwork, a campaign marketplace, matching, review applications, referral journeys, Odu, estimated reward allocations, and a founder sandbox.

**All activity and rewards are simulated. No wallet connections, customer deposits, X posting, real payouts or live brand partnerships are involved.** Data stays in the current browser. The named brands are illustrative examples, not clients.

## Run it

Use Node.js **24 LTS** (Node 22.19+ also works).

```bash
npm ci
npm run dev
```

Open **http://localhost:4173**. No environment variables, paid APIs, database or runtime dependencies are required. The dev server uses only Node built-ins; `npm ci` installs the development-only DOM test dependency.

```bash
npm run check   # syntax checks, engine/asset/journey tests, production build
npm run build   # copies the deployable app into dist/
npm run preview
```

## Deploy to Vercel

1. Copy the CONTENTS of this folder into `https://github.com/olamilekanalaga/Ifa-Repo` at repository root. The repository was empty when inspected on 14 October 2026; inspect it again before copying.
2. Import that repository into Vercel.
3. Framework preset: **Other**. Build command: **npm run build**. Output directory: **dist**. Node: **24.x**. Root directory: the repository root.
4. Deploy. There are **no required environment variables**.
5. Test the flows in `docs/ACCEPTANCE.md` on desktop and mobile.

`vercel.json` already declares the build command and output directory. Routing uses hashes such as `/#/campaign/phantom`, so no SPA rewrites are needed. All logos, avatars and fonts are local. A ready-built `dist/` is also included in the ZIP.

The separate `CODEX_LAUNCH_PROMPT.txt` tells Codex to inspect the repository, integrate this code, test it, push and deploy it. This package itself does not push or deploy anything.

## Five-minute walkthrough

1. Click **Sign in → Enter demo as Ola**.
2. Open **Phantom**, which has **Strong fit**. Accept the campaign’s demo brief.
3. Click **Try the customer journey**. Complete the four simulated customer steps.
4. Return to the campaign. Inspect **My activity**, **Leaderboard**, Odu and estimated money.
5. Open **Jupiter**, which requires review. Complete the three application questions.
6. Open **Founder sandbox** and approve the application. Jupiter is now available to join without changing the historical profile fit.
7. Open **OpenSea**. The brief is readable but participation is locked for Ola’s sample profile.
8. In **Founder sandbox**, compare 100 sign-ups and one sign-up at the same $1,000 volume. Change the weights and sign-up cap.
9. Use **Simulate next day** to add competitor activity. A participant’s estimate can decrease as others earn points.
10. Finalize a demo campaign. Allocations lock; no money is actually paid.

## Implemented

- Responsive marketplace with search, topic filters and fit labels.
- 1,000 unique deterministic creator profiles, searchable and paginated.
- 32 real-brand illustrative campaign briefs with local logo assets.
- Strong fit: direct acceptance. Weak/limited evidence: application and demo review. Mismatch: participation locked, brief readable.
- Demo sessions and creator switching, with browser-local persistence.
- Campaign leaderboard, rule explanation, outcome ledger and personal rewards.
- Referral link and simulated customer journey in the same browser.
- Pending, verified and rejected outcomes.
- Duplicate-event protection, single attribution, self-referral rejection and prerequisite checks.
- Weighted outcome scoring and cent-exact allocation of a fixed pool.
- Odu progress capped at 256 while underlying contribution remains uncapped.
- Founder weight sandbox, application review, event review, day simulation and finalization.
- JSON ledger export and reset.
- Keyboard focus states, semantic controls, responsive layouts and reduced-motion support.

## Deliberately not connected

**X sign-in is a setup screen, not a fake login.** Actual X authentication needs registered OAuth credentials and a server callback. Connecting an account does not grant permission for every commercial use of X data. No X data or posting API is called here. No OpenAI API is required for synthetic matching.

There is no shared server, production identity verification, fraud detection, real attribution, live AI classification, database or payouts. The founder sandbox is openly accessible because it changes only the local simulation. A demo referral link does not transfer this browser’s state to another device.

See `docs/LIVE_INTEGRATIONS.md` for the production path. Do not turn on real rewards by removing the demo labels.

## Reward model

```text
points = min(verified sign-ups, sign-up cap) × sign-up weight
       + unique qualifying activations × activation weight
       + qualifying volume / 100 × volume weight
       + unique returning customers × return weight

estimated allocation = pool × participant points / all participant points
Odu = min(256, floor(points / 800 × 256))
```

Default weights are **1 / 9 / 10 / 5**, with a **20 sign-up cap**. The founder can change these in the demo. They are illustrative, not validated economics. Odu is campaign-specific and has no fixed dollar exchange rate.

Estimated allocations use the largest-remainder method, with deterministic tie-breaking, so totals exactly equal the pool in cents. A real campaign with zero eligible contributions would allocate nothing. Social engagement is excluded from scoring and payout conditions.

## File map

| File | Purpose |
| --- | --- |
| `src/data.js` | Ten campaign configurations and deterministic 1,000-creator generator |
| `src/engine.js` | Fit, scoring, allocation, event validation and finalization |
| `src/store.js` | Versioned browser-local demo state |
| `src/app.js` | Routes, UI, forms and interactions |
| `src/styles.css` | Responsive design system |
| `public/assets/` | Logos, 24 Nouns avatars, font and source manifest |
| `tests/` | Reward invariants, assets and DOM interaction tests |
| `scripts/` | Dependency-free local server and static build |
| `docs/` | Acceptance steps, model and production handoff |

## Verification

28 tests passed in this environment, plus JavaScript syntax checks and the production build. Tests include the complete creator/founder journey in jsdom and check that every displayed local image path exists.

**A real browser layout/interaction pass was not available in this environment.** jsdom tests do not verify pixel layout, Safari behavior or a deployed Vercel URL. Run the desktop/mobile acceptance checks after deployment. Live X OAuth cannot be tested until credentials and a backend exist.

## Assets

The 24 avatar images reuse official **CC0 Nouns traits** as deterministic illustrative compositions across the 1,000 synthetic profiles. They are not actual owner identities or claimed minted token IDs. Logos are downloaded from official sites, press kits or official repositories. Brand rights remain with their owners. See `ASSET_SOURCES.md` and `public/assets/manifest.json` for provenance. Manrope is bundled under its SIL Open Font License.

## Creator and founder workspaces
The role-based extension starts with a workspace chooser and includes clearly labelled creator, pending-founder, approved-founder and administrator demos. Production registration and private HTTP APIs are deliberately unavailable until real authentication and storage are connected. See docs/WORKSPACES.md for routes, API contracts, data structures, security limitations and the unapplied database schema. The legacy founder sandbox is now restricted to approved founder/admin demo identities.

Portfolio imports add 22 synthetic Recent campaign concepts to the original 10. All imported logo provenance and hashes are in `public/assets/manifest.json`; no imported project is classified as a historical engagement.
