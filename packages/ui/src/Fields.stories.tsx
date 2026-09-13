import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Field, FilterBar, FilterGroup, Select, SteppedRangeField, TextInput, Toggle } from './Fields';
import { Button } from './Button';
import { SortDirectionIcon } from './SortDirectionIcon';

const meta = {
  title: 'Components/FilterBar',
  component: FilterBar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The list view filter row. Every control is labelled , the label is part of the component, not an optional decoration, because an unlabelled filter is invisible to a screen reader and ambiguous to everyone else.',
      },
    },
  },
  args: { children: null },
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

function Demo({ disabled = false }: { disabled?: boolean }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [country, setCountry] = useState('all');
  const [window, setWindow] = useState('all');
  const [sort, setSort] = useState('lastSeen');
  const [descending, setDescending] = useState(true);
  const [paidOnly, setPaidOnly] = useState(false);
  const [bot, setBot] = useState(0);

  return (
    <FilterBar>
      <Field label="Search IP, city or campaign" htmlFor="q" grow>
        <TextInput
          id="q"
          placeholder="41.203.88.7"
          value={query}
          disabled={disabled}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Field>
      <FilterGroup label="Filter by category" fill>
        <Field label="Status" htmlFor="status">
          <Select
            id="status"
            value={status}
            disabled={disabled}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'blocked', label: 'Blocked' },
              { value: 'review', label: 'Under review' },
              { value: 'allowed', label: 'Not blocked' },
            ]}
          />
        </Field>
        <Field label="Country" htmlFor="country">
          <Select id="country" value={country} disabled={disabled} onChange={(e) => setCountry(e.target.value)} options={[{ value: 'all', label: 'Everywhere' }, { value: 'gb', label: 'United Kingdom' }]} />
        </Field>
        <Field label="Last seen" htmlFor="window">
          <Select id="window" value={window} disabled={disabled} onChange={(e) => setWindow(e.target.value)} options={[{ value: 'all', label: 'All time' }, { value: '7', label: 'Last 7 days' }]} />
        </Field>
        <Field label="Sort by" htmlFor="sort">
          <div className="cg-sortfield">
            <Select id="sort" value={sort} disabled={disabled} onChange={(e) => setSort(e.target.value)} options={[{ value: 'lastSeen', label: 'Last seen' }, { value: 'confidence', label: 'Confidence' }]} />
            <Button variant="ghost" size="sm" iconOnly disabled={disabled} aria-label={`Sort ${descending ? 'descending' : 'ascending'}, change direction`} tooltip={`Sort ${descending ? 'descending' : 'ascending'}`} onClick={() => setDescending((value) => !value)}>
              <SortDirectionIcon direction={descending ? 'desc' : 'asc'} />
            </Button>
          </div>
        </Field>
      </FilterGroup>
      <FilterGroup label="Minimum bot probability">
        <SteppedRangeField id="bot" label="Minimum bot probability" value={bot} steps={[0, 25, 50, 75, 100]} disabled={disabled} onChange={setBot} />
      </FilterGroup>
      <FilterGroup label="Paid traffic only">
        <Toggle label="Paid clicks only" checked={paidOnly} onChange={setPaidOnly} disabled={disabled} />
      </FilterGroup>
      <Button variant="ghost" size="sm" disabled={disabled}>
        Reset
      </Button>
    </FilterBar>
  );
}

export const Default: Story = { render: () => <Demo /> };

/** While the first page of data is loading, controls are inert rather than lying about state. */
export const Disabled: Story = { render: () => <Demo disabled /> };

export const Controls: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <Field label="Text input" htmlFor="a">
        <TextInput id="a" placeholder="Placeholder" />
      </Field>
      <Field label="Select" htmlFor="b">
        <Select id="b" options={[{ value: '1', label: 'Option one' }]} />
      </Field>
      <Toggle label="Toggle off" checked={false} onChange={() => {}} />
      <Toggle label="Toggle on" checked onChange={() => {}} />
    </div>
  ),
};

function SelectExample({ disabled = false, invalid = false, value = 'all', narrow = false }: { disabled?: boolean; invalid?: boolean; value?: string; narrow?: boolean }) {
  return <div style={{ width: narrow ? 180 : 360, maxWidth: '100%' }}><Field label="Status" htmlFor="select-example"><Select id="select-example" value={value} disabled={disabled} aria-invalid={invalid || undefined} onChange={() => {}} options={[{ value: 'all', label: 'All statuses' }, { value: 'review', label: 'Under review' }, { value: 'long', label: 'Blocked, awaiting advertising-platform exclusion confirmation' }]} /></Field></div>;
}

export const SelectDefault: Story = { name: 'Select: Default', render: () => <SelectExample /> };
export const SelectWithSelectedValue: Story = { name: 'Select: With selected value', render: () => <SelectExample value="review" /> };
export const SelectFocusVisible: Story = { name: 'Select: Focus visible', render: () => <SelectExample /> , play: async ({ canvasElement }) => { await userEvent.tab(); await expect(within(canvasElement).getByLabelText('Status')).toHaveFocus(); }};
export const SelectDisabled: Story = { name: 'Select: Disabled', render: () => <SelectExample disabled /> };
export const SelectInvalid: Story = { name: 'Select: Invalid', render: () => <SelectExample invalid /> };
export const SelectLongValue: Story = { name: 'Select: Long value', render: () => <SelectExample value="long" /> };
export const SelectNarrowWidth: Story = { name: 'Select: Narrow width', render: () => <SelectExample value="long" narrow /> };
export const SelectMobile: Story = { name: 'Select: Mobile', parameters: { viewport: { defaultViewport: 'mobile' } }, render: () => <SelectExample /> };
export const SelectGroup: Story = { name: 'Select: Group with labels', render: () => <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}><SelectExample /><SelectExample value="review" /></div> };
export const SelectAlignmentGuides: Story = { name: 'Select: 16px alignment guides', render: () => <div style={{ position: 'relative', width: 360, maxWidth: '100%', background: 'repeating-linear-gradient(90deg, transparent 0 15px, #0b5fe9 15px 16px, transparent 16px calc(100% - 16px), #0b5fe9 calc(100% - 16px) calc(100% - 15px), transparent calc(100% - 15px))' }}><SelectExample /></div> };

export const TypingFilters: Story = {
  name: 'Interaction: search accepts input',
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText(/search ip/i);
    await userEvent.type(input, '41.203');
    await expect(input).toHaveValue('41.203');
    await userEvent.click(canvas.getByLabelText(/paid clicks only/i));
    await expect(canvas.getByLabelText(/paid clicks only/i)).toBeChecked();
  },
};
