import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Journey, VisitEntry } from './VisitEntry';

const meta = {
  title: 'Components/VisitEntry',
  component: VisitEntry,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'One visit in a visitor journey. Blocking is cumulative, so each entry carries the running confidence — the advertiser can see where the line was crossed rather than being handed a final verdict. Hovering, focusing, or tapping a card reveals its contextual explanation — what happened, what it did to confidence, and whether it was the arrival that decided the case.',
      },
    },
  },
  args: {
    index: 1,
    timestamp: '12 Aug 2025, 09:14',
    channel: 'paid',
    source: 'Google Ads · uk-brand-exact · “clickerg pricing”',
    cost: '£4.20',
    confidence: 22,
    signals: [
      { label: 'Interaction', value: 'Scrolled 60%, 1m12s', severity: 'low' },
      { label: 'Bot probability', value: '18%', severity: 'low' },
      { label: 'VPN / proxy', value: 'None', severity: 'low' },
    ],
    explanation: {
      title: 'What this arrival showed',
      content: (
        <>
          <p className="cg-arrival-pop__body">
            First paid click. Behaviour looks like a normal prospect — nothing stood out on this visit.
          </p>
          <dl className="cg-arrival-pop__facts">
            <div>
              <dt>Confidence</dt>
              <dd className="cg-mono">0% → 22%</dd>
            </div>
            <div>
              <dt>Cost</dt>
              <dd className="cg-mono">£4.20</dd>
            </div>
          </dl>
        </>
      ),
    },
  },
  argTypes: {
    channel: { control: 'inline-radio', options: ['paid', 'organic', 'direct', 'referral'] },
    confidence: { control: { type: 'range', min: 0, max: 100, step: 1 } },
  },
  render: (args) => (
    <Journey>
      <VisitEntry {...args} last />
    </Journey>
  ),
} satisfies Meta<typeof VisitEntry>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PaidVisit: Story = {};

export const OrganicVisit: Story = {
  args: {
    index: 2,
    channel: 'organic',
    source: 'google.com · “clickerg reviews”',
    cost: undefined,
    confidence: 24,
    explanation: {
      title: 'What this arrival showed',
      content: (
        <>
          <p className="cg-arrival-pop__body">
            Came back through organic search — nothing stood out on this visit. This visit did not come
            from an ad, so it counts for half — it tells us about the visitor without costing you anything.
          </p>
          <dl className="cg-arrival-pop__facts">
            <div>
              <dt>Confidence</dt>
              <dd className="cg-mono">22% → 24%</dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>google.com · “clickerg reviews”</dd>
            </div>
          </dl>
        </>
      ),
    },
  },
};

export const RisingSuspicion: Story = {
  args: {
    index: 6,
    timestamp: '14 Aug 2025, 02:41',
    confidence: 68,
    signals: [
      { label: 'Click cadence', value: '0.6s between clicks', severity: 'high' },
      { label: 'Interaction', value: 'No scroll, no mouse', severity: 'high' },
      { label: 'VPN / proxy', value: 'Datacenter IP', severity: 'high' },
      { label: 'Device fingerprint', value: 'Reused across 4 “new” sessions', severity: 'medium' },
    ],
    explanation: {
      title: 'Why confidence increased',
      content: (
        <>
          <p className="cg-arrival-pop__body">
            Against them: it clicked again 0.6s later — faster than the page renders, it registered no
            mouse movement at all, it arrived from a datacenter IP, not a consumer connection. Net effect:
            confidence up.
          </p>
          <dl className="cg-arrival-pop__facts">
            <div>
              <dt>Confidence</dt>
              <dd className="cg-mono">44% → 68%</dd>
            </div>
            <div>
              <dt>Cost</dt>
              <dd className="cg-mono">£4.20</dd>
            </div>
          </dl>
        </>
      ),
    },
  },
};

