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
          'The list view filter row. Every control is labelled — the label is part of the component, not an optional decoration, because an unlabelled filter is invisible to a screen reader and ambiguous to everyone else.',
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
