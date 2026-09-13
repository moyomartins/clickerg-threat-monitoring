import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusPill } from './StatusPill';

const meta = {
  title: 'Components/StatusPill',
  component: StatusPill,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Status is the first thing an advertiser reads in the visitor list. Blocked is the only filled pill — it is the only state with a consequence. Severity tones are deliberately desaturated so the warm-neutral palette survives.',
      },
    },
  },
  args: { status: 'blocked' },
  argTypes: {
    status: {
      control: 'inline-radio',
      options: ['blocked', 'allowed', 'review', 'ambiguous', 'incomplete'],
    },
  },
} satisfies Meta<typeof StatusPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Blocked: Story = { args: { status: 'blocked' } };
export const NotBlocked: Story = { args: { status: 'allowed' } };
export const UnderReview: Story = { args: { status: 'review' } };
export const JudgementCall: Story = { args: { status: 'ambiguous' } };
/** A visitor whose signals failed to record — never silently shown as "clean". */
export const IncompleteData: Story = { args: { status: 'incomplete' } };
export const WithCustomLabel: Story = { args: { status: 'blocked', label: 'Blocked 12 Aug' } };

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <StatusPill status="blocked" />
      <StatusPill status="review" />
      <StatusPill status="ambiguous" />
      <StatusPill status="allowed" />
      <StatusPill status="incomplete" />
    </div>
  ),
};

export const At200Percent: Story = {
  render: () => <div style={{ zoom: 2 }}><StatusPill status="blocked" /></div>,
};

export const ForcedColors: Story = {
  parameters: { backgrounds: { default: 'light' } },
  render: () => <StatusPill status="blocked" />,
};
