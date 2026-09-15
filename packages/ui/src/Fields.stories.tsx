import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Field, FilterBar, FilterGroup, Select, SteppedRangeField, TextInput, Toggle } from './Fields';
import { Button } from './Button';
import { SortDirectionIcon } from './SortDirectionIcon';
import { MobileFilterControls, type MobileFilterValues, type MobileSortOption } from './MobileFilterControls';
import type { SortState } from './DataTable';

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

/* ── The filter row at phone widths ──────────────────────────────────────────
   The desktop bar above shows every control at once. Below 768px the same
   stack pushed the first visitor most of a screen down, so the search stays
   out and the rest collapses behind a Filter and a Sort trigger. These use the
   production component with the production option lists; only the applied
   state lives in the harness, exactly as VisitorList owns it in the app. */

const M_STATUS = [
  { value: 'all', label: 'All statuses' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'ambiguous', label: 'Judgement call' },
  { value: 'review', label: 'Under review' },
  { value: 'allowed', label: 'Not blocked' },
  { value: 'incomplete', label: 'Incomplete data' },
];
const M_WINDOWS = [
  { value: 'all', label: 'All time' },
  { value: '1', label: 'Last 24 hours' },
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
];
const M_SORTS: MobileSortOption[] = [
  { value: 'lastSeen', label: 'Last seen', kind: 'date' },
  { value: 'status', label: 'Status', kind: 'text' },
  { value: 'confidence', label: 'Confidence', kind: 'amount' },
  { value: 'spend', label: 'Spend', kind: 'amount' },
  { value: 'visits', label: 'Visit count', kind: 'amount' },
  { value: 'ip', label: 'IP address', kind: 'text' },
  { value: 'location', label: 'Location', kind: 'text' },
];
const M_DEFAULTS: MobileFilterValues = { status: 'all', country: 'all', window: 'all', paidOnly: false, minBot: 0 };
const M_COUNTRIES = ['Brazil', 'Canada', 'Germany', 'Ireland', 'Portugal', 'Singapore', 'United Kingdom', 'Vietnam'];

function MobileControlsDemo({
  initial, countries = M_COUNTRIES,
}: { initial?: Partial<MobileFilterValues>; countries?: string[] }) {
  const [query, setQuery] = useState('');
  const [values, setValues] = useState<MobileFilterValues>({ ...M_DEFAULTS, ...initial });
  const [sort, setSort] = useState<SortState>({ key: 'lastSeen', direction: 'desc' });
  return (
    <>
      <MobileFilterControls
        query={query}
        onQueryChange={setQuery}
        values={values}
        defaults={M_DEFAULTS}
        onApply={setValues}
        statusOptions={M_STATUS}
        countryOptions={[{ value: 'all', label: 'Everywhere' }, ...countries.map((c) => ({ value: c, label: c }))]}
        windowOptions={M_WINDOWS}
        sort={sort}
        sortOptions={M_SORTS}
        onSortChange={setSort}
      />
      {/* Readouts, so a story can tell an uncommitted draft from applied state. */}
      <p data-testid="applied" hidden>{JSON.stringify(values)}</p>
      <p data-testid="sort" hidden>{`${sort.key}/${sort.direction}`}</p>
    </>
  );
}

const mobile = { viewport: { defaultViewport: 'mobile' } };
const applied = (c: HTMLElement) => JSON.parse(c.querySelector('[data-testid="applied"]')!.textContent!);
const sortOf = (c: HTMLElement) => c.querySelector('[data-testid="sort"]')!.textContent;
const triggers = (c: HTMLElement) => [...c.querySelectorAll<HTMLButtonElement>('.cg-mfilters__trigger')];
const panel = (c: HTMLElement) => c.querySelector('.cg-mfilters__panel');
const inPanel = (c: HTMLElement, name: string | RegExp) => within(panel(c) as HTMLElement).getByRole('button', { name });

const assertNoOverflow = async (c: HTMLElement) => {
  const root = c.querySelector('.cg-mfilters') as HTMLElement;
  const limit = Math.ceil(root.getBoundingClientRect().right);
  for (const el of c.querySelectorAll<HTMLElement>('.cg-mfilters *')) {
    const box = el.getBoundingClientRect();
    if (box.width === 0) continue;
    await expect(box.right).toBeLessThanOrEqual(limit + 1);
  }
};

