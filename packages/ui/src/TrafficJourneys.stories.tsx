import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { VisitorDetail } from '../../../src/VisitorDetail';
import { TRAFFIC_CASES, TRAFFIC_RECORDS } from '../../../src/data/trafficRepository';
import '../../../src/index.css';

const meta = {
  title: 'Traffic/Reference journeys',
  component: VisitorDetail,
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <main className="app cg-root"><Story /></main>],
  args: { visitor: TRAFFIC_RECORDS.find(v => v.ip === TRAFFIC_CASES.obviouslyMalicious), onBack: () => {}, onStatusChange: () => {} },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: args.visitor!.ip })).toBeVisible();
    await expect(canvasElement.querySelectorAll('.cg-visit')).toHaveLength(args.visitor!.visits.length);
  },
} satisfies Meta<typeof VisitorDetail>;
export default meta;
type Story = StoryObj<typeof meta>;
const journey = (predicate: (visitor: (typeof TRAFFIC_RECORDS)[number]) => boolean) => TRAFFIC_RECORDS.find(predicate)!;
export const Malicious: Story = {};
export const ClearlyLegitimate: Story = { args: { visitor: journey((visitor) => visitor.status === 'allowed' && visitor.revenueGbp > 0) } };
export const MixedSourceShopper: Story = { args: { visitor: TRAFFIC_RECORDS.find(v => v.ip === TRAFFIC_CASES.repeatShopper) } };
export const Ambiguous: Story = { args: { visitor: TRAFFIC_RECORDS.find(v => v.ip === TRAFFIC_CASES.conversionConflict) } };
export const SharedNetwork: Story = { args: { visitor: TRAFFIC_RECORDS.find(v => v.ip === TRAFFIC_CASES.sharedNetwork) } };
export const Incomplete: Story = { args: { visitor: TRAFFIC_RECORDS.find(v => v.ip === TRAFFIC_CASES.trackingStopped) } };
export const InsufficientEvidence: Story = { args: { visitor: TRAFFIC_RECORDS.find(v => v.ip === TRAFFIC_CASES.insufficientEvidence) } };
export const FreeTraffic: Story = { args: { visitor: TRAFFIC_RECORDS.find(v => v.ip === TRAFFIC_CASES.highEngagementFree) } };
export const PaidOnlyJourney: Story = { args: { visitor: journey((visitor) => visitor.visits.every((visit) => visit.channel === 'paid')) } };
export const SingleArrival: Story = { args: { visitor: journey((visitor) => visitor.visits.length === 1) } };
export const LongJourney: Story = { args: { visitor: journey((visitor) => visitor.visits.length >= 18) } };
export const PostBlockArrival: Story = { args: { visitor: journey((visitor) => visitor.status === 'blocked' && visitor.decisiveIndex >= 0 && visitor.visits.length > visitor.decisiveIndex + 1) } };
export const ManualOverride: Story = { args: { visitor: TRAFFIC_RECORDS.find(v => v.ip === TRAFFIC_CASES.manualOverride) } };
