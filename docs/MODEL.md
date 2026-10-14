# Campaign model implemented

The founder supplies a simulated pool and objective. IFAGRITHM maps that objective to weighted, verifiable product actions. Creators see all campaigns; eligibility determines their next action.

## Eligibility

- Strong: topic signal ≥65 and established sample evidence. Accept the brief directly.
- Weak: topic signal ≥25 but not strong. Apply using product understanding, relevant experience and a distribution plan.
- Locked: topic signal <25. Read the brief but cannot participate.

These are explicit prototype thresholds. They are not empirically validated and do not claim to predict a creator’s audience. An approved weak-fit participant earns under exactly the same outcome rules.

## Interest and participation

Eligible does not mean enrolled. Acceptance records intent and agreement to the brief. Weak-fit applications request reviewed participation. The demo founder approves or declines locally.

## Contribution

The seeded profiles have illustrative historical outcomes. New demo events follow a customer journey: sign-up → activation → optional volume and retention. Each customer milestone counts once, and each customer belongs to one creator per campaign. Volume events have idempotency IDs but need stronger evidence in production.

Default weights:

| Outcome | Weight |
| --- | ---: |
| Sign-up, capped at 20 per creator | 1 |
| Qualifying activation, once per customer | 9 |
| Every $100 qualifying volume | 10 |
| Return milestone, once per customer | 5 |

At zero volume, ten sign-ups equal one sign-up plus one activation. At equal $1,000 volume and one activation, 100 sign-ups earn 129 points; one sign-up earns 110 points. The 17.3% difference rewards breadth while keeping useful activity dominant in this example.

The founder sandbox exposes the weights and cap, so Ola can explore different economics. The sign-up cap is a prototype choice, not a required permanent strategy. Different businesses need different event definitions and values.

## Pool allocation

Reward share is the creator’s verified contribution divided by all eligible verified contribution. Convert the pool to cents, floor proportional allocations, then allocate leftover cents to the largest fractional remainders. Deterministic ranking resolves ties. This exactly conserves the pool.

An estimate can fall even while the creator’s own contribution grows, if others contribute faster. The interface uses “estimated” until finalization. The demo does not offer withdrawal or send funds.

## Odu

Each campaign grants progress from 0 to 256 Odu. The default mapping reaches 256 at 800 points. The score continues to grow beyond this cap; money is never allocated using capped Odu. Odu is not transferable, a token, an investment or a fixed exchange rate.

## Data boundaries

The 1,000 identities, topic signals, follower counts, brand campaigns, budgets, evidence themes, outcomes and rewards are synthetic. Real logos only identify illustrative brands. No post excerpts, actual NFT owner identities or fake on-chain transactions are presented as verified data.