export const MobileCollapsed: Story = {
  name: 'Mobile: collapsed controls',
  parameters: mobile,
  render: () => <MobileControlsDemo />,
  play: async ({ canvasElement }) => {
    // Search stays out; nothing else does.
    await expect(within(canvasElement).getByLabelText('Search IP, city or campaign')).toBeVisible();
    await expect(canvasElement.querySelectorAll('.cg-mfilters select')).toHaveLength(0);
    await expect(canvasElement.querySelector('.cg-mfilters input[type="range"]')).toBeNull();
    await expect(panel(canvasElement)).toBeNull();

    const [filter, sort] = triggers(canvasElement);
    await expect(filter).toHaveAttribute('aria-expanded', 'false');
    await expect(sort).toHaveAttribute('aria-expanded', 'false');
    await expect(filter).toHaveAccessibleName('Filter visitors');
    await expect(sort).toHaveAccessibleName('Sort visitors, Last seen, Newest first');
    for (const t of [filter, sort]) {
      await expect(t.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
      await expect(t).toHaveAttribute('aria-controls');
    }
    // They share the row evenly.
    await expect(Math.abs(filter.getBoundingClientRect().width - sort.getBoundingClientRect().width)).toBeLessThan(2);
    // No space is reserved for a summary that has nothing to say.
    await expect(canvasElement.querySelector('.cg-mfilters__summary')).toBeNull();
    await assertNoOverflow(canvasElement);
  },
};

export const MobileFilterPanelOpen: Story = {
  name: 'Mobile: filter panel open',
  parameters: mobile,
  render: () => <MobileControlsDemo />,
  play: async ({ canvasElement }) => {
    const [filter, sort] = triggers(canvasElement);
    await userEvent.click(filter);

    await expect(filter).toHaveAttribute('aria-expanded', 'true');
    await expect(panel(canvasElement)!.id).toBe(filter.getAttribute('aria-controls'));
    await expect(within(canvasElement).getByText('Filter visitors')).toBeVisible();
    // Opening moves focus into the panel, at its heading.
    await expect(canvasElement.querySelector('.cg-mfilters__panel-title')).toHaveFocus();

    // The five filters, and deliberately not the sort controls.
    for (const label of ['Status', 'Country', 'Last seen', 'Minimum bot probability', 'Paid clicks only']) {
      await expect(within(panel(canvasElement) as HTMLElement).getByLabelText(label)).toBeInTheDocument();
    }
    await expect(within(panel(canvasElement) as HTMLElement).queryByLabelText('Sort by')).toBeNull();
    await expect(inPanel(canvasElement, 'Reset')).toBeVisible();
    await expect(inPanel(canvasElement, 'Apply filters')).toBeVisible();

    // Only one panel at a time: opening Sort closes this.
    await userEvent.click(sort);
    await expect(filter).toHaveAttribute('aria-expanded', 'false');
    await expect(sort).toHaveAttribute('aria-expanded', 'true');
    await expect(canvasElement.querySelectorAll('.cg-mfilters__panel')).toHaveLength(1);
    await assertNoOverflow(canvasElement);
  },
};

export const MobileSortPanelOpen: Story = {
  name: 'Mobile: sort panel open',
  parameters: mobile,
  render: () => <MobileControlsDemo />,
  play: async ({ canvasElement }) => {
    await userEvent.click(triggers(canvasElement)[1]);
    const p = panel(canvasElement) as HTMLElement;
    await expect(within(canvasElement).getByText('Sort visitors')).toBeVisible();
    await expect(within(p).getByLabelText('Sort by')).toBeInTheDocument();
    // No filter fields leak into the sort panel.
    await expect(within(p).queryByLabelText('Status')).toBeNull();

    /* Direction is described in the field's own terms, never a bare arrow. */
    await expect(within(p).getByLabelText(/Newest first/)).toBeChecked();
    await userEvent.click(within(p).getByLabelText(/Oldest first/));
    await expect(sortOf(canvasElement)).toBe('lastSeen/asc');

    // Changing the field rewords the directions rather than keeping date copy.
    await userEvent.selectOptions(within(p).getByLabelText('Sort by'), 'spend');
    await expect(sortOf(canvasElement)).toBe('spend/asc');
    await expect(within(p).getByLabelText(/Lowest first/)).toBeChecked();
    await expect(within(p).getByLabelText(/Highest first/)).toBeInTheDocument();
    await expect(triggers(canvasElement)[1]).toHaveAccessibleName('Sort visitors, Spend, Lowest first');
  },
};

export const MobileDraftsUntilApplied: Story = {
  name: 'Mobile: changes stay drafts until applied',
  parameters: mobile,
  render: () => <MobileControlsDemo />,
  play: async ({ canvasElement }) => {
    const [filter] = triggers(canvasElement);
    await userEvent.click(filter);
    const p = () => panel(canvasElement) as HTMLElement;

    // Several filters set in one visit, nothing committed yet.
    await userEvent.selectOptions(within(p()).getByLabelText('Status'), 'blocked');
    await userEvent.selectOptions(within(p()).getByLabelText('Last seen'), '7');
    await expect(applied(canvasElement)).toMatchObject({ status: 'all', window: 'all' });

    // Closing without applying preserves what was applied before.
    await userEvent.keyboard('{Escape}');
    await expect(panel(canvasElement)).toBeNull();
    await expect(filter).toHaveFocus();
    await expect(applied(canvasElement)).toMatchObject({ status: 'all', window: 'all' });

    // Reopening reflects applied state, not the discarded draft.
    await userEvent.click(filter);
    await expect(within(p()).getByLabelText('Status')).toHaveValue('all');

    // Apply commits and closes.
    await userEvent.selectOptions(within(p()).getByLabelText('Status'), 'blocked');
    await userEvent.selectOptions(within(p()).getByLabelText('Last seen'), '7');
    await userEvent.click(inPanel(canvasElement, 'Apply filters'));
    await expect(panel(canvasElement)).toBeNull();
    await expect(filter).toHaveFocus();
    await expect(applied(canvasElement)).toMatchObject({ status: 'blocked', window: '7' });
  },
};

export const MobileOneActiveFilter: Story = {
  name: 'Mobile: one active filter',
  parameters: mobile,
  render: () => <MobileControlsDemo initial={{ status: 'blocked' }} />,
  play: async ({ canvasElement }) => {
    const [filter] = triggers(canvasElement);
    // The count is a number, not a colour.
    await expect(canvasElement.querySelector('.cg-mfilters__badge')).toHaveTextContent('1');
    await expect(filter).toHaveAccessibleName('Filter visitors, 1 active');
    await expect(within(canvasElement).getByText('Blocked')).toBeVisible();
    // A single filter needs no Clear all.
    await expect(within(canvasElement).queryByRole('button', { name: 'Clear all' })).toBeNull();

    // Removing the only chip empties the summary entirely.
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Remove filter Blocked' }));
    await expect(applied(canvasElement)).toMatchObject({ status: 'all' });
    await expect(canvasElement.querySelector('.cg-mfilters__summary')).toBeNull();
  },
};

export const MobileMultipleActiveFilters: Story = {
  name: 'Mobile: multiple active filters',
  parameters: mobile,
  render: () => <MobileControlsDemo initial={{ status: 'blocked', window: '7', paidOnly: true, minBot: 50 }} />,
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('.cg-mfilters__badge')).toHaveTextContent('4');
    await expect(triggers(canvasElement)[0]).toHaveAccessibleName('Filter visitors, 4 active');
    await expect(canvasElement.querySelectorAll('.cg-mfilters__chip')).toHaveLength(4);
    // Each chip says what it is and how to undo it.
    for (const label of ['Blocked', 'Last 7 days', 'Bot probability 50%+', 'Paid clicks only']) {
      await expect(within(canvasElement).getByRole('button', { name: `Remove filter ${label}` })).toBeInTheDocument();
    }
    await assertNoOverflow(canvasElement);

    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Clear all' }));
    await expect(applied(canvasElement)).toEqual(M_DEFAULTS);
    await expect(canvasElement.querySelector('.cg-mfilters__summary')).toBeNull();
  },
};

