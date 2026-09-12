---
name: ClickerG
description: Threat monitoring as replayed behaviour — the page a visitor landed on, with what they actually did drawn on it.
colors:
  ground: "#eceef1"
  surface: "#ffffff"
  frame: "#f5f6f8"
  border: "#d6dae0"
  page-border: "#e4e7eb"
  rule: "#eef0f3"
  ink: "#16181d"
  body: "#5a616e"
  muted: "#626975"
  attention: "#3b82f6"
  attention-text: "#0b5fe9"
  absence: "#c0392b"
  severity-medium: "#82641c"
  severity-low: "#1c6b47"
  wireframe-nav: "#dfe3e8"
  wireframe-hero: "#e8ebef"
  wireframe-cta: "#c7ced7"
  wireframe-bar: "#eef0f3"
typography:
  title:
    fontFamily: "Manrope, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "36px"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  section:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "-0.02em"
  card:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  verdict:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  lede:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  body:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.1em"
  mono:
    fontFamily: "Fira Code, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  flat: "0"
  dot: "999px"
spacing:
  half: "4px"
  "1": "8px"
  "1-25": "10px"
  "1-5": "12px"
  "2": "16px"
  "3": "20px"
  "4": "28px"
  "5": "32px"
  "7": "48px"
  "10": "70px"
components:
  replay-page:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.flat}"
    padding: "8px"
  replay-frame:
    backgroundColor: "{colors.frame}"
    rounded: "{rounded.flat}"
    padding: "8px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.flat}"
    padding: "12px"
  card-blocked:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.flat}"
    padding: "12px"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    typography: "{typography.body}"
    rounded: "{rounded.flat}"
    padding: "8px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.flat}"
    padding: "8px 16px"
  status-blocked:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.flat}"
    padding: "1px 6px"
  status-ambiguous:
    backgroundColor: "transparent"
    textColor: "{colors.severity-medium}"
    typography: "{typography.label}"
    rounded: "{rounded.flat}"
    padding: "1px 6px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.flat}"
    padding: "6px 8px"
---

# Design System: ClickerG

## Overview

**Creative North Star: "The Replay"**

ClickerG blocks traffic silently inside someone else's ad platform. The advertiser never sees the
product work — they see traffic disappear and are asked to believe it was the right traffic. Most
attempts to answer that reach for numbers: a bot score, a confidence percentage, a table of
signals. This system refuses to lead with any of them. It shows the page the visitor landed on,
and draws what they actually did on it.

The result is an argument you do not have to be technical to follow. A real customer's replay
shows a shaded band two-thirds down the page, 214 seconds of dwell and a full mouse meter. A click
farm's replay shows a band four pixels tall, a bordered label reading *no mouse movement
recorded*, and a hatched red meter. Put those side by side and nobody needs the bot score
explained.

The system is flat and quiet so the replay can be loud. There is no radius anywhere except the
click dot, no shadow anywhere except that dot's halo, and exactly two accent colours — one for
what happened, one for what did not.

**Key Characteristics:**
- The page replay is the primary object; numbers support it and never replace it
- Every mark comes from recorded engagement, never from the visitor's status
- **Positional data is drawn on the page; counted data is read out beneath it** — the tag records depths and counts, not coordinates, so no path or click position is ever invented
- **Absence is drawn** — no mouse and no tag report are both explicit labelled markers
- Flat by construction: radius 0, no shadows, borders do all containment
- Two signal colours only: attention blue for what happened, absence red for what did not
- Manrope at weight 800 for the one big statement; Fira Code for every fact
- Blocked is a 2px ink border, not a colour fill

## Colors

Cool neutral greys so the two signal colours carry all the meaning.

### Primary
- **Ink** (`#16181d`): Primary text, the blocked border, primary buttons, the filled blocked tag.
- **Ground** (`#eceef1`): The page behind everything. Cards sit on it in white, which is what makes a grid of replays read as a set of specimens rather than a wall.

### Secondary
- **Surface** (`#ffffff`): Cards, the replayed page itself, inputs.
- **Frame** (`#f5f6f8`): The surround a replay sits in — one step between card and page, so the replay reads as mounted rather than pasted.

