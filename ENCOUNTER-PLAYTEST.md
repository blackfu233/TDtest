# Encounter Combat and Rewards Playtest

Current build: `encounter-risk-reward278`.
Economy identity: `encounter-rtp-candidate-278`.
This is an RTP candidate under validation, not an approved release.

## Risk and Reward Revision 278

- Regular cards show estimated no-damage rate instead of a misleading survival rate.
- Neutral grade baselines are 86% / 68% / 50%; attribute countering and role readiness
  apply bounded visible adjustments without changing the selected encounter.
- The four regular chest tiers keep their V274 mean POT while using wider, low-skewed
  distributions. Even the normal chest now has a small chance to profit on that wave.
- At BET 100 and 1x, tier 1-4 payout ranges are 2-137 / 15-183 / 36-206 / 72-320 POT;
  rounded mean POT remains 36.48 / 63.15 / 104.87 / 173.26.
- The tuner exposes the distribution shape and calculates the same mean and profit chance
  as the game. BOSS escort rewards remain uniform and the exclusive chest remains multiplier-only.
- A 1,000-run exploratory adaptive-strategy sample produced 98.09% RTP, 16.2% 2x wins and
  1.3% 5x wins. This is directional evidence, not a formal certification.

## Wave Settlement Revision 277

- Regular and BOSS escort kills reserve their POT instead of incrementing the HUD per enemy.
- A successful wave credits the reserved kill POT and clear bonus once. Final payout math is unchanged.
- BOSS-exclusive chests still award multiplier only; escort POT is identified as wave loot.
- Cards label their percentage as an estimate. Values at or below 50% are red, 51-74% are yellow,
  and values at or above 75% are green.

## Decision Hierarchy Revision 242

Restore the original stacked actions: a full-width, 72-pixel minimum-height
Continue button above the smaller, centered Collect button. Both amounts remain
visible and both actions remain directly operable. Retain the wave receipt and
the presentation sequencing fixes, without moving or scaling either button.
This is a layout-only revision; combat, rewards, wagers and settlement are unchanged.

## Campaign Revision 241

- Five BOSS encounters remain the goal, with each zone lasting 7-14 waves.
- BOSS HP uses ordinal factors 1.10 / 1.65 / 2.25 / 2.90 / 3.60 against
  its species base HP and difficulty/archetype modifier. It no longer also
  multiplies the old 30-wave HP curve and legacy BOSS HP growth.
- After wave 4, prototype regular/escort HP growth is
  `min(5.5, 1.26 + (wave - 4) * 0.105)`, before formation/class modifiers.
  The legacy mode's HP tables and parameter defaults are not changed.
- Clearing a BOSS and entering the next zone repairs up to 35% of maximum
  base HP, capped at maximum HP. The actual repair is displayed separately
  from that wave's damage. It does not alter POT or multiplier.
- Chest tiers 1/2/3/4 grant 0/90/220/350 extra clear EXP, scaled by `expMul`.
  Kill EXP is unchanged. The extra award is once per cleared wave, never on death.
- Default prototype BET is 50 with the existing 10,000 demo wallet. Player BET
  selection and the existing BOSS/depth bet increases remain available.
- The post-wave receipt shows actual new POT, base damage, clear EXP and repair.
  It waits for chest/BOSS rewards, BET-up and zone presentation to finish.
- Battle rendering begins below the HUD, without changing combat coordinates.
  EXP stays on one line. Continue and Collect are stable, equal-sized controls.
- BOSS card assets preload on zone entry; cards become selectable only after
  their images decode. A choice is locked immediately against double selection.

These changes are a gameplay judgment, not proof that unfamiliar players will
find the game fun. The intended loop is to preserve HP on safe encounters,
take a suitable risk for rewards/strengthening, and prepare for the zone BOSS.
No hidden win-rate target or player-state compensation is used.

## Combat Contract

