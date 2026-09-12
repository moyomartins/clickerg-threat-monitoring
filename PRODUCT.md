# Product

<!-- impeccable:product-schema 1 -->

<!-- Product truth confirmed with the user. The audience, scope, data and accessibility
     fields were answered directly in the init interview; everything else is sourced from
     the user's original written brief and the implemented code. -->

## Platform

web

## Users

**Two primary users, equally weighted: the agency PPC manager and the in-house marketer.** Both are paying for clicks and suspect some of them are not real. They arrive at Threat Monitoring in one of two situations: something in the account looks wrong (spend up, conversions flat), or they have been told they are protected and want to see the evidence.

- **The agency manager** works across multiple client accounts and often opens this screen *for* someone else — sometimes with the client on the call. Their use implies account switching and evidence that survives being forwarded to a third party.
- **The in-house marketer** owns one company's spend end to end and knows their own campaigns and keywords cold. Their use tolerates higher density and less hand-holding.

Future work serves both rather than optimizing for one.

**The language bar is set by the third user, not the primary two.** Every explanation is written to the standard an owner-operator with limited PPC vocabulary could follow — the hardest case, and the one that covers the other two for free. A sentence an agency manager finds slightly plain is a far cheaper error than one a business owner cannot parse.

The decisive constraint behind all of it: the user is being asked to trust an invisible mechanism. Blocking happens inside Google Ads and Meta Ads exclusion lists, so from the advertiser's seat a working product and a broken one look identical — traffic simply disappears. Every screen is therefore evidence, not reporting.

## Product Purpose

ClickerG is click-fraud protection for PPC advertisers. When someone clicks a paid ad and lands on a customer's site, ClickerG scores that visit against behavioral signals. When a visitor's pattern crosses the line, their IP is added to an exclusion list in Google Ads or Meta Ads and they stop seeing the advertiser's ads.

ClickerG is a real product under active construction, and Threat Monitoring is one surface of it. Further surfaces are expected — dashboard, campaign settings, tag installation, reporting — so the design system, vocabulary and interaction patterns established here are load-bearing for screens that do not exist yet, and are chosen accordingly rather than tuned to this screen alone.

Threat Monitoring is the surface where the invisible decision becomes inspectable. Its job is a specific moment: a customer opens one blocked visitor, reads the journey, and concludes *this thing knows what it is doing* — without contacting support. Success is that conclusion being reached unaided. Failure is a support ticket asking why an IP was blocked.

## Positioning

The mechanism a neighboring product could not truthfully copy is **cumulative, journey-level judgement, shown in full**.

- A visitor is an IP; each arrival is a visit; the same IP can return over days or weeks.
- The block is a function of the whole journey, not of any single visit. The detail view exists to show *when in the journey* confidence crossed the line, not merely that it did.
- Not every visit is paid. Visits can be paid, organic, direct or referral, and only paid visits cost the advertiser money. That distinction is visible and filterable throughout.
- Ambiguity is disclosed rather than smoothed. A visitor with real revenue and robotic timing is presented as a judgement call the advertiser gets to make, not resolved into false confidence.

## Operating Context

The advertiser's real workplace is Google Ads and Meta Ads. ClickerG's output lands there, as IP exclusion lists, which means the product is judged on money: cost per click, spend behind blocked traffic, conversions and their value. Timeframes are campaign timeframes — last 24 hours, last 7 days, last 30 days — and traffic arrives as journeys, not as rows.

Evaluation happens under suspicion. The user is often already unsure whether the product is working, so the screen is read adversarially: plausible-looking summaries are not enough, and a claim without the evidence behind it makes things worse.

## Capabilities and Constraints

Confirmed and implemented:

