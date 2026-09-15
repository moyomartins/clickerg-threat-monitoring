import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Journey, VisitEntry, type VisitEntryProps } from './VisitEntry';

const defaultArgs: VisitEntryProps = {
  index: 1,
  timestamp: '12/08/2025, 09:14',
  timestampIso: '2025-08-12T09:14:00.000Z',
  timestampLabel: '12 August 2025 at 09:14',
  channel: 'paid',
  source: 'Google Ads · uk-brand-exact · “product pricing”',
  cost: '£4.20',
  confidence: 22,
  replay: { scrollPct: 60, dwellSec: 72, clicks: 1, mouseMoves: 14 },
  signals: [
    { label: 'Interaction', value: 'Scrolled 60%, 1m 12s', severity: 'low' },
    { label: 'Bot probability', value: '18%', severity: 'low' },
    { label: 'VPN / proxy', value: 'None', severity: 'low' },
  ],
};

function Card({ args }: { args: VisitEntryProps }) {
  return <Journey><VisitEntry {...args} last /></Journey>;
}

/**
 * The same invariant in both presentations: an arrival never reaches past the
 * list that holds it, and the list never scrolls sideways. At desktop widths
 * the arrival is a card; below the stacked breakpoint it is an accordion item.
 */
function assertCardFits(canvasElement: HTMLElement) {
  const row = canvasElement.querySelector('.cg-journey') as HTMLElement;
  const arrival = canvasElement.querySelector('.cg-visit, .cg-visit-m') as HTMLElement;
  expect(arrival).not.toBeNull();
  const arrivalBounds = arrival.getBoundingClientRect();
  const rowBounds = row.getBoundingClientRect();
  expect(arrivalBounds.left).toBeGreaterThanOrEqual(Math.floor(rowBounds.left));
  expect(arrivalBounds.right).toBeLessThanOrEqual(Math.ceil(rowBounds.right));
  // Nothing may produce a sideways scrollbar, at any width.
  expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth + 1);
}

const meta = {
  title: 'Components/VisitEntry',
  component: VisitEntry,
  parameters: {
    layout: 'padded',
    viewport: { defaultViewport: 'desktop' },
    docs: { description: { component: 'Production journey card, rendered with the same VisitEntry and Journey components used by the visitor-detail page.' } },
  },
  args: defaultArgs,
  argTypes: {
    channel: { control: 'inline-radio', options: ['paid', 'organic', 'direct', 'referral'] },
    confidence: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    reflectionPhase: { control: 'inline-radio', options: ['idle', 'entering', 'active', 'exiting', 'completed', 'autonomous'] },
  },
  render: (args) => <Card args={args} />,
} satisfies Meta<typeof VisitEntry>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: async ({ canvasElement }) => assertCardFits(canvasElement) };

export const Blocked: Story = {
  args: {
    ...defaultArgs, index: 6, confidence: 82,
    signals: [
      { label: 'Interaction', value: 'No scroll, no mouse', severity: 'high' },
      { label: 'Bot probability', value: '82%', severity: 'high' },
      { label: 'VPN / proxy', value: 'Datacenter IP', severity: 'high' },
    ],
  },
};

export const DecisiveArrival: Story = {
  args: {
    ...defaultArgs, index: 7, confidence: 96, decisive: true, verdict: 'blocked here',
    signals: [
      { label: 'Click cadence', value: '0.4s between clicks', severity: 'high' },
      { label: 'Bot probability', value: '96%', severity: 'high' },
      { label: 'Form fill', value: 'Invalid email ×5', severity: 'high' },
      { label: 'Device fingerprint', value: 'Seen in 7 sessions', severity: 'high' },
    ],
  },
  play: async ({ canvasElement }) => {
    assertCardFits(canvasElement);
    await expect(within(canvasElement).getByText('blocked here')).toBeInTheDocument();
  },
};

export const NotBlocked: Story = {
  args: { ...defaultArgs, index: 2, channel: 'organic', source: 'google.com · “product reviews”', cost: undefined, confidence: 24 },
  play: async ({ canvasElement }) => {
    assertCardFits(canvasElement);
    await expect(within(canvasElement).queryByText('blocked here')).not.toBeInTheDocument();
  },
};

export const Ambiguous: Story = {
  args: {
    ...defaultArgs, index: 4, confidence: 52,
    signals: [
      { label: 'Click cadence', value: '1.1s between clicks', severity: 'medium' },
      { label: 'Conversion', value: '£249.00', severity: 'low' },
      { label: 'VPN / proxy', value: 'Residential proxy', severity: 'medium' },
    ],
  },
};

export const LongContent: Story = {
  args: {
    ...defaultArgs,
    source: 'Google Ads · enterprise-cloud-security-platform · “how to stop repeated click-fraud campaigns without blocking genuine customers”',
    signals: [
      { label: 'Interaction pattern across the full arrival', value: 'No mouse movement recorded after seven repeated paid clicks', severity: 'high' },
      { label: 'Device fingerprint', value: 'Chromium 128 / macOS 14.6 / 2560×1440 / canvas-fingerprint-4f9a77cc-20d1-4842-96c8-8778e3f09164', severity: 'high' },
      { label: 'Form fill', value: 'billing-contact+unusually-long-enterprise-alias@undeliverable-example.invalid', severity: 'high' },
    ],
  },
  play: async ({ canvasElement }) => assertCardFits(canvasElement),
};

export const NarrowViewport: Story = {
  parameters: { viewport: { defaultViewport: 'mobile' } },
  args: LongContent.args,
  play: async ({ canvasElement }) => assertCardFits(canvasElement),
};

