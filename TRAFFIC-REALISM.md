# Deterministic traffic implementation

The application now contains 77 visitors and 572 arrivals. Existing journeys were retained and normalized; 24 authored scenario variations were added. All displayed IPs are fixtures from 192.0.2.0/24 and 203.0.113.0/24. Original identifiers remain searchable aliases and working detail links. City, country and network observations are explicitly mock metadata, never live IP lookups.

## Distribution

| Current status | Visitors |
|---|---:|
| Blocked | 14 (13 automatic, 1 manual) |
| Not blocked | 42 |
| Under review | 12 |
| Judgement call | 4 |
| Incomplete | 5 |

| Arrival source | Arrivals |
|---|---:|
| Paid | 360 |
| Organic | 81 |
| Direct | 77 |
| Referral | 54 |

| Arrivals per visitor | Visitors |
|---|---:|
| 1 | 4 |
| 2–4 | 21 |
| 5–10 | 37 |
| 11–25 | 12 |
| Over 25 | 3 |

## Reference journeys

| Scenario | Visitor IP |
|---|---|
| Repeated paid abuse, decision, pending arrival, confirmed exclusion, direct returns | 192.0.2.2 (legacy 41.203.88.7) |
| Existing conflicting conversion and timing case | 192.0.2.1 (legacy 82.14.90.221) |
| Entirely missing engagement | 192.0.2.3 (legacy 178.62.40.9) |
| Legitimate repeat shopper, paid/free mix and direct conversion | 203.0.113.1 |
| Legitimate consumer VPN/shared-network journey | 203.0.113.8 |
| Suspicious but only two paid arrivals | 203.0.113.3 |
| High-engagement free traffic | 203.0.113.4 |
| Tracking reports, then stops; unknown bot probability | 203.0.113.5 |
| Verified conversion followed by conflicting automation evidence | 203.0.113.6 |
| Manual exclusion despite an allowed automated recommendation | 203.0.113.2 |

Use Storybook → Traffic → Reference journeys for eight real application detail views. These import the canonical dataset and VisitorDetail; no simplified duplicate journey is used.

## Clock and generation

The original generator seed remains 4242. Historical authored seeds remain 1001, 2002 and 3003; additional scenario seeds are 8000–8023. `buildVisitors()` is deterministic. `src/data/clock.ts` freezes the account snapshot at 2025-08-15 09:00 UTC. Fixtures, relative labels and date filtering use that same demo clock. Wall-clock passage cannot empty the recent window or reshuffle fixtures. This is an intentionally frozen historical account, not a claim that the traffic happened today.

Journey timestamps are sorted before scoring. New fixtures have irregular arrival gaps and independently varied age/span, including last-seen records beyond 30 days. Existing local arrival-date formatting is unchanged.

## Corrections

- Automatic decisions only consider conversion evidence already recorded at the time. A later conversion cannot retroactively erase an earlier block.
- Block summaries and hero reasons use the decision prefix; later signals cannot explain an earlier action. Whole-history financial totals are explicitly described as such.
- Automatic threshold 80, review threshold 50 and minimum three paid arrivals are unchanged. The existing conversion-conflict hold is retained. This remains a demo policy, not a newly calibrated detector.
- Exclusion request and confirmation timestamps are separate canonical events. Pending paid arrivals carry an explicit reason in contextual explanations. The malicious reference has confirmed platform exclusion followed only by direct arrivals. Platform state says Pending (mock) or Confirmed (mock), rather than implying success from icons.
- First-visit similarity and fingerprint counts no longer borrow future sessions; overnight clustering requires prior observed hours to agree.
- Repeated-click cadence requires recorded multiple clicks and enough dwell time. Missing engagement cannot retain a made-up click cadence. Submitted email results have an explicit form-submission observation.
- Google display campaigns and Meta arrivals no longer receive search keywords. Free visits carry no cost, campaign or keyword. Paid records include a landing page.
- GBP fields remain compatible with the existing interface; aggregate spend/revenue sum rounded integer pence before converting back to GBP. Revenue requires a recorded conversion.
- Missing bot probability is null, missing form state is unknown, and conversion capture is explicit. Recorded zero and no form submission remain separate states.
- Contextual confidence movement uses the actual before/after journey score, rather than treating a raw signal delta as the cumulative score change.
- Legitimate conversions no longer automatically receive copy claiming suspicious timing. Review copy no longer predicts that one or two clicks will inevitably trigger a block.
- Manual overrides preserve automated status, scoring, original arrivals and a separate timestamped history; successive UI decisions append to that history.

## Filters to try

- Under review + Last 24 hours + minimum bot probability 75: insufficient-evidence cases.
- Not blocked + United States + paid clicks only: legitimate mixed-source repeat visitors.
- Search 203.0.113.5 with Any, then 25: unknown probability disappears only at the positive threshold.
- Search uk-brand-exact + paid clicks only, then sort by spend or visit count.
- Last 30 days versus All time: older scenario variations appear only in All time.
- Minimum probability 100: intentionally returns the normal filtered-empty state; no fabricated certainty.

Paid-clicks-only means a visitor has at least one paid arrival. It never removes free arrivals from that visitor's detail journey. Bot probability thresholds use the highest known visit bot probability, not decision confidence. Exact 25%, 50% and 75% maximum-probability fixtures exist.

## Verification

153 tests pass, including chronological order, monetary reconciliation, scenario/length coverage, score alignment, missing versus zero, minimum paid evidence, mixed-source decision numbering, future-evidence leakage, exclusion timing, manual history, filter boundaries/combinations, date windows, aliases and deterministic regeneration. Eight added Storybook journeys pass their rendering checks and configured axe accessibility checks. Type checking, app build and Storybook build pass. Lint has the pre-existing set-state-in-effect warning in App.tsx.

The live application reports 77 visitors and 360 paid arrivals. The approved layout, control components, styles, icons, replays and animation were not edited. The production CSS asset is unchanged. Existing documented narrow journey-grid overflow and visitor-list article-role accessibility issues remain outside this data task; the reference-detail stories do not establish that the full visitor-list accessibility gap is fixed.

## Files changed by this task

- src/data/types.ts — observation, manual-history and platform-event types.
- src/data/mock.ts — retained/normalized journeys and authored variations.
- src/data/clock.ts — shared fixed demo clock.
- src/data/scoring.ts — skip unknown probability; numeric thresholds unchanged.
- src/data/manual.ts — preserve automated evidence and append manual decisions.
- src/data/mock.test.ts — updated dataset size and automatic/manual expectations.
- src/data/realism.test.ts — deterministic data/decision/filter regression coverage.
- src/filters.ts — canonical visitor filter predicate, unknown handling.
- src/VisitorList.tsx — shared predicate and truthful paid/free introduction.
- src/App.tsx — legacy alias routing and manual history.
- src/arrival.ts — unknown presentation, actual cumulative movement, pending-arrival explanation.
- src/arrival.test.ts — legacy fixture alias lookup.
- src/decision.ts — decision-prefix hero copy and manual timestamp.
- src/decision.test.ts — alias lookup and manual decision distinction.
- src/heroFacts.ts — platform event state.
- src/journeySummary.ts — truthful conversion/manual copy.
- src/journeySummary.test.ts — legacy fixture alias lookup.
- src/format.ts — import shared clock.
- packages/ui/src/TrafficJourneys.stories.tsx — eight actual app reference journeys.
- TRAFFIC-REALISM.md — this report.