- Two levels: a **visitor list** — in Replay, a grid of cards rather than a table, each card reading verdict (IP and status) → plain-language reason → supporting facts (location, visit count, paid mix, spend, time-ago) → the drawn replay of the visitor's most recent reporting arrival — and a **visitor detail** (a hero replay, the verdict, then every arrival replayed in a horizontally scrolling strip with per-arrival signals and running confidence, and the plain-language notes stacked beneath).
- **The card's order is the advertiser's order, and it is load-bearing.** The list is scanned before it is read, so the determination and its one-line reason come first and the evidence sits beneath them. A settled call (blocked, not blocked) states its reason plainly; a judgement call, an under-review or an incomplete visitor keeps its reason visibly unsettled rather than borrowing a blocked card's certainty. Manufactured confidence is the specific failure this ordering exists to prevent.
- **Sorting is an explicit control, not a table header.** The list has no header row to click, so sort key and direction live in the filter bar, where the direction toggle reads as part of the Sort by control rather than a peer of it.
- Working sort, filter, search, and drill-down navigation with real back behavior; loading skeletons, an empty state for filtered-to-nothing, an empty state for zero data, a load-error state, and an incomplete-data state.
- **Baseline signals:** IP, location, interaction level, bot probability, VPN/proxy, form-fill email deliverability, conversion.
- **Engagement is now load-bearing for the interface, not just for scoring.** `scrollPct`, `dwellSec`, `clicks` and `mouseMoves` are what the replay renders. Any change to how the tag records them changes what the product can honestly show, so they are a product constraint rather than an implementation detail.
- **Extended signals:** click cadence, device-fingerprint reuse, session-to-session similarity, time-of-day clustering, UTM/referrer consistency — plus ad platform, campaign, keyword and click cost as context on every paid visit.
- **The scoring model generates its own explanations.** `src/data/scoring.ts` produces both the number and the advertiser-facing sentence from the same rules, so the stated reason cannot drift from the arithmetic. Thresholds: block at 80 and never before 3 paid clicks; review from 50; a visitor who is both suspicious and converted is held as a judgement call rather than blocked.
- **Design tokens live in one shared package.** `@clickerg/ui` is an npm workspace consumed by both the app and Storybook; there is no Storybook-only copy of any component, and nothing in `src/` hardcodes a color or a spacing value.
- **Data stays mock, and no backend is planned for now.** `src/data/` is the source of truth. Future work does not design around pagination, real latency, partial failure or large-volume constraints that do not exist, and does not introduce them speculatively.
- **The mock data must read as real traffic, not as a demo.** Click costs, campaign and keyword names, timing distributions, geographic spread and journey shapes are tuned toward what a real PPC account actually looks like. Obviously synthetic values — round numbers, evenly spaced timestamps, placeholder campaign names, implausible cost-per-click — undermine the one thing this surface exists to do, which is read as evidence. This is a standing requirement on the data, not a one-off cleanup.
- Money is displayed in **GBP (£)**. This is an implementation convention, not a user-confirmed requirement.
- Further surfaces are expected (see Product Purpose), so patterns introduced here are chosen for reuse rather than for this screen alone.

## Brand Commitments