export const HorizontalJourneyRow: Story = {
  render: () => (
    <Journey>
      {[22, 38, 58, 76, 96].map((confidence, index) => (
        <VisitEntry
          key={confidence}
          {...defaultArgs}
          index={index + 1}
          timestamp={`12/08/2025, ${String(9 + index).padStart(2, '0')}:14`}
          confidence={confidence}
          decisive={confidence === 96}
          verdict={confidence === 96 ? 'blocked here' : undefined}
        />
      ))}
    </Journey>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('.cg-visit')).toHaveLength(5);
    await expect(within(canvasElement).getByText('blocked here')).toBeInTheDocument();
  },
};

/* ── The decisive card's autonomous reflection ────────────────────────────
   These stories freeze the sweep via `reflectionPhase` so a moment that is
   otherwise 2.8s out of every ~11.7s can be inspected and captured. Production
   never passes the prop; the sweep runs on its own. */

const decisiveArgs: VisitEntryProps = { ...(DecisiveArrival.args as VisitEntryProps) };

const logoOf = (canvasElement: HTMLElement) =>
  canvasElement.querySelector('.cg-visit__reflection-logo') as HTMLElement;

const shapesOf = (canvasElement: HTMLElement) => ({
  outer: canvasElement.querySelector('.cg-glass-mark__outer') as SVGPathElement,
  inner: canvasElement.querySelector('.cg-glass-mark__inner') as SVGPathElement,
});

/** Opacity as it finally composites, through every layer above the shape. */
const composited = (shape: Element, canvasElement: HTMLElement) => {
  let value = 1;
  for (let node: Element | null = shape; node && node !== canvasElement; node = node.parentElement) {
    value *= Number(getComputedStyle(node).opacity);
  }
  return value;
};

export const ReflectionIdle: Story = {
  name: 'Reflection · idle (mark absent)',
  args: { ...decisiveArgs, reflectionPhase: 'idle' },
  play: async ({ canvasElement }) => {
    const logo = logoOf(canvasElement);
    await expect(logo).toBeInTheDocument();
    // Between passes the mark is not faint, it is absent. A watermark would fail here.
    await expect(getComputedStyle(logo).opacity).toBe('0');
    await expect(within(canvasElement).getByText('blocked here')).toBeVisible();
  },
};

export const ReflectionEntering: Story = {
  name: 'Reflection · entering from the top-left',
  args: { ...decisiveArgs, reflectionPhase: 'entering' },
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('.cg-visit--decisive') as HTMLElement;
    const x = parseFloat(getComputedStyle(card).getPropertyValue('--cg-reflection-x'));
    // Travel runs 125% down to -25%; the band's peak only reaches the card at 88.5%.
    await expect(x).toBeGreaterThan(88.5);
    // The light has arrived; the mark is not out yet.
    await expect(Number(getComputedStyle(logoOf(canvasElement)).opacity)).toBeGreaterThan(0);
    const { outer, inner } = shapesOf(canvasElement);
    await expect(composited(outer, canvasElement)).toBeCloseTo(composited(inner, canvasElement) * 1.3, 4);
  },
};

export const ReflectionExiting: Story = {
  name: 'Reflection · trailing edge (exiting bottom-right)',
  args: { ...decisiveArgs, reflectionPhase: 'exiting' },
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('.cg-visit--decisive') as HTMLElement;
    const x = parseFloat(getComputedStyle(card).getPropertyValue('--cg-reflection-x'));
    // Past 11.5% the band's peak has left the card and is trailing off the corner.
    await expect(x).toBeLessThan(11.5);
    // Both shapes fade together, keeping their relationship on the way out.
    const { outer, inner } = shapesOf(canvasElement);
    await expect(composited(outer, canvasElement)).toBeCloseTo(composited(inner, canvasElement) * 1.3, 4);
  },
};

export const ReflectionCompleted: Story = {
  name: 'Reflection · completed sweep (nothing left behind)',
  args: { ...decisiveArgs, reflectionPhase: 'completed' },
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('.cg-visit--decisive') as HTMLElement;
    await expect(parseFloat(getComputedStyle(card).getPropertyValue('--cg-reflection-x'))).toBe(-25);
    // The pass is over: both shapes composite to nothing, not to a faint residue.
    const { outer, inner } = shapesOf(canvasElement);
    await expect(composited(outer, canvasElement)).toBe(0);
    await expect(composited(inner, canvasElement)).toBe(0);
    await expect(within(canvasElement).getByText('blocked here')).toBeVisible();
  },
};

