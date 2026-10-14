# Acceptance checks

## Automated

Run `npm ci && npm run check` on Node 24. This installs the pinned development dependencies, checks syntax, runs the engine/assets/DOM tests and builds `dist/`.

## Browser and Vercel smoke test

Use a desktop viewport around 1440px and a mobile viewport around 390px. Check Safari on an iPhone if available.

1. The public URL loads ten campaigns, all logos and the embedded font without 404s.
2. Demo sign-in works. X sign-in explains that OAuth is not configured; it never requests passwords.
3. Strong-fit acceptance, weak-fit application and locked-fit participation states are distinct.
4. Application answers persist after refresh. Founder approval makes the campaign available.
5. The customer simulation blocks activation before sign-up and volume/return before activation.
6. The customer’s four actions appear in the outcome ledger and update Odu and estimated allocation.
7. Repeating the same milestone cannot credit it twice. Pending/rejected events earn nothing.
8. Leaderboard search and pagination work. The directory has 1,000 unique profiles in 42 pages at 24 per page.
9. Switching demo creators changes campaign fit and preserves other creators’ local progress.
10. Changing the founder weights updates comparison and all allocations. The pool total still matches exactly.
11. Simulate next day; inspect how competition changes estimates. Finalization prevents later event/rule changes.
12. JSON export downloads the selected creator’s ledger. Reset clears only this demo’s local state.
13. Refresh a campaign hash URL and a referral hash URL. Both render correctly.
14. Dialogs are usable by keyboard and Escape. All buttons have visible focus states. The table can scroll horizontally on small screens without making the entire page overflow.
15. There are no console errors or failed local asset requests. Demo labels and the absence of real payments remain clear.

The referral demo is same-browser only. Opening a copied link on a different device will not reproduce locally accepted membership or events. Production requires a shared backend.