- Each regular offer contains three distinct formations and threat grades 1, 2, 3.
- Threat grades change actual enemy health, attack, count and spawn cadence.
  Each card shows a current-build no-damage estimate derived from its grade,
  attribute match and role readiness; it does not preselect the outcome.
- Formation determines the actual roster: swarm = batches of weak melee units;
  rush = fast melee batches; armor = fewer durable tanks; siege = ranged attackers;
  elite = one elite leader followed by a small escort.
- Card portraits, attributes and advertised counts match the spawned roster.
- Grades and rewards do not change to compensate for the player's build or HP.
  Existing attribute counters and tower upgrades remain in force.

### Pressure Revision 240

Regular-wave threat now ramps its positive HP/attack bonuses by wave only:
85% in wave 1, 90% in wave 2, 95% in wave 3, 100% from wave 4 onward.
It does not react to current HP, equipment, previous wins or awards.
The already-durable armor and elite templates no longer receive the excessive
239 HP/attack stacking. Reward bands, attribute multipliers (1.50 counter,
0.70 same-element resistance), and BOSS combat settings are unchanged.

Elite cards identify the leader and escorts separately, keep the attribute and
reward artwork unobstructed, and remain distinct from full-size BOSS cards.

## Reward Contract

At equal paid wave BET, 1x cumulative multiplier and the default `moneyMul = 1`:

| Chest tier | POT / BET range | Mean POT / BET | Single-wave profit chance |
| --- | --- | --- | --- |
| 1 | 0.023-1.368 | 0.365 | 10.3% |
| 2 | 0.160-1.824 | 0.632 | 23.7% |
| 3 | 0.365-2.052 | 1.049 | 48.6% |
| 4 | 0.730-3.192 | 1.733 | 78.1% |

Regular threat grades 1/2/3 use chest tiers 1/2/3 respectively, with a 10% one-tier
upgrade chance. All BOSS cards use exclusive BOSS artwork and a multiplier-only chest.
The total reward is rolled once on wave commitment. Kills reserve up to 60%; clearing
the wave credits the reserved amount and remaining 40% to POT once. Integer rounding
reconciles to the same total, so this presentation change does not alter RTP.
Before commitment, each regular card shows the full-wave POT range for its already
selected chest tier and current paid BET. BOSS cards show the possible multiplier
increment instead of presenting escort POT as the main reward.
These are POT increments, not cashout multipliers or RTP. The existing cumulative
BOSS multiplier still applies at settlement. Existing at-risk POT loss on death
is unchanged; a failed wave grants no clear bonus.

The legacy math engine is bypassed only when `ENCOUNTER_DRAFT_PROTOTYPE` is true.
Its parameter defaults remain intact. Existing reports are not rewritten.
Upgrades cannot reprice or remove this prototype's committed wave reward.

## Verification

Run `node --test tests/encounter-contract.test.cjs` for twelve deterministic contract
tests covering roster/card parity, pressure ordering, reward conservation,
upgrade stability, the fixed opening ramp, cashout idempotence, death ordering
and BOSS-exclusive assets, ordinal growth, clear EXP/repair and default route funding.

Run `node tests/playtest-campaign.cjs campaign.json` for continuous campaigns.
Optional environment variables: `CAMPAIGN_SAMPLES`, `CAMPAIGN_SEED`,
`CAMPAIGN_BET_INDEX` (2 = BET 50, 3 = BET 100).
Run `node tests/playtest-browser.cjs browser-output` with Playwright and installed
Chrome for actual UI play through two BOSS encounters or a defeat, then settlement.
`QA_URL` can target the deployed game. This does not inject combat wins or HP.

### Revision 241 Campaign Checks

Two 60-campaign cohorts, BET 50 / wallet 10,000; each includes five heroes,
four seeds per hero/policy. Seeds are `621000 + n*173` and `837100 + n*173`.
All use the actual 60 Hz game engine and the same visible-info upgrade heuristic.
Only normal in-game BOSS repair is allowed; there is no external HP reset.