export const ReflectionActive: Story = {
  name: 'Reflection · mid-sweep (mark revealed)',
  args: { ...decisiveArgs, reflectionPhase: 'active' },
  parameters: {
    docs: {
      description: {
        story: 'Frozen at the midpoint of the traversal, where the band\'s thick centre crosses the mark. Computed at this phase , outer vector opacity: 62.4%, inner vector opacity: 48%, a ratio of 1.3. Those are the composited values, read from the DOM by this story\'s assertions; nothing renders them on the card.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const logo = logoOf(canvasElement);
    await expect(Number(getComputedStyle(logo).opacity)).toBeGreaterThan(0.5);
    // Decorative throughout: never announced, never a hit target.
    await expect(logo).toHaveAttribute('aria-hidden', 'true');
    await expect(getComputedStyle(logo).pointerEvents).toBe('none');

    const { outer, inner } = shapesOf(canvasElement);
    const outerOpacity = composited(outer, canvasElement);
    const innerOpacity = composited(inner, canvasElement);

    // The published values, at the phase where the mark is most visible.
    await expect(outerOpacity).toBeCloseTo(0.624, 4);
    await expect(innerOpacity).toBeCloseTo(0.48, 4);
    // The relationship, stated as a relationship rather than two constants.
    await expect(outerOpacity).toBeCloseTo(innerOpacity * 1.3, 4);
    // The facet is recessed at the brightest moment of the pass, never full.
    await expect(innerOpacity).toBeLessThan(outerOpacity);
    // Neither shape reaches a solid fill at any point of the sweep.
    await expect(outerOpacity).toBeLessThan(1);
    await expect(innerOpacity).toBeLessThan(1);
    await expect(outerOpacity).toBeLessThanOrEqual(0.7);
  },
};

export const ReflectionCycle: Story = {
  name: 'Reflection · full autonomous cycle',
  args: { ...decisiveArgs, reflectionPhase: 'autonomous' },
  parameters: {
    docs: { description: { story: 'Runs unattended: ~2.8s traversal, ~9s rest, repeating. Nothing triggers it.' } },
  },
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('.cg-visit--decisive') as HTMLElement;
    const style = getComputedStyle(card);
    await expect(style.animationName).toBe('cg-decisive-reflection-position');
    await expect(style.animationIterationCount).toBe('infinite');

    /* Walk one whole cycle and check the two invariants that matter:
       the band only ever travels top-left to bottom-right (x falls, and both
       axes stay locked together), and the mark is never lit outside it. */
    const anim = card.getAnimations().find((a) => (a as CSSAnimation).animationName === 'cg-decisive-reflection-position')!;
    const delay = parseFloat(style.animationDelay) * 1000;
    const duration = parseFloat(style.animationDuration) * 1000;
    const samples: { x: number; y: number; presence: number }[] = [];
    for (let f = 0; f <= 1; f += 0.02) {
      anim.currentTime = delay + duration * f;
      anim.pause();
      const now = getComputedStyle(card);
      samples.push({
        x: parseFloat(now.getPropertyValue('--cg-reflection-x')),
        y: parseFloat(now.getPropertyValue('--cg-reflection-y')),
        presence: Number(now.getPropertyValue('--cg-reflection-presence')),
      });
    }
    anim.play();

    for (let i = 1; i < samples.length; i += 1) {
      await expect(samples[i].x).toBeLessThanOrEqual(samples[i - 1].x + 0.001);
      await expect(samples[i].y).toBeCloseTo(samples[i].x, 3);
    }
    // A completed cycle ends invisible, not on a held frame.
    await expect(samples[samples.length - 1].presence).toBe(0);
    await expect(samples.some((s) => s.presence > 0.9)).toBe(true);

    /* The band crosses the mark at the midpoint of the traversal, not early in
       it. Travel runs 125% , -25%, so the halfway position is 50%; the mark is
       revealed at ~40%, a touch past centre because it sits low in the card.
       An ease-out curve would reach both far sooner than the halfway instant. */
    const TRAVERSAL_FRACTION = 0.24;
    const midX = await (async () => {
      anim.currentTime = delay + duration * (TRAVERSAL_FRACTION / 2);
      anim.pause();
      const x = parseFloat(getComputedStyle(card).getPropertyValue('--cg-reflection-x'));
      anim.play();
      return x;
    })();
    await expect(midX).toBeGreaterThan(40);
    await expect(midX).toBeLessThan(60);

    // The decorative layer is out of flow and cannot move card content.
    const logo = logoOf(canvasElement);
    await expect(getComputedStyle(logo).position).toBe('absolute');
    await expect(getComputedStyle(card).overflow).toBe('hidden');
  },
};

export const ReflectionNotDecisive: Story = {
  name: 'Reflection · absent on a non-decisive card',
  args: { ...decisiveArgs, decisive: false },
  play: async ({ canvasElement }) => {
    await expect(logoOf(canvasElement)).toBeNull();
    await expect(canvasElement.querySelector('.cg-visit--decisive')).toBeNull();
  },
};

export const ReflectionReducedMotion: Story = {
  name: 'Reflection · reduced motion',
  args: { ...decisiveArgs, reflectionPhase: 'autonomous' },
  parameters: {
    docs: { description: { story: 'Under `prefers-reduced-motion: reduce` the sweep is switched off entirely , and the mark stays hidden rather than being left on screen as a permanent watermark.' } },
  },
  play: async () => {
    /* The browser's own motion preference cannot be toggled from a play
       function, so assert the rule that governs it actually exists and does
       both halves of the job , stops the animation AND keeps the mark at zero. */
    const rules = [...document.styleSheets].flatMap((sheet) => {
      try { return [...sheet.cssRules]; } catch { return []; }
    });
    const reduced = rules.find(
      (rule): rule is CSSMediaRule =>
        rule instanceof CSSMediaRule && rule.conditionText.includes('prefers-reduced-motion'),
    );
    const inner = [...(reduced?.cssRules ?? [])].filter(
      (rule): rule is CSSStyleRule => rule instanceof CSSStyleRule,
    );
    const stops = inner.find((rule) => rule.selectorText.includes('.cg-visit--decisive'));
    await expect(stops?.style.animationName).toBe('none');

    const hides = inner.find((rule) => rule.selectorText.includes('.cg-visit__reflection-logo'));
    await expect(hides?.style.opacity).toBe('0');
  },
};

export const ReflectionTiming: Story = {
  name: 'Reflection · timing budget',
  render: () => (
    <Journey>
      {[1, 2, 3, 4, 5].map((index) => (
        <VisitEntry
          key={index}
          {...defaultArgs}
          index={index}
          confidence={90 + index}
          decisive
          verdict="blocked here"
        />
      ))}
    </Journey>
  ),
  parameters: {
    docs: { description: { story: 'Five decisive cards at once. Each traverses in ~2.8s, then rests 8,12s, on its own schedule.' } },
  },
  play: async ({ canvasElement }) => {
    const cards = [...canvasElement.querySelectorAll<HTMLElement>('.cg-visit--decisive')];
    await expect(cards).toHaveLength(5);

    const TRAVERSAL_FRACTION = 0.24; // the keyframes' travel window, as a share of one cycle
    const seen = new Set<string>();

    for (const card of cards) {
      const style = getComputedStyle(card);
      const cycle = parseFloat(style.animationDuration) * 1000;
      const delay = parseFloat(style.animationDelay) * 1000;
      const sweep = cycle * TRAVERSAL_FRACTION;

      /* The visible traversal: leading edge entering the card to trailing edge
         leaving it. The travel endpoints (125% , -25%) are chosen so the band
         is fully clear of the card at both, which is what makes this window
         the traversal rather than the whole cycle. */
      await expect(sweep).toBeGreaterThanOrEqual(2700);
      await expect(sweep).toBeLessThanOrEqual(3000);
      // Occasional, never continuous and never so rare it goes unseen.
      await expect(cycle - sweep).toBeGreaterThanOrEqual(8000);
      await expect(cycle - sweep).toBeLessThanOrEqual(12000);
      // Time to orient before the motion asks for attention.
      await expect(delay).toBeGreaterThanOrEqual(2500);
      await expect(delay).toBeLessThanOrEqual(4000);
      // Eased at both ends, never a mechanical linear crawl.
      await expect(style.animationTimingFunction).toContain('cubic-bezier');

      seen.add(`${cycle}/${delay}`);
    }
    // Stable variation: no two cards share a schedule, so no lockstep.
    await expect(seen.size).toBe(cards.length);
  },
};

export const ReflectionScaleComparison: Story = {
  name: 'Reflection · previous vs corrected mark scale',
  parameters: {
    docs: { description: { story: 'Left: the mark at its previous 44% width. Right: the corrected 26%, 60% of the former size. Both frozen at peak reveal; only the token differs.' } },
  },
  render: (args) => (
    <Journey>
      <VisitEntry {...args} index={1} reflectionPhase="active" />
      <VisitEntry {...args} index={2} reflectionPhase="active" />
    </Journey>
  ),
  args: decisiveArgs,
  play: async ({ canvasElement }) => {
    const [before, after] = [...canvasElement.querySelectorAll<HTMLElement>('.cg-visit--decisive')];
    // Override only the published token, so this compares sizes of the same treatment.
    before.style.setProperty('--cg-reflection-logo-size', '44%');
    const sizeOf = (card: HTMLElement) =>
      parseFloat(getComputedStyle(card.querySelector('.cg-glass-mark')!).width);
    // 26% against the former 44%: 0.591, the rounding that landed on whole
    // token values. Asserted as a ratio so card width cannot affect it.
    await expect(sizeOf(after) / sizeOf(before)).toBeCloseTo(0.6, 1);
  },
};

export const ReflectionNarrowCard: Story = {
  name: 'Reflection · narrow card',
  parameters: { viewport: { defaultViewport: 'tablet' } },
  args: { ...decisiveArgs, reflectionPhase: 'active' },
  play: async ({ canvasElement }) => {
    assertCardFits(canvasElement);
    // The mark scales with the card, so a narrow column never clips it.
    const logo = logoOf(canvasElement);
    const card = canvasElement.querySelector('.cg-visit--decisive') as HTMLElement;
    await expect(logo.getBoundingClientRect().width).toBeLessThanOrEqual(card.getBoundingClientRect().width);
  },
};

export const ReflectionMultipleInstances: Story = {
  name: 'Reflection · two decisive cards',
  render: () => (
    <Journey>
      {[1, 2, 3].map((index) => (
        <VisitEntry
          key={index}
          {...defaultArgs}
          index={index}
          confidence={90 + index}
          decisive={index !== 2}
          verdict={index !== 2 ? 'blocked here' : undefined}
        />
      ))}
    </Journey>
  ),
  play: async ({ canvasElement }) => {
    const cards = [...canvasElement.querySelectorAll<HTMLElement>('.cg-visit--decisive')];
    await expect(cards).toHaveLength(2);
    // Each card carries its own rest length AND its own first-pass offset, so
    // they never sweep in lockstep and never overlap into a continuous shimmer.
    const delays = cards.map((card) => card.style.getPropertyValue('--cg-reflection-delay'));
    const cycles = cards.map((card) => card.style.getPropertyValue('--cg-reflection-duration'));
    await expect(new Set(delays).size).toBe(2);
    await expect(new Set(cycles).size).toBe(2);
  },
};

export const ReflectionHoverDuringSweep: Story = {
  name: 'Reflection · hover during a sweep',
  args: {
    ...decisiveArgs,
    reflectionPhase: 'active',
    explanation: { title: 'Why this arrival was blocked', content: <p>Four high-severity signals agreed.</p> },
  },
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('.cg-visit--decisive') as HTMLElement;
    const before = getComputedStyle(logoOf(canvasElement)).opacity;

    await userEvent.hover(card);
    await expect(card).toHaveAttribute('aria-expanded', 'true');
    // Hover opens the disclosure and leaves the reflection exactly where it was.
    await expect(getComputedStyle(logoOf(canvasElement)).opacity).toBe(before);

    await userEvent.unhover(card);
    await expect(getComputedStyle(logoOf(canvasElement)).opacity).toBe(before);
  },
};

