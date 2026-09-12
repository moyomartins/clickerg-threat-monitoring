# ClickerG — twenty-six design directions (preview only)

Throwaway exploration. **Nothing here is imported by the product.** `previews/data.js`
is a hand-copied snapshot of the production content, not an import from `src/`.

```bash
npx vite previews --port 5199   # → http://localhost:5199
```

Tabs across the top switch direction; the two buttons at right switch between the
**visitor list** and the **drill-down on the click farm** (`41.203.88.7`). Left/right
arrow keys also move between directions.

## Same story, six tellings

Every direction renders identical content: the same ten visitors including the three
pinned cases (the click farm, the honest tie at `82.14.90.221`, the tag-stopped-reporting
case at `178.62.40.9`), the same signals, the same verdict copy, the same five journey
entries with the block landing at visit 3. The product principles hold across all six —
explanation-is-the-product, money-and-behaviour language, disclosed ambiguity, and
missing-data-as-a-state. Only the design varies.

*One deviation, disclosed:* two grammar fragments in the production per-visit notes read
"it the same browser fingerprint…" and "it the tracking parameters…". Repaired here rather
than reproduced six times. The defect is in `src/data/scoring.ts` and is flagged separately.

## The twenty-six

| # | Direction | Layout | Palette | Typography |
|---|---|---|---|---|
| 1 | **Safelight Bay** | Contact-sheet card grid; full-bleed detail with the journey hung on a drying line, horizontally scrolled | Darkroom black `#140f0c`, safelight amber `#ff7a2f`, warm paper `#f0e2cd` | Instrument Serif display / Archivo UI / Courier Prime data |
| 2 | **Developer Console** | Dense table with a left view rail; split-pane detail — narrow list left, expandable log right | Graphite `#16181d`, hairline seams, syntax accents (green / blue / orange / red) | JetBrains Mono throughout, Public Sans for prose only |
| 3 | **Notation Score** | Timeline-first: each visitor is a vertical staff in a scrolling score; detail is one staff read upward, newest at top | Bone `#f4f3ef`, ink `#14140f`, one signal red for the threshold | Antonio condensed caps / Lekton data / Source Sans 3 body |
| 4 | **Emission Rail** | Every row registers against one off-centre rail at 38%; detail is a right-hand drawer over the dimmed plate | Charcoal `#0f1113`, spectral hairlines; **state is line weight, dash and doubling — not hue** | Martian Mono data / Barlow Semi Condensed labels |
| 5 | **Orizuru Sequence** | Folded-sheet card grid; detail is a numbered fold sequence, flat geometry taking shape | Washi `#f7f2e7`, vermilion `#d93a1f`, sumi `#1d1a17` | Shippori Mincho display / Zen Kaku Gothic New body |
| 6 | **Iridescent Edge** | Soft banded rows; detail is a centred modal over a blurred list | Pale `#eef1f5` with a diffraction wash; **severity is spectral position** — the edge hue is computed from confidence | Petrona serif headline / Hanken Grotesk body |

### Added in the second round (7–12)

| # | Direction | Layout | Palette | Typography |
|---|---|---|---|---|
| 7 | **Ledger Book** | Double-entry register with a running balance column; detail is an account statement, each visit posted as a numbered item | Green bar paper `#dfe7dc` banding on `#eef1e8`, black ink, ledger red `#8f2723` | Zilla Slab headlines / Encode Sans Condensed data |
| 8 | **Field Chart** | Geography leads — origins plotted on a navigation graticule above a chart index; detail pairs a single-origin plot with an arrival log | Navy `#0d2137`, chart cyan, pin orange `#ff6a4d` | Saira Condensed / Sometype Mono |
| 9 | **Quiet** | One 68ch column, no chrome, no table — the list is prose and the detail is a written report | White, black, one hairline `#e5e5e5`. **No colour at all**, including for severity | System UI stack only — no webfont, deliberately |
| 10 | **Operations Wall** | Maximalist 4-column board: stat tiles with spark bars, live arrival feed, confidence distribution and the register all on screen at once | Near-black `#0a0b0d`, lime `#c8f751`, alert red `#ff4438` | Chivo / Chivo Mono |
| 11 | **Verdict & Doubt** | **Two registers, not one scale** — certain cases in a stamped card grid, unresolved ones in a separate pale panel below, never mixed in one list | Bone `#f2efe9` with oxblood `#6d1a1a` for certainty; cool `#f7f9fb` with dotted hairlines for doubt | Archivo Black caps for verdict / Petrona italic for doubt |
| 12 | **Swimlane** | Timeline-first — one lane per visitor on a shared 48-hour clock, the register demoted below the plot; detail expands one lane | Plum ink `#141020`, teal marks, hot pink `#ff2d55` for blocked | Familjen Grotesk / Azeret Mono |

### Added in the third round (13–16) — held to the 1-and-4 bar

Directions 1 and 4 are the two that are genuinely *different ideas* rather than styled variants,
and the brief for this round was to match that. What makes them work is worth naming, because it
is the bar:

