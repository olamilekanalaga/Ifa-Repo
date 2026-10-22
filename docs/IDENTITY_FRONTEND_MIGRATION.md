# Identity frontend migration

Branch: `feature/identity-frontend-migration`. Preview only; no production promotion.

## Inspection and architecture

The repository is a vanilla JavaScript ES-module application with hash routing, shared CSS, a native modal dialog and a static copy build. It is not React. The supplied `ifagrithm-identity-frontend.zip` contains a React prototype; its visual hierarchy and interactions were adapted into the existing application rather than adding another runtime or separate product.

The existing workspace session API reports authentication and database configuration unavailable. Its fail-closed behaviour remains intact. No secrets were read or modified. The existing Vercel project and deployment configuration were retained.

## Screens and routes

| Route | Behaviour |
| --- | --- |
| `/` or `/#/access` | Original gold workspace chooser, avatar choices and moving project showcase |
| `/#/overview` | Overview: Influence is visible. Behaviour tells the story.; Trenches, Traditional Web3 and Hybrid |
| `/#/discover` | Search and economy/participation filters, fictional profiles and evidence disclosures |
| `/#/rankings` | One economy and one dimension at a time; arbitrary demonstration indices, no global composite |
| `/#/identity` | Connection availability, local demonstration inputs, missing evidence and timeline |
| `/#/opportunities` | Conceptual project needs; no verified paying demand or publishing |
| `/#/access/creator`, `/#/access/founder`, `/#/access/signin` | Redirect to Identity |
| `/overview`, `/discover`, `/rankings`, `/identity`, `/opportunities`, `/access` | Same-app aliases, supported by local server and Vercel rewrites |
| `/?legacy=1#/access` | Preserved original campaign onboarding |
| Existing founder, campaign and reporting deep links | Preserved original implementation |

Unknown new routes show a recovery link. The Identity screen is public onboarding, not an authenticated session. Legacy campaign tools continue to use their existing demo/session rules.

## Changed files

- `src/identityModel.js`: six explicitly fictional fixtures, filtering, scoped ranking, routing and isolated local demonstration storage.
- `src/identityUi.js`: five connected views, accessible dialogs, filters, missing-data and loading/error/retry states.
- `src/identity.css`: scoped prototype styling, dark violet palette, local typography, responsive drawer and contrast fixes.
- `src/app.js`: integration into existing router, event handlers, modal and keyboard focus behaviour.
- `index.html`: current narrative, initial loading state and stylesheet inclusion.
- `scripts/serve.mjs`, `vercel.json`: same-app pretty-route aliases; existing API behaviour retained.
- `package.json`: description and syntax checks; no runtime dependencies added.
- `tests/identity.test.mjs`: identity, consent, storage, route, ranking and status checks.
- `tests/journey.test.mjs`: explicitly exercises the preserved legacy journey.
- `README.md` and this document: current direction and delivery notes.

## Preserved

Campaign modules, historical datasets, creator assets, existing IFAGRITHM mark, reference database schema, API boundaries, previous routes and browser campaign state remain. No database migration or data deletion occurred. Existing local Manrope fonts replace the reference's external font dependency. The original light/dark implementation remains available in legacy views; the new identity views intentionally use the requested dark theme.

## Demonstration versus live

All six directory accounts, labels and ranking numbers originate from the supplied fictional prototype. Their indices are arbitrary examples, not measured performance. Three opportunity examples are conceptual needs, not sponsored briefs, partners or funded demand.

Live X and wallet controls are disabled. Separate, explicitly labelled demo inputs accept a public username or public wallet address only with consent. These stay in the browser under `ifagrithm-identity-preview-v1`; entering them makes no provider request and never establishes authentication, ownership, analysis or classification. Tampered local verification flags are discarded. Reset clears only this new namespace. Existing campaign data is unaffected.

No wallet ownership is inferred from social text. No private keys or seed phrases are requested. A supplied public address is not a signed ownership proof. Behavioural classification and confidence remain missing until supported evidence exists. Observable activity is not described as realised profit; influence does not establish conversion attribution. Conceptual opportunities are not transaction-linked incentive programmes.

## Setup and validation

Use Node 24, then:

```sh
npm ci --ignore-scripts
npm run dev
npm run check
```

The repository has no configured lint or TypeScript task. `check` runs JavaScript syntax validation, the full test suite and static build. Dependency install reported zero vulnerabilities at implementation time.

Browser checks cover desktop 1440px and mobile 390px/320px, all five pages, access aliases, filters and empty results, dimension sorting, native-dialog Escape/focus restoration, mobile keyboard drawer, invalid inputs, consent, reload, isolated reset, disabled providers and preserved legacy access. Checked flows emitted no non-GET requests or browser exceptions. Computed text contrast checks found and corrected weak secondary labels and the skip link. The status model covers loading, failure and retry recovery.

## Live integration blockers

Real onboarding requires approved X OAuth access, server sessions, durable permissioned storage and explicit consent management. Wallet ownership needs server-issued nonces and correctly verified, domain-bound signed proofs with expiry and replay protection. Never turn a local public-address field into authentication.

Real classification requires permitted source retrieval, evidence provenance, dated model versions, uncertainty and review. Verify applicable X terms, privacy/retention/deletion requirements and programme/regional eligibility before enabling real collection or commercial programmes. No claim is made that present provider configuration or programme permissions satisfy those requirements.

Production remains unchanged. Use the dedicated preview deployment to review this migration before any separate production approval.

## Restored entry screen

The original gold canopy, three avatar choices and project showcase are the first screen again. Creator, Founder and Sign in continue to the new identity onboarding with disabled live connections. Demo opens the identity Overview without creating a session. The showcase retains its sample/historical disclaimer and pause control. Desktop and 390px/320px flows were checked.