export const ReflectionMaterialIsNeutral: Story = {
  name: 'Reflection · neutral frosted material (no brand colour)',
  args: { ...decisiveArgs, reflectionPhase: 'active' },
  play: async ({ canvasElement }) => {
    const { outer, inner } = shapesOf(canvasElement);

    /* One material, one colour. The two shapes are separated by density alone,
       so any hue difference between them , or any hue at all , is a defect. */
    for (const shape of [outer, inner]) {
      const [r, g, b] = (getComputedStyle(shape).fill.match(/\d+/g) ?? []).slice(0, 3).map(Number);
      await expect([r, g, b]).toEqual([255, 255, 255]);
    }

    // Neither shape is a solid fill, and the facet is the softer of the two.
    await expect(composited(outer, canvasElement)).toBeLessThanOrEqual(0.7);
    await expect(composited(inner, canvasElement)).toBeLessThan(composited(outer, canvasElement));
  },
};

export const ReflectionFocusDoesNotDriveIt: Story = {
  name: 'Reflection · focus does not drive it',
  args: {
    ...decisiveArgs,
    reflectionPhase: 'active',
    explanation: { title: 'Why this arrival was blocked', content: <p>Four high-severity signals agreed.</p> },
  },
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('.cg-visit--decisive') as HTMLElement;
    const before = getComputedStyle(logoOf(canvasElement)).opacity;

    card.focus();
    await expect(card).toHaveFocus();
    await expect(getComputedStyle(logoOf(canvasElement)).opacity).toBe(before);

    card.blur();
    await expect(getComputedStyle(logoOf(canvasElement)).opacity).toBe(before);
  },
};