- **Direction 1** makes the data *become* the image. Confidence is not printed next to a picture —
  `clip-path: inset(calc(100% - var(--exp)) 0 0 0)` makes it the exposure itself. The journey is a
  physical object: a wire, pegs, prints numbered `EXP 01 · FIXED`.
- **Direction 4** commits to a registration rail at exactly 38% that everything aligns against, and
  encodes state in **border weight rather than hue** — `2px solid` blocked, `3px double` judgement
  call, `1px dashed` incomplete. The screen survives having its colour removed.

The shared property: **the metaphor changes what the primitives are.** A row becomes a print; a
status becomes a line weight. "Same layout, new palette" fails the bar. Each of 13–16 therefore
replaces a primitive rather than restyling one.

| # | Direction | Structural idea (the bold part) | Layout | Palette | Typography |
|---|---|---|---|---|---|
| 13 | **Deposition** | **Abolishes the list/detail split.** The product is one continuous sworn document; drilling down is reading further down the page. Navigation is scrolling. | Numbered transcript lines down a 2px margin rule, a filing caption box, an index of parties, Q&A examination, evidence entered as stamped exhibits | Warm document `#f6f4ef`, ink `#16150f`, no accent colour at all | Spectral serif at 1.95 line-height / Cutive Mono for line numbers, rulings and stamps |
| 14 | **Threshold** | **Status stops being a column and becomes altitude.** One confidence axis runs the full page height and the blocking line at 80 is the dominant page element — architecture, not a legend entry. | Visitors plotted by confidence against a shared axis, the 80-line cutting the screen with a tinted zone above it; detail plots the climb on the same axis | Near-black `#101215`, alarm `#ff4d4d`, caution `#ffc44d` | Bebas Neue at **150px** for the threshold number / Karla for everything else |
| 15 | **Cartogram** | **Removes the row entirely — area is the encoding.** Every visitor is a block sized by the spend it consumed, so the worst offenders are physically the largest thing on screen and cannot be scrolled past. | Proportional block map, rows packed by share of total; detail subdivides the block into one panel per arrival sized by click cost | Dark roast `#12100e`, money yellow `#ffe14d`, burn `#ff6b57` | Bricolage Grotesque 800 at 74–92px for amounts / Roboto Mono for data |
| 16 | **Balance** | **Ambiguity becomes a physical state.** Each visitor is a two-pan scale: evidence against on the left, evidence for on the right, and the beam tilts by exactly how settled the case is. A judgement call is a beam that will not come to rest. | Grid of scales; detail shows the beam tipping across five visits with for/against columns split either side of a fulcrum | Bone `#efece4`, ink `#1f1c19`, against-red `#8c3b2f`, for-green `#3f6b47` | Young Serif display / Atkinson Hyperlegible body (chosen for legibility, not decoration) |

Verified numerically rather than by eye: a blocked visitor's beam sits at −13.7° with the
against-pan hanging 34px low; the judgement call sits at −3.6° with only 9px between the pans —
visibly unsettled, which is the entire argument of the direction.

### Added in the fourth round (17–26) — ten more at the 1-and-4 bar

The bar is unchanged: **the metaphor has to change what the primitives are.** Before inventing
these, the ground already taken across 1–16 was mapped, so none of them re-skins an existing idea:
row→print (1), row→area (15), row→scale (16), row→stave (3); status→border weight (4),
status→altitude (14); list/detail→one document (13); list→lanes (12), →map (8), →two registers (11);
plus console (2), folded sheets (5), bands (6), ledger (7), prose (9), dashboard (10).

That left networks, streams, priced risk, editorial judgement, radar, behaviour-on-the-page,
waveforms, accumulating marks, cyclical time and withheld pacing — which is exactly these ten.