/** Evidence goes both ways — the explanation states both sides rather than forcing a verdict. */
export const AmbiguousArrival: Story = {
  args: {
    index: 4,
    timestamp: '13 Aug 2025, 14:02',
    confidence: 52,
    signals: [
      { label: 'Click cadence', value: '1.1s between clicks', severity: 'medium' },
      { label: 'Conversion', value: '£249.00', severity: 'low' },
    ],
    explanation: {
      title: 'Why confidence decreased',
      content: (
        <>
          <p className="cg-arrival-pop__body">
            Against them: it clicked again 1.1s later. In their favour: it converted — £249.00 of actual
            revenue. Net effect: confidence down.
          </p>
          <dl className="cg-arrival-pop__facts">
            <div>
              <dt>Confidence</dt>
              <dd className="cg-mono">61% → 52%</dd>
            </div>
            <div>
              <dt>Cost</dt>
              <dd className="cg-mono">£3.85</dd>
            </div>
          </dl>
        </>
      ),
    },
  },
};

/** The decisive visit: dark node, dark verdict panel, stated in advertiser language. */
export const ArrivalTimestampHeader: Story = {
  name: 'Arrival timestamp header',
  args: {
    ...meta.args,
    index: 3,
    confidence: 78,
    timestamp: '14/08/2025, 19:22',
    timestampIso: '2025-08-14T19:22:00.000Z',
    timestampLabel: '14 August 2025 at 19:22',
  },
};

export const BlockingDecision: Story = {
  args: {
    index: 9,
    timestamp: '14 Aug 2025, 03:10',
    confidence: 96,
    decisive: true,
    last: true,
    signals: [
      { label: 'Click cadence', value: '0.4s median', severity: 'high' },
      { label: 'Bot probability', value: '96%', severity: 'high' },
      { label: 'Form fill', value: 'Invalid email ×5', severity: 'high' },
      { label: 'Wasted spend', value: '£37.80', severity: 'high' },
    ],
    verdict:
      'Blocked here. Nine paid clicks in one night from the same datacenter IP, no scrolling or mouse movement on any of them, five form submissions with undeliverable email addresses, and no conversion. £37.80 of spend with nothing behind it. This IP was added to your Google Ads exclusion list.',
    explanation: {
      title: 'Why this arrival was decisive',
      content: (
        <>
          <p className="cg-arrival-pop__body">
            Against them: it clicked again 0.4s later — faster than the page renders, it scored 96% on our
            automation model, it submitted an email address that does not exist. Net effect: confidence up.
          </p>
          <dl className="cg-arrival-pop__facts">
            <div>
              <dt>Confidence</dt>
              <dd className="cg-mono">83% → 96%</dd>
            </div>
            <div>
              <dt>Cost</dt>
              <dd className="cg-mono">£4.20</dd>
            </div>
          </dl>
          <p className="cg-arrival-pop__flag">Confidence crossed the 80% blocking threshold here.</p>
        </>
      ),
    },
  },
};

/** The sweep is decorative: it is disabled by the browser's reduced-motion setting. */
export const BlockingDecisionReducedMotion: Story = {
  ...BlockingDecision,
  parameters: {
    ...BlockingDecision.parameters,
    docs: {
      description: {
        story:
          'Enable reduced motion in the browser or Storybook preview to verify that the decisive card retains its border and verdict without the moving reflection, and that the explanation appears/disappears instantly rather than fading.',
      },
    },
  },
};

export const BlockingDecisionEnteringReflection: Story = {
  args: { ...BlockingDecision.args, reflectionPhase: 'entering' },
};

export const BlockingDecisionCentredReflection: Story = {
  args: { ...BlockingDecision.args, reflectionPhase: 'centred' },
};

export const BlockingDecisionLeavingReflection: Story = {
  args: { ...BlockingDecision.args, reflectionPhase: 'leaving' },
};

export const BlockingDecisionAfterReflection: Story = {
  args: { ...BlockingDecision.args, reflectionPhase: 'exited' },
};

/** Data loss is shown honestly rather than being rendered as a clean signal. */
export const IncompleteSignals: Story = {
  args: {
    index: 3,
    confidence: 41,
    signals: [
      { label: 'Interaction', value: undefined, severity: 'unknown' },
      { label: 'Form fill', value: undefined, severity: 'unknown' },
      { label: 'Bot probability', value: '41%', severity: 'medium' },
    ],
    explanation: {
      title: 'What ClickerG could assess',
      content: (
        <>
          <p className="cg-arrival-pop__body">
            Our tag stopped reporting, so engagement was never captured and was excluded from scoring.
            Against them: it scored 41% on our automation model. Net effect: confidence up.
          </p>
          <dl className="cg-arrival-pop__facts">
            <div>
              <dt>Confidence</dt>
              <dd className="cg-mono">33% → 41%</dd>
            </div>
            <div>
              <dt>Cost</dt>
              <dd className="cg-mono">£4.20</dd>
            </div>
          </dl>
        </>
      ),
    },
  },
};

