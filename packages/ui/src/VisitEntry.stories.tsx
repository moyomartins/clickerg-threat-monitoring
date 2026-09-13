import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
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