| Illustrative policy | Five BOSS clears, cohort A | Five BOSS clears, cohort B |
| --- | --- | --- |
| Always safe | 14/20 | 15/20 |
| Matchup/reward heuristic | 6/20 | 8/20 |
| Always high risk | 7/20 | 6/20 |

No bankroll exits or timeouts occurred in these 120 campaigns. These are small
diagnostic samples, not human success rates, optimal strategies or RTP estimates.
The matchup heuristic trades survival for rewards; it is not established to be
better than always-safe or always-greedy play.

For **cleared regular waves only** in cohort A, mean new POT / paid wave BET
was 0.549 / 1.173 / 3.050 for the three policies above (736 / 453 / 408 waves).
Those conditional figures exclude failures and BOSS waves; they are not RTP or
whole-run returns. They show the reward contrast, not a profit guarantee.

At the former BET 100, matched-seed 240 -> 241 first-BOSS clears changed from
8 -> 19 (safe), 4 -> 15 (matchup), 0 -> 11 (greedy), each out of 20.
241's long runs then hit the old demo-wallet limit in 22/60 cases, motivating
the new lower default BET rather than changing the approved bet escalation.

Visual checks cover 320/360/390-pixel mobile widths and a 1440-pixel desktop,
including all five elite attributes, full BOSS cards, image loading and overflow.

### Revision 240 Checks

Using the same fixture allocation and seeds as 239 (150 trials per wave/lane):

| Independent fixture | Threat 1 | Threat 2 | Threat 3 |
| --- | --- | --- | --- |
| Wave 1 clear rate | 100.0% | 100.0% | 94.0% |
| Wave 4 clear rate | 100.0% | 99.3% | 88.7% |

A separate fresh-seed validation batch (also 150 trials per wave/lane):

| Independent fixture | Threat 1 | Threat 2 | Threat 3 |
| --- | --- | --- | --- |
| Wave 1 clear rate | 100.0% | 99.3% | 90.0% |
| Wave 1 mean HP loss | 2.9 | 104.1 | 293.7 |
| Wave 4 clear rate | 100.0% | 99.3% | 74.7% |
| Wave 4 mean HP loss | 0.1 | 89.0 | 467.2 |

HP starts at 1,000 for each independent fixture. HP-loss figures include failures
and any overkill. These are not cumulative multi-wave survival probabilities.
The seed-to-seed change in the dangerous group shows why the formation/attribute
mix matters; difficulty is not calibrated to a hidden pass-rate target.

A separate controlled diagnostic held hero, neutral enemy stats, formation and
initial seed constant across 120 triplets, changing only that hero element's
damage multiplier. Dangerous armor/elite first-wave fixtures with first-offer
upgrades cleared 78/120 at 0.70, 111/120 at 1.00, and 120/120 at 1.50.
This synthetic diagnostic verifies that counter damage has an observable effect;
it is not a claim that naturally favorable cards guarantee success.

### Historical Revision 239 Check

Independent combat fixtures used the actual game engine at 60 Hz with five heroes,
full initial HP, matched seeds per lane and first-offer upgrade selection. Wave 4
fixtures started with the same blade/grenade loadout. Validation used 150 trials
per wave/lane, 900 trials total, with no timeouts:

| Independent fixture | Threat 1 | Threat 2 | Threat 3 |
| --- | --- | --- | --- |
| Wave 1 clear rate | 100.0% | 89.3% | 48.0% |
| Wave 4 clear rate | 100.0% | 80.7% | 60.0% |

The pre-change comparison fixture had 100% clear rates in all six groups.
These limited fixtures demonstrate a measurable pressure difference, not final
balance, full-run survival, production pass probabilities or long-run RTP.
Longer-term balance, player skill advantages and unfamiliar-player comprehension
still need broader playtesting. Artwork itself was not redesigned in this change.