### Neutral
- **Body** (`#5a616e`): Running text, card copy, notes.
- **Muted** (`#626975`): Captions, labels, secondary metadata. *Corrected from the preview's `#78808e`, which was 3.42:1 on the ground.*
- **Border** (`#d6dae0`), **Page border** (`#e4e7eb`), **Rule** (`#eef0f3`): three weights of containment, no shadows.

### Tertiary — the two signals
- **Attention blue** (`#3b82f6`, wash `rgba(59,130,246,.16)`): the scroll band on the page and the mouse-movement meter beneath it. **Graphic only.**
- **Attention blue as text** (`#0b5fe9`): the same blue where it carries type, focus rings, range controls.
- **Absence red** (`#c0392b`): the no-mouse marker, the hatched silent-mouse meter, the click tally dots at `rgba(192,57,43,.35)`, the decisive arrival's border, high severity.

### Wireframe greys
`#dfe3e8` nav · `#e8ebef` hero · `#c7ced7` call to action · `#eef0f3` body bars. These are the page
being replayed and must stay quiet enough that drawn behaviour reads on top of them.

### Named Rules

**The Drawn-From-Data Rule.** Every mark on a replay comes from recorded engagement — `scrollPct`,
`dwellSec`, `mouseMoves`, `clicks`. Nothing is derived from the visitor's status. A panel that
draws its conclusion instead of its evidence defeats the entire system.

**The Positional-Only-If-Recorded Rule.** The tag records depths and counts, not coordinates. So
**scroll depth is drawn on the page**, because it is positional data, and **mouse movement and
clicks are read out beneath it** as a meter and a tally, because drawing a path or a click
position would mean inventing coordinates the product never captured. If the tag ever records
coordinates, they may be drawn on the page — until then, nothing is.

**The Absence-Is-Drawn Rule.** Behaviour that did not happen gets a visible, bordered, deliberately
placed marker. It is never a blank frame, never a dash, never an omission.

**The Two-Signal Rule.** Blue is what happened. Red is what did not. There is no third accent, and
severity borrows these two rather than introducing its own.

## Typography

**Display and body:** Manrope (`ui-sans-serif, system-ui, -apple-system, sans-serif`)
**Data:** Fira Code (`ui-monospace, SF Mono, Menlo, monospace`)

**Character:** One grotesque doing everything, pushed to weight 800 with `-0.025em` tracking for
the single page title, and left at 400 everywhere else. The mono is not decoration — it marks the
facts an advertiser could paste into their ad platform.

### Hierarchy
- **Page title** (800, 36px, 1.05, `-0.025em`): one per screen. Drops to 26px under 640px.
- **Section** (700, 24px): empty-state titles.
- **Card title** (700, 20px): card headings, the notes heading.
- **Verdict** (400, 16px, 1.6): the determination, capped at 68ch.
- **Lede** (400, 15px, 1.6): the paragraph under the page title, capped at 64ch.
- **Body** (400, 13px, 1.6): notes and running copy, capped at 92ch.
- **Caption** (400, 12.5px, 1.5): card copy, signal labels, controls.
- **Label** (400, 11px, `0.1em`, uppercase): field labels, status tags.
- **Mono** (400, 12.5px / 10.5px): IPs, money, percentages, signal values, replay captions.

### Named Rules

**The One-Big-Thing Rule.** Weight 800 appears once per screen, on the page title. Everything else
earns attention through position and the replay, not through weight.

**The Monospace-for-Facts Rule.** IPs, currency, percentages and counts are mono. Prose never is.

## Layout

A 1280px centred container, 28px gutters, tightening to 20/16px under 640px.

- **List:** `repeat(auto-fill, minmax(232px, 1fr))` at a 16px gap — a grid of replay cards. There is no table on this screen; the replay is the row.
- **Detail hero:** `340px minmax(0,1fr)` at a 32px gap, collapsing to one column at 900px — a large replay beside the verdict and facts.
- **Arrival strip:** `repeat(5, minmax(150px,1fr))` with `overflow-x: auto`, so all arrivals stay on one scrollable line rather than wrapping.
- **Notes:** stacked full-width beneath the strip, capped at 92ch.

**The Strip-Scrolls-Not-Wraps Rule.** The arrival strip scrolls sideways and never wraps.
Comparing arrivals side by side is the entire argument of the detail view; wrapping them into
rows destroys it. On a 29-arrival journey that means a long horizontal scroll, and that is correct
— the finding *is* that all 29 look identical.