| # | Direction | Structural idea (the bold part) | Layout | Palette | Typography |
|---|---|---|---|---|---|
| 17 | **Constellation** | **The cluster, not the visitor, is the unit of evidence.** A lone node is innocent by its shape; a dense knot is a farm before you read a word. | SVG node graph with edges joining shared fingerprints, node size = visit count; detail explodes one hub into its arrivals | Deep space `#080b14`, cyan `#7fe3ff`, alarm `#ff5c6e` | Chakra Petch / Share Tech Mono |
| 18 | **Tape** | **Removes the verdict moment entirely.** An append-only teleprinter roll where the determination prints inline, in sequence, the instant it is reached. Nothing is summarised. | One perforated roll, no pagination, no table; the detail is simply further along the same tape | Terminal `#17181a` behind warm roll stock `#f0ead8` | Overpass Mono / VT323 for timestamps |
| 19 | **Actuary** | **Reprices fraud as insurable risk** — exposure, expected loss and reserve per address. Blocking becomes an underwriting decision, not a verdict. | Underwriting schedule with a rated column set, plus a development triangle showing confidence maturing by arrival | Institutional `#f3f2ee`, ink `#1e2024`, loss red `#8c2f28` | Domine serif for figures / Roboto Condensed for the schedule |
| 20 | **Broadsheet** | **Editorial judgement made explicit** — the system decides what leads — with verdict-first pacing: the headline states the finding and everything after is justification. | Front page: lead story with drop cap and justified columns, a rail of briefs, a stats strip; detail is a full article with a pull quote | Newsprint `#faf8f3`, ink `#14120e`, masthead red `#9b2c1f` | Libre Baskerville / Oswald for furniture |
| 21 | **Approach Control** | **Visitors as live inbound traffic, not records.** The list is a strip bay of paper flight strips; the plot is the room. | Polar scope with range rings and a sweep, tracks placed by bearing and closing distance, strips alongside; detail pulls one strip | Radar `#05100c`, phosphor `#7dffae`, refusal `#ff5a52` | Rajdhani / Kode Mono |
| 22 | **Replay** | **Stops describing behaviour and shows it.** Evidence drawn on a wireframe of the actual landing page: scroll depth shaded, mouse path traced or conspicuously absent, clicks marked. | Grid of page replays; detail pairs one large replay with the verdict, then a strip of five per-arrival replays | Neutral `#eceef1`, attention blue `#3b82f6`, absence red `#c0392b` | Manrope / Fira Code |
| 23 | **Seismograph** | **Automation detected as a shape, not a value.** People draw an irregular line; scripts draw a clean periodic one; a flat line means nothing was recorded. | One continuous SVG trace per visitor on a drum; detail magnifies the trace with arrival marks | Paper `#fbf9f4`, ink `#1a1a18`, one alarm `#b32d1f` | Archivo Narrow / Cousine |
| 24 | **Passport** | **History accumulates as marks on the visitor’s own document.** Volume becomes visible as clutter; a refusal is struck across the whole spread. | Grid of entry documents with rotated stamps and an MRZ line; detail is a two-page spread with an endorsement | Document green `#1c2b2a` behind aged paper `#f0ead6`, refusal `#8e2c22` | Marcellus / Special Elite |
| 25 | **Punch Card** | **Cyclical time instead of sequence** — a 7×24 day-by-hour grid. A person smears across the afternoon; a script punches the same column every night. | Deck of punch cards, one per visitor, with an hour axis; detail enlarges the card and reads it | Near-black `#10120f`, punch lime `#c9ff5e` | Major Mono Display / Work Sans |
| 26 | **Verdict Withheld** | **Inverts the pacing of every other direction.** The register has no status column at all; the determination is disclosed at the foot of the evidence, after you have read it. | A single reading column; each record ends in a collapsed “show what we decided”; the detail puts the finding below a ruled break | Warm white `#f7f6f3`, ink `#1b1a18`, no accent colour | EB Garamond / Jost |

**One honest note on 22 (Replay):** eight of the ten mock visitors are click-farm-like, so most
panels legitimately show no mouse path and near-zero scroll. Behaviour is derived from each
visitor's confidence rather than its status label, so the gradient that exists in the data is
shown — but the uniformity is a property of the dataset, not a flattening by the design.

## Where they came from

Directions 1–6 were rolled from impeccable.style (`concept-seed --scope direction --mode
operate`, seed `24186115`): dark-first developer console, labanotation, iridescent cloud
edge, orizuru crane sequence, darkroom safelight bay, emission-line rail. The roll picked
the worlds; the mapping onto a fraud-evidence product is the design work.

Directions 17–26 were authored the same way as 13–16, after first mapping which primitives were
already replaced so that none of the ten repeats a structure or a mood.

Directions 13–16 were authored to the structural bar set by 1 and 4 — each replaces a primitive
(the row, the status column, the list/detail split, the notion of a settled verdict) rather than
restyling one.

Directions 7–12 were authored against the brief's open territory rather than rolled, each
chosen to occupy ground 1–6 left empty: an accounting register, a geographic lead, a
deliberate under-design, a maximalist board, a two-register treatment of certainty versus
doubt, and a timeline-first plot.

## File layout

```
previews/
  index.html          shell, switcher, font links
  data.js             shared content — the only source of copy for all 12
  app.js              directions 1–6 renderers + the switcher
  styles.css          themes for directions 1–6
  directions/
    index.js          registers 7–12 additively
    index.css         imports the six new themes
    d7.js … d26.js    one renderer pair per direction
    d7.css … d26.css  one theme per direction
```

> **Note on paths:** the briefs asked for `previews/direction-N/` folders. The established pattern
> from round two is one file pair per direction inside `previews/directions/`, so 13–16 follow that
> instead — consistent with 7–12 rather than introducing a second convention.

Directions 7–26 register themselves through `directions/index.js`; `app.js` gained three
lines in round two (an import, a spread into `RENDER`, and a combined `ALL` list) and has not been
touched since. No renderer or theme for directions 1–16 was modified in later rounds.

## What these are not

Not production. No real sort/filter logic, no tests, no accessibility hardening, no
tokens package. Direction 4's hue-free state encoding and direction 3's monochrome score
would both survive an accessibility pass; directions 1 and 6 would need contrast work
before anyone shipped them.