/** The shortest real explanation: one line, no facts row worth showing beyond confidence. */
export const ShortExplanation: Story = {
  args: {
    index: 1,
    confidence: 4,
    signals: [{ label: 'Interaction', value: 'Scrolled 40%, 22s', severity: 'neutral' }],
    explanation: {
      title: 'What this arrival showed',
      content: (
        <>
          <p className="cg-arrival-pop__body">Nothing stood out on this visit.</p>
          <dl className="cg-arrival-pop__facts">
            <div>
              <dt>Confidence</dt>
              <dd className="cg-mono">0% → 4%</dd>
            </div>
          </dl>
        </>
      ),
    },
  },
};

/** The longest realistic explanation: every kind of fact present at once. */
export const LongExplanation: Story = {
  args: {
    index: 7,
    timestamp: '14 Aug 2025, 02:58',
    confidence: 89,
    signals: [
      { label: 'Click cadence', value: '0.5s between clicks', severity: 'high' },
      { label: 'Bot probability', value: '91%', severity: 'high' },
      { label: 'VPN / proxy', value: 'Datacenter IP', severity: 'high' },
      { label: 'Device fingerprint', value: 'Reused across 6 sessions', severity: 'high' },
      { label: 'Session similarity', value: '0.97', severity: 'high' },
    ],
    explanation: {
      title: 'Why confidence increased',
      content: (
        <>
          <p className="cg-arrival-pop__body">
            Against them: it clicked again 0.5s later — faster than the page renders, it registered no
            mouse movement at all, it scored 91% on our automation model, it arrived from a datacenter IP,
            not a consumer connection, the same browser fingerprint has appeared in 6 supposedly separate
            sessions, it repeated the previous session almost exactly — 97% identical, where real people
            vary far more. Net effect: confidence up.
          </p>
          <dl className="cg-arrival-pop__facts">
            <div>
              <dt>Confidence</dt>
              <dd className="cg-mono">74% → 89%</dd>
            </div>
            <div>
              <dt>Cost</dt>
              <dd className="cg-mono">£4.20</dd>
            </div>
          </dl>
        </>
      ),
    },
  },
};

const closed = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const popover = canvasElement.querySelector('.cg-arrival-pop') as HTMLElement;
  await expect(popover.matches(':popover-open')).toBe(false);
  await expect(within(canvasElement).queryByRole('button', { name: /what this arrival showed/i })).not.toBeInTheDocument();
};

export const DisclosureClosedByDefault: Story = {
  name: 'Disclosure: closed by default',
  play: closed,
};

export const DisclosureOpenOnPointer: Story = {
  name: 'Disclosure: opens on hover',
  play: async ({ canvasElement }) => {
    await closed({ canvasElement });
    const card = canvasElement.querySelector('.cg-visit') as HTMLElement;
    await userEvent.hover(card);
    const popover = canvasElement.querySelector('.cg-arrival-pop') as HTMLElement;
    await waitFor(() => expect(popover.matches(':popover-open')).toBe(true));
    await expect(within(popover).getByText('What this arrival showed')).toBeInTheDocument();
    await userEvent.unhover(card);
  },
};

export const DisclosureOpenOnFocus: Story = {
  name: 'Disclosure: opens on keyboard focus',
  play: async ({ canvasElement }) => {
    await closed({ canvasElement });
    const trigger = within(canvasElement).getByRole('button', { name: /visit 1, 22% confidence/i });
    await userEvent.tab();
    await waitFor(() => expect(trigger).toHaveFocus());
    const popover = canvasElement.querySelector('.cg-arrival-pop') as HTMLElement;
    await waitFor(() => expect(popover.matches(':popover-open')).toBe(true));
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popover.matches(':popover-open')).toBe(false));
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(popover.matches(':popover-open')).toBe(true));
  },
};

export const DisclosureOpenOnTouch: Story = {
  name: 'Disclosure: opens on touch activation',
  play: async ({ canvasElement }) => {
    await closed({ canvasElement });
    const card = within(canvasElement).getByRole('button', { name: /visit 1, 22% confidence/i });
    await userEvent.click(card);
    const popover = canvasElement.querySelector('.cg-arrival-pop') as HTMLElement;
    await waitFor(() => expect(popover.matches(':popover-open')).toBe(true));
  },
};