export const ReflectionPausesOffscreen: Story = {
  name: 'Reflection · pauses offscreen',
  render: (args) => (
    <div style={{ height: '320px', overflowY: 'auto' }} data-testid="scroller" tabIndex={0} aria-label="Journey scroll region">
      <Journey><VisitEntry {...args} last /></Journey>
      <div style={{ height: '1600px' }} />
    </div>
  ),
  args: decisiveArgs,
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('.cg-visit--decisive') as HTMLElement;
    await expect(card.className).not.toContain('cg-visit--reflection-paused');

    // Push the card well clear of the observer's 200px margin.
    (canvasElement.querySelector('[data-testid="scroller"]') as HTMLElement).scrollTop = 1400;
    await new Promise((resolve) => setTimeout(resolve, 200));

    const paused = canvasElement.querySelector('.cg-visit--decisive') as HTMLElement;
    await expect(paused.className).toContain('cg-visit--reflection-paused');
    await expect(getComputedStyle(paused).animationPlayState).toBe('paused');
  },
};

export const ReflectionPausesWhenTabHidden: Story = {
  name: 'Reflection · pauses when the tab is hidden',
  args: decisiveArgs,
  play: async ({ canvasElement }) => {
    const original = Object.getOwnPropertyDescriptor(Document.prototype, 'visibilityState');
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      const card = canvasElement.querySelector('.cg-visit--decisive') as HTMLElement;
      await expect(getComputedStyle(card).animationPlayState).toBe('paused');
    } finally {
      delete (document as unknown as Record<string, unknown>).visibilityState;
      if (original) Object.defineProperty(Document.prototype, 'visibilityState', original);
      document.dispatchEvent(new Event('visibilitychange'));
    }
  },
};

function Unmountable(args: VisitEntryProps) {
  const [mounted, setMounted] = useState(true);
  return (
    <>
      <button type="button" onClick={() => setMounted(false)}>unmount</button>
      {mounted && <Journey><VisitEntry {...args} last /></Journey>}
    </>
  );
}

export const ReflectionCleansUpOnUnmount: Story = {
  name: 'Reflection · cleans up on unmount',
  render: (args) => <Unmountable {...args} />,
  args: decisiveArgs,
  play: async ({ canvasElement }) => {
    const removed: string[] = [];
    const original = document.removeEventListener;
    document.removeEventListener = ((type: string, ...rest: unknown[]) => {
      removed.push(type);
      (original as never as (...a: unknown[]) => void).call(document, type, ...rest);
    }) as typeof document.removeEventListener;

    try {
      await userEvent.click(within(canvasElement).getByRole('button', { name: 'unmount' }));
      await expect(canvasElement.querySelector('.cg-visit--decisive')).toBeNull();
      await expect(removed).toContain('visibilitychange');
    } finally {
      document.removeEventListener = original;
    }
  },
};

/* ── The journey on a phone ───────────────────────────────────────────────
   Same components, same data, same `Journey`/`VisitEntry` the production page
   uses , only the viewport differs. There is no Storybook-only accordion. */

const at = (viewport: 'mobile320' | 'mobile375' | 'mobile' | 'mobile430') => ({
  viewport: { defaultViewport: viewport },
});

const mobileJourney = (args: Partial<VisitEntryProps>[], decisiveArrival?: number) => () => (
  <Journey labelledBy="mobile-journey-heading" decisiveArrival={decisiveArrival}>
    {args.map((a, i) => (
      <VisitEntry key={i} {...defaultArgs} index={i + 1} {...a} />
    ))}
  </Journey>
);

const arrivals: Partial<VisitEntryProps>[] = [
  { confidence: 39, timestamp: '14/08/2025, 11:43', cost: '£7.34' },
  { confidence: 65, timestamp: '14/08/2025, 12:26', cost: '£5.06' },
  {
    confidence: 82, timestamp: '14/08/2025, 15:21', cost: '£5.39',
    decisive: true, verdict: 'blocked here',
    // A blocked arrival that never moved the mouse , absence drawn, not blank.
    replay: { scrollPct: 0, dwellSec: 3, clicks: 1, mouseMoves: 0 },
    signals: [
      { label: 'Interaction', value: '0% scrolled, 3s', severity: 'high' },
      { label: 'Bot probability', value: '94%', severity: 'high' },
      { label: 'VPN / proxy', value: 'Datacenter IP', severity: 'high' },
      { label: 'Click cadence', value: '0.9s between clicks', severity: 'high' },
    ],
    explanation: { title: 'Why this arrival was decisive', content: <p>Cumulative confidence crossed the threshold.</p> },
  },
  { confidence: 92, timestamp: '15/08/2025, 03:36', cost: '£6.46' },
  { confidence: 98, timestamp: '15/08/2025, 04:20', cost: '£6.88' },
];

