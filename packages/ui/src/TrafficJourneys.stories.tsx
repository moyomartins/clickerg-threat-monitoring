import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { VisitorDetail } from '../../../src/VisitorDetail';
import { VISITORS, NOTABLE } from '../../../src/data/mock';
import '../../../src/index.css';

const meta = {
  title: 'Traffic/Reference journeys',
  component: VisitorDetail,
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <main className="app cg-root"><Story /></main>],
  args: { visitor: VISITORS.find(v => v.ip === NOTABLE.obviouslyMalicious), onBack: () => {}, onStatusChange: () => {} },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: args.visitor!.ip })).toBeVisible();
    await expect(canvasElement.querySelectorAll('.cg-visit')).toHaveLength(args.visitor!.visits.length);
  },
} satisfies Meta<typeof VisitorDetail>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Malicious: Story = {};
export const MixedSourceShopper: Story = { args: { visitor: VISITORS.find(v => v.ip === NOTABLE.repeatShopper) } };
export const Ambiguous: Story = { args: { visitor: VISITORS.find(v => v.ip === NOTABLE.conversionConflict) } };
export const SharedNetwork: Story = { args: { visitor: VISITORS.find(v => v.ip === NOTABLE.sharedNetwork) } };
export const Incomplete: Story = { args: { visitor: VISITORS.find(v => v.ip === NOTABLE.trackingStopped) } };
export const InsufficientEvidence: Story = { args: { visitor: VISITORS.find(v => v.ip === NOTABLE.insufficientEvidence) } };
export const FreeTraffic: Story = { args: { visitor: VISITORS.find(v => v.ip === NOTABLE.highEngagementFree) } };
export const ManualOverride: Story = { args: { visitor: VISITORS.find(v => v.ip === NOTABLE.manualOverride) } };