/** The first card in the strip: the popover must not open off the left edge of the viewport. */
export const FirstCardPositioning: Story = {
  render: () => (
    <Journey>
      <VisitEntry {...meta.args} index={1} />
      <VisitEntry {...meta.args} index={2} timestamp="12 Aug 2025, 10:02" />
      <VisitEntry {...meta.args} index={3} timestamp="12 Aug 2025, 11:47" last />
    </Journey>
  ),
  play: async ({ canvasElement }) => {
    const firstCard = canvasElement.querySelectorAll('.cg-visit')[0] as HTMLElement;
    await userEvent.hover(firstCard);
    const popover = firstCard.parentElement?.querySelector('.cg-arrival-pop') as HTMLElement;
    await waitFor(() => expect(popover.matches(':popover-open')).toBe(true));
    const rect = popover.getBoundingClientRect();
    await expect(rect.left).toBeGreaterThanOrEqual(0);
    await userEvent.unhover(firstCard);
  },
};

/** The last card, scrolled to the strip's right edge: the popover must not open off-screen right. */
export const LastCardPositioning: Story = {
  render: () => (
    <div style={{ width: 360, overflow: 'hidden' }}>
      <Journey>
        <VisitEntry {...meta.args} index={1} />
        <VisitEntry {...meta.args} index={2} timestamp="12 Aug 2025, 10:02" />
        <VisitEntry {...meta.args} index={3} timestamp="12 Aug 2025, 11:47" last />
      </Journey>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const cards = canvasElement.querySelectorAll('.cg-visit');
    const lastCard = cards[cards.length - 1] as HTMLElement;
    lastCard.scrollIntoView();
    await userEvent.hover(lastCard);
    const popover = lastCard.parentElement?.querySelector('.cg-arrival-pop') as HTMLElement;
    await waitFor(() => expect(popover.matches(':popover-open')).toBe(true));
    const rect = popover.getBoundingClientRect();
    await expect(rect.right).toBeLessThanOrEqual(window.innerWidth);
    await userEvent.unhover(lastCard);
  },
};

export const NarrowViewport: Story = {
  parameters: { viewport: { defaultViewport: 'mobile' } },
  globals: { viewport: { value: 'mobile' } },
  render: () => (
    <Journey>
      <VisitEntry {...meta.args} index={1} last />
    </Journey>
  ),
};

export const FullJourney: Story = {
  render: () => (
    <Journey>
      <VisitEntry
        index={1}
        timestamp="12 Aug 2025, 09:14"
        channel="paid"
        source="Google Ads · uk-brand-exact"
        cost="£4.20"
        confidence={22}
        signals={[{ label: 'Interaction', value: 'Scrolled 60%', severity: 'low' }]}
        explanation={{
          title: 'What this arrival showed',
          content: <p className="cg-arrival-pop__body">First paid click, behaves like a prospect.</p>,
        }}
      />
      <VisitEntry
        index={2}
        timestamp="13 Aug 2025, 23:58"
        channel="paid"
        source="Google Ads · uk-brand-exact"
        cost="£4.20"
        confidence={58}
        signals={[
          { label: 'Click cadence', value: '0.8s', severity: 'medium' },
          { label: 'VPN / proxy', value: 'Datacenter IP', severity: 'high' },
        ]}
        explanation={{
          title: 'Why confidence increased',
          content: <p className="cg-arrival-pop__body">Same IP, now masked and clicking far faster than it reads.</p>,
        }}
      />
      <VisitEntry
        index={3}
        timestamp="14 Aug 2025, 03:10"
        channel="paid"
        source="Google Ads · uk-brand-exact"
        cost="£4.20"
        confidence={96}
        decisive
        last
        signals={[{ label: 'Bot probability', value: '96%', severity: 'high' }]}
        verdict="Blocked here — the pattern stopped being ambiguous."
        explanation={{
          title: 'Why this arrival was decisive',
          content: <p className="cg-arrival-pop__body">Third paid click of the night — confidence crossed the blocking threshold here.</p>,
        }}
      />
    </Journey>
  ),
};
