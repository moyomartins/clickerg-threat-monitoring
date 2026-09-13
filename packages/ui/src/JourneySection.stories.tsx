import type { Meta, StoryObj } from '@storybook/react-vite';
import { JourneySection } from './JourneySection';

const meta = {
  title: 'Components/JourneySection',
  component: JourneySection,
  parameters: { layout: 'padded' },
  args: {
    id: 'journey-replay',
    count: '7 arrivals · shown in chronological order',
    insight: 'Confidence crossed the blocking threshold on paid arrival 4 after the pattern repeated.',
  },
} satisfies Meta<typeof JourneySection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ThresholdCrossing: Story = {};
export const OneArrival: Story = { args: { count: '1 arrival · shown in chronological order', insight: 'Only one arrival has been recorded, so no repeated pattern is available yet.' } };
export const MixedTraffic: Story = { args: { insight: 'This journey contains 5 paid arrivals and 2 free arrivals.' } };
export const AmbiguousEvidence: Story = { args: { insight: 'Automated timing appeared alongside behavior that suggested genuine intent.' } };
export const ConvertedVisitor: Story = { args: { insight: 'Suspicious click timing was followed by a recorded conversion.' } };
export const GenuineBehaviour: Story = { args: { insight: 'Engagement varied naturally across the visitor’s arrivals.' } };
export const IncompleteData: Story = { args: { insight: 'Some arrival evidence is unavailable because tracking stopped during this journey.' } };
export const NoArrivals: Story = { args: { count: 'No arrivals recorded', insight: 'No arrivals have been recorded yet.' } };
export const LongJourney: Story = { args: { count: '29 arrivals · shown in chronological order' } };
export const NarrowViewport: Story = { parameters: { viewport: { defaultViewport: 'mobile' } } };