export const MobileLongOptionLabels: Story = {
  name: 'Mobile: long option labels',
  parameters: mobile,
  render: () => (
    <MobileControlsDemo
      initial={{ country: 'United States Minor Outlying Islands' }}
      countries={['Canada', 'United Kingdom', 'United States Minor Outlying Islands']}
    />
  ),
  play: async ({ canvasElement }) => {
    // A long value wraps onto another line rather than widening the page.
    await expect(within(canvasElement).getByText('United States Minor Outlying Islands')).toBeVisible();
    await assertNoOverflow(canvasElement);
    await userEvent.click(triggers(canvasElement)[0]);
    await assertNoOverflow(canvasElement);
  },
};

export const MobileBotProbabilityChanged: Story = {
  name: 'Mobile: minimum bot probability changed',
  parameters: mobile,
  render: () => <MobileControlsDemo initial={{ minBot: 75 }} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Bot probability 75%+')).toBeVisible();
    await userEvent.click(triggers(canvasElement)[0]);
    /* The range's own value is the step index, so the meaningful assertion is
       the value the reader is given. */
    await expect(within(panel(canvasElement) as HTMLElement).getByLabelText('Minimum bot probability'))
      .toHaveAttribute('aria-valuetext', '75 percent or higher');
  },
};

export const MobilePaidClicksOnly: Story = {
  name: 'Mobile: paid clicks only enabled',
  parameters: mobile,
  render: () => <MobileControlsDemo initial={{ paidOnly: true }} />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Paid clicks only')).toBeVisible();
    await userEvent.click(triggers(canvasElement)[0]);
    await expect(within(panel(canvasElement) as HTMLElement).getByLabelText('Paid clicks only')).toBeChecked();
  },
};