const expandTrigger = async (canvasElement: HTMLElement, position: number) => {
  const trigger = canvasElement.querySelectorAll('.cg-visit-m__trigger')[position] as HTMLElement;
  await userEvent.click(trigger);
  return trigger;
};

const assertNoSidewaysScroll = async (canvasElement: HTMLElement) => {
  const list = canvasElement.querySelector('.cg-journey') as HTMLElement;
  await expect(list.classList.contains('cg-journey--stacked')).toBe(true);
  await expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth + 1);
  await expect(getComputedStyle(list).overflowX).not.toBe('auto');
  // Nothing inside may reach past the list box.
  for (const el of canvasElement.querySelectorAll<HTMLElement>('.cg-visit-m *')) {
    const box = el.getBoundingClientRect();
    if (box.width === 0) continue;
    await expect(box.right).toBeLessThanOrEqual(Math.ceil(list.getBoundingClientRect().right) + 1);
  }
};

export const MobileAllCollapsed: Story = {
  name: 'Mobile · all collapsed',
  parameters: at('mobile'),
  render: mobileJourney(arrivals),
  play: async ({ canvasElement }) => {
    // No decisive arrival passed: nothing opens on its own.
    const triggers = canvasElement.querySelectorAll('.cg-visit-m__trigger');
    await expect(triggers).toHaveLength(5);
    for (const t of triggers) await expect(t).toHaveAttribute('aria-expanded', 'false');
    await expect(canvasElement.querySelector('.cg-visit')).toBeNull();
    await expect(canvasElement.querySelector('.cg-journey__jump')).toBeNull();
    await assertNoSidewaysScroll(canvasElement);
  },
};

export const MobileNormalExpanded: Story = {
  name: 'Mobile · a normal arrival expanded',
  parameters: at('mobile'),
  render: mobileJourney(arrivals),
  play: async ({ canvasElement }) => {
    const trigger = await expandTrigger(canvasElement, 0);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // The button opens its own panel, and the panel is the one it names.
    const panel = canvasElement.querySelector(`#${CSS.escape(trigger.getAttribute('aria-controls')!)}`) as HTMLElement;
    await expect(panel).not.toBeNull();
    await expect(panel.hidden).toBe(false);
    await expect(panel.querySelector('.cg-replay')).not.toBeNull();

    // One at a time: opening the next closes this one.
    await expandTrigger(canvasElement, 1);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(canvasElement.querySelectorAll('[aria-expanded="true"]')).toHaveLength(1);

    // And the open one can be closed again.
    await expandTrigger(canvasElement, 1);
    await expect(canvasElement.querySelectorAll('[aria-expanded="true"]')).toHaveLength(0);
  },
};

export const MobileDecisiveExpanded: Story = {
  name: 'Mobile · decisive arrival expanded by default',
  parameters: at('mobile'),
  render: mobileJourney(arrivals, 3),
  play: async ({ canvasElement }) => {
    const items = [...canvasElement.querySelectorAll('.cg-visit-m')];
    const decisive = items.findIndex((li) => li.classList.contains('cg-visit-m--decisive'));
    await expect(decisive).toBe(2);
    // A blocked journey opens where the blocking happened, without being asked.
    await expect(items[decisive].querySelector('.cg-visit-m__trigger')).toHaveAttribute('aria-expanded', 'true');
    await expect(canvasElement.querySelectorAll('[aria-expanded="true"]')).toHaveLength(1);
    // Status in words, and the verdict strip still present in full.
    await expect(within(items[decisive] as HTMLElement).getByText('decisive arrival')).toBeVisible();
    await expect(within(items[decisive] as HTMLElement).getByText('blocked here')).toBeVisible();

    // A reader's own choice survives , it is not reopened underneath them.
    await expandTrigger(canvasElement, 0);
    await expect(items[decisive].querySelector('.cg-visit-m__trigger')).toHaveAttribute('aria-expanded', 'false');
  },
};

export const MobileJumpToBlocked: Story = {
  name: 'Mobile · jump to blocked arrival',
  parameters: at('mobile'),
  render: mobileJourney(arrivals, 3),
  play: async ({ canvasElement }) => {
    await expandTrigger(canvasElement, 0);
    const jump = canvasElement.querySelector('.cg-journey__jump') as HTMLElement;
    await expect(jump).not.toBeNull();
    await expect(jump.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);

    await userEvent.click(jump);
    const decisive = canvasElement.querySelector('.cg-visit-m--decisive') as HTMLElement;
    await expect(decisive.querySelector('.cg-visit-m__trigger')).toHaveAttribute('aria-expanded', 'true');
    await expect(canvasElement.querySelectorAll('[aria-expanded="true"]')).toHaveLength(1);
  },
};

