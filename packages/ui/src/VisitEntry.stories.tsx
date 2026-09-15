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

function assertCardFits(canvasElement: HTMLElement) {
  const card = canvasElement.querySelector('.cg-visit') as HTMLElement;
  const row = canvasElement.querySelector('.cg-journey') as HTMLElement;
  const cardBounds = card.getBoundingClientRect();
  const rowBounds = row.getBoundingClientRect();
  expect(cardBounds.left).toBeGreaterThanOrEqual(rowBounds.left);
  expect(cardBounds.right).toBeLessThanOrEqual(rowBounds.right);
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
    const stops = inner.find((rule) => rule.selectorText === '.cg-visit--decisive');
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
  parameters: { viewport: { defaultViewport: 'mobile' } },
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