export const MobileFilterReset: Story = {
  name: 'Mobile: filter reset',
  parameters: mobile,
  render: () => <MobileControlsDemo initial={{ status: 'blocked', window: '7', minBot: 50 }} />,
  play: async ({ canvasElement }) => {
    await userEvent.click(triggers(canvasElement)[0]);
    const p = () => panel(canvasElement) as HTMLElement;
    await userEvent.click(inPanel(canvasElement, 'Reset'));

    // Reset returns the draft to defaults, and is itself still a draft.
    await expect(within(p()).getByLabelText('Status')).toHaveValue('all');
    await expect(within(p()).getByLabelText('Last seen')).toHaveValue('all');
    await expect(applied(canvasElement)).toMatchObject({ status: 'blocked' });

    await userEvent.click(inPanel(canvasElement, 'Apply filters'));
    await expect(applied(canvasElement)).toEqual(M_DEFAULTS);
  },
};

export const MobileNarrow320: Story = {
  name: 'Mobile: 320px',
  parameters: { viewport: { defaultViewport: 'mobile320' } },
  render: () => <MobileControlsDemo initial={{ status: 'blocked', window: '7', minBot: 25 }} />,
  play: async ({ canvasElement }) => {
    await assertNoOverflow(canvasElement);
    // The sort value is dropped at this width; the accessible name still has it.
    await expect(getComputedStyle(canvasElement.querySelector('.cg-mfilters__trigger-value') as HTMLElement).display).toBe('none');
    await expect(triggers(canvasElement)[1]).toHaveAccessibleName('Sort visitors, Last seen, Newest first');
    await userEvent.click(triggers(canvasElement)[0]);
    await assertNoOverflow(canvasElement);
    await userEvent.click(triggers(canvasElement)[1]);
    await assertNoOverflow(canvasElement);
  },
};

export const MobileKeyboardAndDismissal: Story = {
  name: 'Mobile: keyboard and dismissal',
  parameters: mobile,
  render: () => <MobileControlsDemo />,
  play: async ({ canvasElement }) => {
    const [filter, sort] = triggers(canvasElement);

    // Keyboard opens, focus lands in the panel, Escape closes and returns it.
    filter.focus();
    await userEvent.keyboard('{Enter}');
    await expect(canvasElement.querySelector('.cg-mfilters__panel-title')).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect(panel(canvasElement)).toBeNull();
    await expect(filter).toHaveFocus();

    // The same trigger pressed again closes and keeps focus put.
    await userEvent.click(sort);
    await expect(sort).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(sort);
    await expect(panel(canvasElement)).toBeNull();
    await expect(sort).toHaveFocus();

    // A press outside dismisses without committing anything.
    await userEvent.click(filter);
    await userEvent.selectOptions(within(panel(canvasElement) as HTMLElement).getByLabelText('Status'), 'blocked');
    await userEvent.click(within(canvasElement).getByLabelText('Search IP, city or campaign'));
    await expect(panel(canvasElement)).toBeNull();
    await expect(applied(canvasElement)).toMatchObject({ status: 'all' });
  },
};

export const DesktopBarUnchanged: Story = {
  name: 'Desktop: inline bar unchanged',
  parameters: { viewport: { defaultViewport: 'desktop' } },
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    // The desktop bar shows every control inline, with no disclosure triggers.
    await expect(canvasElement.querySelector('.cg-filterbar')).not.toBeNull();
    await expect(canvasElement.querySelector('.cg-mfilters')).toBeNull();
    await expect(canvasElement.querySelectorAll('.cg-mfilters__trigger')).toHaveLength(0);
    for (const label of ['Status', 'Country', 'Last seen', 'Sort by']) {
      await expect(within(canvasElement).getByLabelText(label)).toBeVisible();
    }
  },
};