## Elevation & Depth

**There is no elevation.** No card shadow, no hover lift, no modal scrim vocabulary. Depth is
three border weights and one background step (`ground` → `frame` → `surface`).

### Shadow Vocabulary
- **Click halo** (`0 0 0 4px rgba(192,57,43,.15)`): the only shadow in the system, on the click tally dots.
- **Focus** (`0 0 0 2px var(--cg-surface), 0 0 0 4px var(--cg-attention-text)`): a surface-coloured gap then the blue ring, so focus reads on a card and on the ground alike.

**The No-Shadow Rule.** If a surface needs separating, move it a background step or give it a
border. Never a shadow.

## Shapes

**Radius 0 everywhere.** The one exception is the click tally dot at `999px`, 5px across. Those
are the only curves in the system, which is what makes a long row of them read as excessive at a
glance.

Blocked is **2px ink border**, not a fill and not a colour. The decisive arrival is **2px absence
red**. Status differences are border weight and border style — solid, dashed for a judgement call,
dotted for incomplete — so the screen survives with colour removed.

## Components

### Page replay (signature)
A `3/4` page (`4/3` for the hero) on white, inside a `#f5f6f8` frame. Absolutely positioned
wireframe: nav `top 5% height 5%`, hero `top 14% height 16%`, CTA `left 6% width 26% top 33%
height 6%`, body bars at 46 / 56 (70% wide) / 70 / 80% (52% wide). Over it, only what the tag
positionally recorded: the scroll band from the top with a 2px blue bottom edge, and the absence
markers at `top 58%` (no mouse) and `top 72%` (tag stopped).

Beneath the page, a three-line measured read-out in mono: **"N% of the page seen · Ns"**, then a
`5ch | 1fr | 4ch` row for **mouse** (a 4px meter filled against a 400-move scale, turning to a
hatched absence-red bar when the count is zero) and one for **clicks** (a tally of 5px dots, up to
eight, then `+n`). Where nothing was recorded at all the read-out is a single line: *not recorded*.

### Cards
White, 1px border, 12px padding. Blocked takes a 2px ink border. Hover darkens the border to ink —
no lift. The whole card is the click target, keyboard-operable with a visible focus ring.

### Arrival panel
A strip replay, a mono `visit N · NN%` line, timestamp, channel and source, up to five signal
rows, and — on the decisive arrival — a filled absence-red `blocked here` bar. **Notes are not
rendered in the panel**; they stack beneath the strip so the visual comparison is uninterrupted.

### Signal rows
Label left in muted, value right in mono, separated by a `#eef0f3` rule. High severity turns the
value absence red, medium `#82641c`, favourable `#1c6b47`, unknown muted italic.

### Status tags
11px uppercase, `0.1em` tracking, 1px border in `currentColor`. Blocked is the only filled one.

### Controls
White fields with 1px borders, hovering to ink. Because the list has no table header, **sorting is
an explicit control** — a Sort by select plus a direction toggle in the filter bar.

## Do's and Don'ts

### Do:
- **Do** derive every mark from recorded engagement, and say so where it is not available.
- **Do** keep positional drawing to positional data. Counts belong in the read-out, not on the page.
- **Do** draw absence explicitly, with a border and a label.
- **Do** keep the replay primary — signals support the picture.
- **Do** let the arrival strip scroll sideways rather than wrap.
- **Do** keep `#3b82f6` for graphics and `#0b5fe9` where the blue is text.
- **Do** use border weight and style for status, so the screen reads with colour removed.
- **Do** set every fact an advertiser might cross-reference in mono.

### Don't:
- **Don't** derive any drawn mark from a visitor's status. Ever.
- **Don't** draw a mouse path or a click position. The tag does not record coordinates, and a synthesized one would make the product illustrate its conclusion instead of showing its evidence.
- **Don't** render a blank frame for missing data.
- **Don't** add a radius or a shadow. The click dot's circle and halo are the only ones.
- **Don't** introduce a third accent colour; severity borrows blue and red.
- **Don't** spend weight 800 more than once per screen.
- **Don't** wrap the arrival strip into rows.
- **Don't** promote a table back to the list view — the replay is the row.
