import type { Meta, StoryObj } from '@storybook/react-vite';
import { Journey, VisitEntry } from './VisitEntry';

const meta = {
  title: 'Components/VisitEntry',
  component: VisitEntry,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'One visit in a visitor journey. Blocking is cumulative, so each entry carries the running confidence — the advertiser can see where the line was crossed rather than being handed a final verdict.',
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
    note: 'First paid click. Behaviour looks like a normal prospect — nothing to act on.',
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
    note: 'Came back through organic search — this visit cost nothing and is not counted against the ad spend.',
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
    note: 'Sixth paid click in nine hours, all from a datacenter IP, none with any page engagement.',
  },
};

/** The decisive visit: dark node, dark verdict panel, stated in advertiser language. */
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
    note: 'Ninth paid click. Every signal that could point at automation now does.',
    verdict:
      'Blocked here. Nine paid clicks in one night from the same datacenter IP, no scrolling or mouse movement on any of them, five form submissions with undeliverable email addresses, and no conversion. £37.80 of spend with nothing behind it. This IP was added to your Google Ads exclusion list.',
  },
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
    note: 'Our tag stopped reporting mid-session, so engagement was never captured for this visit. It is excluded from the scoring rather than assumed clean.',
  },
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
        note="First paid click, behaves like a prospect."
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
        note="Same IP, now masked and clicking far faster than it reads."
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
        note="Third paid click of the night."
        verdict="Blocked here — the pattern stopped being ambiguous."
      />
    </Journey>
  ),
};