export const MobileLongEvidence: Story = {
  name: 'Mobile · long evidence values',
  parameters: at('mobile'),
  render: mobileJourney([
    {
      ...LongContent.args,
      confidence: 96,
      source: 'Google Ads · enterprise-cloud-security-platform · “how to stop repeated click-fraud campaigns without blocking genuine customers”',
    } as Partial<VisitEntryProps>,
  ]),
  play: async ({ canvasElement }) => {
    await expandTrigger(canvasElement, 0);
    await assertNoSidewaysScroll(canvasElement);
    // Long technical values are allowed to break anywhere; labels are not.
    const long = canvasElement.querySelector('.cg-visit-m__signal--long .cg-chip__value') as HTMLElement;
    await expect(getComputedStyle(long).overflowWrap).toBe('anywhere');
    const label = canvasElement.querySelector('.cg-visit-m__signal .cg-chip__label') as HTMLElement;
    await expect(getComputedStyle(label).overflowWrap).not.toBe('anywhere');
  },
};

export const MobileMissingEvidence: Story = {
  name: 'Mobile · missing evidence',
  parameters: at('mobile'),
  render: mobileJourney([
    {
      confidence: 41, replay: null, source: undefined, cost: undefined,
      signals: [
        { label: 'Interaction', severity: 'unknown' },
        { label: 'Bot probability', value: '—', severity: 'unknown' },
      ],
    },
  ]),
  play: async ({ canvasElement }) => {
    await expandTrigger(canvasElement, 0);
    // Absence is drawn, never a blank frame.
    await expect(canvasElement.querySelector('.cg-replay')).not.toBeNull();
    await expect(within(canvasElement).getByText('not captured')).toBeVisible();
    await assertNoSidewaysScroll(canvasElement);
  },
};

export const MobileOrganicArrival: Story = {
  name: 'Mobile · organic arrival',
  parameters: at('mobile'),
  render: mobileJourney([
    { channel: 'organic', cost: undefined, source: 'google.com · “product reviews”', confidence: 24 },
  ]),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(/Organic search/)).toBeVisible();
    // No cost shown where none applies.
    await expect(within(canvasElement).queryByText(/£/)).toBeNull();
  },
};

export const MobileMixedTraffic: Story = {
  name: 'Mobile · mixed traffic',
  parameters: at('mobile'),
  render: mobileJourney([
    { channel: 'paid', cost: '£4.06', confidence: 30 },
    { channel: 'organic', cost: undefined, source: 'google.com · “pricing”', confidence: 44 },
    { channel: 'direct', cost: undefined, source: undefined, confidence: 58 },
    { channel: 'referral', cost: undefined, source: 'news.example.com', confidence: 71 },
  ]),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('.cg-visit-m')).toHaveLength(4);
    await assertNoSidewaysScroll(canvasElement);
  },
};

export const MobileReducedMotion: Story = {
  name: 'Mobile · reduced motion',
  parameters: at('mobile'),
  render: mobileJourney(arrivals, 3),
  play: async ({ canvasElement }) => {
    // The decorative layer is present but governed by the same rule as desktop.
    const mark = canvasElement.querySelector('.cg-visit__reflection-logo');
    await expect(mark).toHaveAttribute('aria-hidden', 'true');
    await expect(getComputedStyle(mark as HTMLElement).pointerEvents).toBe('none');

    const rules = [...document.styleSheets].flatMap((sheet) => {
      try { return [...sheet.cssRules]; } catch { return []; }
    });
    const reduced = rules.find(
      (rule): rule is CSSMediaRule =>
        rule instanceof CSSMediaRule && rule.conditionText.includes('prefers-reduced-motion'),
    );
    const inner = [...(reduced?.cssRules ?? [])].filter((r): r is CSSStyleRule => r instanceof CSSStyleRule);
    await expect(inner.find((r) => r.selectorText.includes('.cg-visit--decisive'))?.style.animationName).toBe('none');
  },
};

export const MobileAt320: Story = {
  name: 'Mobile · 320px',
  parameters: at('mobile320'),
  render: mobileJourney(arrivals, 3),
  play: async ({ canvasElement }) => {
    await assertNoSidewaysScroll(canvasElement);
    // The replay stays inside the card and keeps its evidence legible.
    const replay = canvasElement.querySelector('.cg-visit-m__panel:not([hidden]) .cg-replay') as HTMLElement;
    const item = canvasElement.querySelector('.cg-visit-m--decisive') as HTMLElement;
    await expect(replay.getBoundingClientRect().right).toBeLessThanOrEqual(item.getBoundingClientRect().right);
    // Drawn absence stays fully inside the preview, and the caption stays readable.
    const mark = canvasElement.querySelector('.cg-visit-m__panel:not([hidden]) .cg-replay__mark') as HTMLElement;
    await expect(mark).not.toBeNull();
    await expect(mark.getBoundingClientRect().right).toBeLessThanOrEqual(replay.getBoundingClientRect().right + 1);
    const caption = canvasElement.querySelector('.cg-visit-m__panel:not([hidden]) .cg-replay__caption') as HTMLElement;
    await expect(caption.textContent).toMatch(/of the page seen/);
  },
};

export const MobileAt390: Story = {
  name: 'Mobile · 390px',
  parameters: at('mobile'),
  render: mobileJourney(arrivals, 3),
  play: async ({ canvasElement }) => {
    await assertNoSidewaysScroll(canvasElement);
    for (const t of canvasElement.querySelectorAll('.cg-visit-m__trigger')) {
      // The whole summary is the target, comfortably past the 44px minimum.
      await expect(t.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    }
  },
};

export const TabletTransition: Story = {
  name: 'Tablet · cards, two columns, no sideways scroll',
  parameters: { viewport: { defaultViewport: 'tablet' } },
  render: mobileJourney(arrivals, 3),
  play: async ({ canvasElement }) => {
    const list = canvasElement.querySelector('.cg-journey') as HTMLElement;
    // Above the stacked breakpoint the cards return , but only two at a time.
    await expect(list.classList.contains('cg-journey--stacked')).toBe(false);
    await expect(canvasElement.querySelectorAll('.cg-visit').length).toBeGreaterThan(0);
    await expect(getComputedStyle(list).gridTemplateColumns.split(' ')).toHaveLength(2);
    await expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth + 1);
  },
};

