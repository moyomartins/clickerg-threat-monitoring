import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageReplay } from './PageReplay';

const meta = {
  title: 'Components/PageReplay',
  component: PageReplay,
  parameters: { layout: 'centered' },
  args: {
    size: 'strip',
    behaviour: { scrollPct: 4, dwellSec: 1, clicks: 1, mouseMoves: 0 },
  },
} satisfies Meta<typeof PageReplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LowDepthShortDwell: Story = {};
export const HighDepthLongDwell: Story = {
  args: { behaviour: { scrollPct: 74, dwellSec: 134, clicks: 5, mouseMoves: 312 } },
};
export const RecordedZeroBehaviour: Story = {
  args: { behaviour: { scrollPct: 0, dwellSec: 0, clicks: 0, mouseMoves: 0 } },
};
export const MissingPageDepth: Story = {
  args: { behaviour: { scrollPct: null, dwellSec: 9, clicks: 1, mouseMoves: 12 } },
};
export const MissingDwellTime: Story = {
  args: { behaviour: { scrollPct: 8, dwellSec: null, clicks: 1, mouseMoves: 12 } },
};
export const MissingPageDepthAndDwellTime: Story = {
  args: { behaviour: { scrollPct: null, dwellSec: null, clicks: 1, mouseMoves: 12 } },
};
export const DecisiveArrival: Story = {
  args: { behaviour: { scrollPct: 0, dwellSec: 3, clicks: 1, mouseMoves: 0 } },
};
export const ReducedMotion: Story = {
  args: { behaviour: { scrollPct: 4, dwellSec: 1, clicks: 1, mouseMoves: 0 } },
  parameters: { chromatic: { disableSnapshot: false } },
};