- **Name:** ClickerG. The masthead reads "ClickerG · click-fraud protection".
- **Logo mark: confirmed rights, in use.** The masthead renders a vector wordmark (`@clickerg/ui`'s `Wordmark` component, `packages/ui/src/Wordmark.tsx`), recolored to `--cg-ink` to match DESIGN.md's palette. The user confirmed the company holds rights to this mark. Note: the mark's own lettering reads "ClickGuard", not "ClickerG" — it renders next to the "· click-fraud protection" tagline rather than replacing the product name used everywhere else (page title, browser tab, this document). This was flagged and confirmed explicitly before implementation; not an oversight.
- **Visual system: Replay.** Confirmed by the user after a sixteen-direction exploration. The visitor's behaviour is drawn on a wireframe of the page they landed on — scroll depth shaded on the page, mouse movement and clicks read out beneath it as a meter and a tally, and absence of behaviour drawn explicitly as a bordered marker. Near-white ground, no radius, no shadow; blue means behaviour was recorded and red means it was not. Manrope for language, Fira Code for anything measured. Recorded in full in DESIGN.md and its sidecar, and not reopened by ordinary work.
- **Superseded and replaced in code.** The warm cream-and-charcoal system ("The Case File") was the binding commitment until this decision. Replay is now implemented in `src/` and `@clickerg/ui` and is what ships; the Case File world survives only in git history and in the preview gallery. It is not a constraint on new work and is not design authority.
- **The evidence drawn must be real** — a brand commitment, not a technical note. A product whose entire premise is showing what a visitor actually did cannot draw a mouse path or a click position it did not record. The tag records `scrollPct`, `dwellSec`, `clicks` and `mouseMoves`: depths and counts, not coordinates.

  **This is now enforced in the implementation.** Scroll depth is drawn *on* the page because it is positional data. Mouse movement and clicks are read out *beneath* it as a meter and a tally, because drawing them would mean inventing coordinates. The first build of Replay did synthesize a mouse polyline and click positions from a seed; that violated this commitment and was removed. If the tag ever captures coordinates, they may be drawn — until then, nothing positional is invented, and the labelled absence carries the argument.
- **Voice:** advertiser-facing, plain, and unhedged. The product explains itself in money and behavior ("nine paid clicks in one night, no scrolling on any of them, £37.80 with nothing behind it"), never in model vocabulary. Where the evidence is genuinely mixed, it says so.

## Evidence on Hand

- **All traffic data is invented.** 53 seeded visitors in `src/data/mock.ts`, including three pinned cases: `41.203.88.7` (unambiguous click farm), `82.14.90.221` (real conversion, robotic cadence — the honest tie), `178.62.40.9` (our own tag stopped reporting).
- **There are no real customers, testimonials, case studies, benchmarks, press, pricing, or detection-accuracy figures.** None exist and none may be fabricated. Any future surface that would need social proof or accuracy claims needs real material first.
- A logo mark now exists and ships in the masthead (see Brand Commitments); it is a vector wordmark, not set in type.
- Working code is itself evidence: `README.md`, the `@clickerg/ui` Storybook, and a 51-test suite covering the scoring model and every story, with axe running at `error` severity so an accessibility violation fails the build.

## Product Principles

1. **The explanation is the product.** Blocking is invisible, so a decision the advertiser cannot follow has not been delivered. Anything that states a verdict must carry the evidence that produced it.
2. **Explain in money and behavior, never in model — at the plainest user's reading level.** Spend, clicks, scroll, timing, conversions. No scores presented as self-justifying, no engineering vocabulary on the advertiser's side of the screen. The bar is what an owner-operator could follow, not what an agency specialist could decode.
3. **Show the journey, not the verdict.** Cumulative decisions are only trustworthy when the accumulation is visible. Mark where the line was crossed.
4. **Disclose ambiguity instead of resolving it.** Mixed evidence is presented as a judgement call with both sides stated. Manufactured confidence is the fastest way to lose the trust this surface exists to earn.
5. **Missing data is a state, not a clean result.** A signal that never arrived is shown as not captured and excluded from scoring. It is never rendered as though it passed.

## Accessibility & Inclusion

**WCAG 2.2 AA is a binding commitment, enforced in the build.** Confirmed with the user, and true of the shipped Replay implementation: axe runs at `error` severity across every story, so a violation fails `npm test`; keyboard focus is visible on every interactive element, including the replay cards, which are keyboard-operable; and severity is never carried by colour alone — status is border weight and style as well as hue.

Three preview colours failed and were corrected when Replay was implemented: muted text `#78808e` → `#626975` (was 3.42:1), caution `#8a6a1e` → `#82641c` (was 4.34:1), and the behaviour blue split into `#3b82f6` for graphics (3.16:1, clears the 3:1 bar) and `#0b5fe9` where it carries text. Splitting rather than collapsing the blue keeps the direction's character without costing contrast. The in-frame marker type was raised from 8.5px to a 10px floor.

Two semantics were added while recomposing the controls and are worth keeping: each filter cluster is a labelled `role="group"`, so the bar announces what kind of control you have entered rather than reading as one long undifferentiated run; and the paid-clicks filter is a `role="switch"` checkbox whose on/off state is carried by the thumb's position *and* its fill, so it survives colour removal. The card hierarchy raised type rather than lowering it — every size on a visitor card went up or stayed level.

Recording it as binding formalizes the existing bar rather than raising it. Future work may not trade it away for a visual result — a design that cannot clear AA is the wrong design, not an accepted exception.