export const DesktopPreserved: Story = {
  name: 'Desktop · journey unchanged',
  parameters: { viewport: { defaultViewport: 'desktop' } },
  render: mobileJourney(arrivals, 3),
  play: async ({ canvasElement }) => {
    const list = canvasElement.querySelector('.cg-journey') as HTMLElement;
    await expect(list.classList.contains('cg-journey--stacked')).toBe(false);
    await expect(canvasElement.querySelectorAll('.cg-visit-m')).toHaveLength(0);
    await expect(canvasElement.querySelector('.cg-journey__jump')).toBeNull();
    // Five columns, the approved desktop grid.
    await expect(getComputedStyle(list).gridTemplateColumns.split(' ')).toHaveLength(5);
    const decisive = canvasElement.querySelector('.cg-visit--decisive') as HTMLElement;
    await expect(getComputedStyle(decisive).animationName).toBe('cg-decisive-reflection-position');
    await expect(within(canvasElement).getByText('blocked here')).toBeVisible();
  },
};

export const MobileTenArrivals: Story = {
  name: 'Mobile · ten arrivals',
  parameters: at('mobile'),
  render: mobileJourney(
    Array.from({ length: 10 }, (_, i) => ({
      confidence: 20 + i * 8,
      timestamp: `1${i < 5 ? 4 : 5}/08/2025, 0${i}:1${i}`,
      decisive: i === 6,
      verdict: i === 6 ? 'blocked here' : undefined,
    })),
    7,
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('.cg-visit-m')).toHaveLength(10);
    // However long the journey, exactly one arrival is open.
    await expect(canvasElement.querySelectorAll('[aria-expanded="true"]')).toHaveLength(1);
    await assertNoSidewaysScroll(canvasElement);
  },
};

export const MobileAt375: Story = {
  name: 'Mobile · 375px',
  parameters: at('mobile375'),
  render: mobileJourney(arrivals, 3),
  play: async ({ canvasElement }) => assertNoSidewaysScroll(canvasElement),
};

export const MobileAt430: Story = {
  name: 'Mobile · 430px',
  parameters: at('mobile430'),
  render: mobileJourney(arrivals, 3),
  play: async ({ canvasElement }) => assertNoSidewaysScroll(canvasElement),
};

export const MobileReflectionOnlyWhenOpen: Story = {
  name: 'Mobile · reflection runs only while expanded',
  parameters: at('mobile'),
  render: mobileJourney(arrivals, 3),
  play: async ({ canvasElement }) => {
    const item = canvasElement.querySelector('.cg-visit-m--decisive') as HTMLElement;
    const panel = item.querySelector('.cg-visit-m__panel') as HTMLElement;
    const trigger = item.querySelector('.cg-visit-m__trigger') as HTMLElement;

    // Open: the decorative layer is rendered, inert, and out of the a11y tree.
    await expect(panel.hidden).toBe(false);
    const mark = panel.querySelector('.cg-visit__reflection-logo') as HTMLElement;
    await expect(mark).toHaveAttribute('aria-hidden', 'true');
    await expect(getComputedStyle(mark).pointerEvents).toBe('none');

    // Collapsed: the panel leaves the layout, so the browser itself stops the
    // sweep , a `display: none` element runs no animation.
    await userEvent.click(trigger);
    await expect(panel.hidden).toBe(true);
    await expect(getComputedStyle(panel).display).toBe('none');
    const sweeps = item
      .getAnimations({ subtree: true })
      .filter((a) => (a as CSSAnimation).animationName === 'cg-decisive-reflection-position');
    await expect(sweeps).toHaveLength(0);

    // Reopening resumes the autonomous schedule , the tap does not drive it.
    await userEvent.click(trigger);
    await expect(panel.hidden).toBe(false);
    await expect(getComputedStyle(panel).animationName).toBe('cg-decisive-reflection-position');
  },
};

export const DesktopHoverPreserved: Story = {
  name: 'Desktop · hover still opens the disclosure',
  parameters: { viewport: { defaultViewport: 'desktop' } },
  args: {
    ...decisiveArgs,
    explanation: { title: 'Why this arrival was blocked', content: <p>Four high-severity signals agreed.</p> },
  },
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('.cg-visit--decisive') as HTMLElement;
    await expect(card).toHaveAttribute('aria-expanded', 'false');
    await userEvent.hover(card);
    await expect(card).toHaveAttribute('aria-expanded', 'true');
    await userEvent.unhover(card);
  },
};

export const TouchDeviceNoHover: Story = {
  name: 'Touch · hover does not reveal, tap does',
  parameters: { viewport: { defaultViewport: 'desktop' } },
  args: DesktopHoverPreserved.args,
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('.cg-visit--decisive') as HTMLElement;

    /* Report a touch screen. A real one still dispatches compatibility mouse
       events after a tap, which is exactly how a hover-opened panel gets stuck
       open with no way to dismiss it by moving away. */
    const real = window.matchMedia;
    window.matchMedia = ((query: string) =>
      query.includes('hover: hover')
        ? ({ matches: false, media: query, addEventListener() {}, removeEventListener() {} } as unknown as MediaQueryList)
        : real.call(window, query)) as typeof window.matchMedia;

    try {
      card.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      card.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      await expect(card).toHaveAttribute('aria-expanded', 'false');

      // The explicit path still works on the same device.
      await userEvent.click(card);
      await expect(card).toHaveAttribute('aria-expanded', 'true');
    } finally {
      window.matchMedia = real;
    }
  },
};
