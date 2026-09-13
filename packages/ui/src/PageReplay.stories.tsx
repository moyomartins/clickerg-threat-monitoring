import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageReplay } from './PageReplay';

const meta = {
  title: 'Components/PageReplay',
  component: PageReplay,
  parameters: { layout: 'padded' },
  args: {
    size: 'card',
    caption: true,
    loading: false,
    behaviour: { scrollPct: 4, dwellSec: 1, clicks: 1, mouseMoves: 0 },
  },
  argTypes: { size: { control: 'radio', options: ['strip', 'card', 'hero'] } },
  render: (args) => <div style={{ width: 'min(100%, 320px)', minWidth: 240, padding: 24 }}><PageReplay {...args} /></div>,
} satisfies Meta<typeof PageReplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LowDepthShortDwell: Story = { args: { size: 'card', caption: true, loading: false, behaviour: { scrollPct: 4, dwellSec: 1, clicks: 1, mouseMoves: 0 } } };
export const HighDepthLongDwell: Story = {
  args: { size: 'card', behaviour: { scrollPct: 74, dwellSec: 134, clicks: 5, mouseMoves: 312 } },
};
export const Strip: Story = { args: { size: 'strip', caption: true, loading: false, behaviour: { scrollPct: 4, dwellSec: 1, clicks: 1, mouseMoves: 0 } } };
export const Hero: Story = { args: { size: 'hero', caption: true, loading: false, behaviour: { scrollPct: 74, dwellSec: 134, clicks: 5, mouseMoves: 312 } }, render: (args) => <div style={{ width: 'min(100%, 560px)', padding: 24 }}><PageReplay {...args} /></div> };
export const Loading: Story = { args: { size: 'card', caption: true, loading: true, behaviour: { scrollPct: 4, dwellSec: 1, clicks: 1, mouseMoves: 0 } } };
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
