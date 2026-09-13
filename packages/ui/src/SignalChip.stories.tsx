import type { Meta, StoryObj } from '@storybook/react-vite';
import { SignalChip } from './SignalChip';

const meta = {
  title: 'Components/SignalChip',
  component: SignalChip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'One evaluated signal and its reading. Severity is carried by a dot plus a tint , never by color alone , so the chip still parses in greyscale or with a colour-vision deficiency.',
      },
    },
  },
  args: { label: 'Bot probability', value: '94%', severity: 'high' },
  argTypes: {
    severity: { control: 'inline-radio', options: ['high', 'medium', 'low', 'neutral', 'unknown'] },
  },
} satisfies Meta<typeof SignalChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const High: Story = {};
export const Medium: Story = { args: { label: 'Session similarity', value: '0.71', severity: 'medium' } };
export const Low: Story = { args: { label: 'Conversion', value: 'Purchased £240', severity: 'low' } };
export const Neutral: Story = { args: { label: 'Location', value: 'Manchester, GB', severity: 'neutral' } };
/** Missing data is its own state , a blank chip would read as "fine". */
export const Unknown: Story = { args: { label: 'Form fill', value: undefined, severity: 'unknown' } };
export const WithHint: Story = {
  args: {
    label: 'Click cadence',
    value: '0.4s median',
    severity: 'high',
    hint: 'Repeat clicks arriving faster than a human can read the page.',
  },
};
export const LongValueTruncates: Story = {
  args: { label: 'Campaign', value: 'uk-brand-exact // “clickerg pricing per month”', severity: 'neutral' },
};

export const SignalGrid: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 160px)', gap: 8 }}>
      <SignalChip label="IP address" value="41.203.88.7" severity="neutral" />
      <SignalChip label="Bot probability" value="94%" severity="high" />
      <SignalChip label="VPN / proxy" value="Datacenter IP" severity="high" />
      <SignalChip label="Interaction" value="No scroll, no mouse" severity="high" />
      <SignalChip label="Form fill" value="Invalid email" severity="medium" />
      <SignalChip label="Conversion" value="None" severity="neutral" />
    </div>
  ),
};
