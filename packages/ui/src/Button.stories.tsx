import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from './Button';

const arrowAssets = import.meta.glob('../../../arrow/*.svg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const arrows = Object.entries(arrowAssets)
  .map(([path, source]) => ({ name: path.split('/').pop()!, source }))
  .sort((a, b) => a.name.localeCompare(b.name));

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Dark primary actions carry the signature inset shadow. Ghost is the secondary action, cream is tertiary/toolbar, and the pill variant is reserved for icon and toggle actions , never rectangular CTAs.',
      },
    },
  },
  args: { children: 'Add to exclusion list', onClick: fn() },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'ghost', 'cream', 'pill'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: 'primary' } };
export const Ghost: Story = { args: { variant: 'ghost', children: 'Export CSV' } };
export const CreamSurface: Story = { args: { variant: 'cream', children: 'Reset filters' } };
export const Pill: Story = { args: { variant: 'pill', children: '⌄ More signals' } };
export const Small: Story = { args: { variant: 'ghost', size: 'sm', children: 'View journey' } };
export const IconOnly: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 16 }}>
      {arrows.map(({ name, source }) => (
        <div key={name} style={{ display: 'grid', justifyItems: 'center', gap: 8, minWidth: 0 }}>
          <Button variant="ghost" iconOnly aria-label={`Icon reference: ${name}`} tooltip={name}>
            <img src={source} alt="" aria-hidden="true" style={{ width: 16, height: 16, objectFit: 'contain' }} />
          </Button>
          <code style={{ fontSize: 10, overflowWrap: 'anywhere', textAlign: 'center' }}>{name}</code>
        </div>
      ))}
    </div>
  ),
};
export const Disabled: Story = { args: { disabled: true, children: 'Already blocked' } };

export const AllVariants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button {...args} variant="primary">Primary</Button>
      <Button {...args} variant="ghost">Ghost</Button>
      <Button {...args} variant="cream">Cream</Button>
      <Button {...args} variant="pill">Pill</Button>
      <Button {...args} disabled>Disabled</Button>
    </div>
  ),
};

/** States are CSS-driven; this story documents them side by side for review. */
export const States: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Hover darkens ghost/cream with a 4% charcoal tint; active drops opacity to 0.8; focus-visible pairs the soft warm shadow with a real 2px ring so keyboard users are never guessing.',
      },
    },
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button {...args}>Default</Button>
      <Button {...args} className="cg-btn--primary" autoFocus>Focus me with Tab</Button>
      <Button {...args} disabled>Disabled</Button>
    </div>
  ),
};

export const ClickIsWired: Story = {
  name: 'Interaction: click fires onClick',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /add to exclusion list/i }));
    await expect(args.onClick).toHaveBeenCalled();
  },
};
