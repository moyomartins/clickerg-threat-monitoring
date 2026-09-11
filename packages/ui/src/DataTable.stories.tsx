import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { DataTable, type Column, type SortState } from './DataTable';
import { StatusPill, type VisitorStatus } from './StatusPill';
import { EmptyState } from './Feedback';
import { Button } from './Button';

interface Row {
  ip: string;
  status: VisitorStatus;
  location: string;
  visits: number;
  paid: number;
  lastSeen: string;
  why: string;
}

const ROWS: Row[] = [
  { ip: '41.203.88.7', status: 'blocked', location: 'Lagos, NG', visits: 31, paid: 29, lastSeen: '14 Aug, 03:10', why: '29 paid clicks in 2 days, no engagement on any' },
  { ip: '82.14.90.221', status: 'ambiguous', location: 'Leeds, GB', visits: 9, paid: 6, lastSeen: '13 Aug, 19:02', why: 'Converted once, but clicks arrive on a fixed cadence' },
  { ip: '104.28.11.4', status: 'review', location: 'Frankfurt, DE', visits: 12, paid: 12, lastSeen: '13 Aug, 08:44', why: 'Datacenter IP, engagement improving' },
  { ip: '90.201.6.18', status: 'allowed', location: 'Bristol, GB', visits: 4, paid: 1, lastSeen: '11 Aug, 12:20', why: '—' },
  { ip: '178.62.40.9', status: 'incomplete', location: 'Unknown', visits: 2, paid: 2, lastSeen: '10 Aug, 22:05', why: 'Tag stopped reporting mid-session' },
];

const columns: Column<Row>[] = [
  { key: 'status', header: 'Status', sortable: true, width: '150px', render: (r) => <StatusPill status={r.status} /> },
  { key: 'ip', header: 'IP address', sortable: true, render: (r) => <span className="cg-mono">{r.ip}</span> },
  { key: 'location', header: 'Location', sortable: true, render: (r) => r.location },
  { key: 'visits', header: 'Visits', sortable: true, render: (r) => `${r.visits} (${r.paid} paid)` },
  { key: 'lastSeen', header: 'Last seen', sortable: true, render: (r) => r.lastSeen },
  { key: 'why', header: 'Why', render: (r) => <span style={{ color: 'var(--cg-muted)' }}>{r.why}</span> },
];

function Demo({ rows, loading }: { rows: Row[]; loading?: boolean }) {
  const [sort, setSort] = useState<SortState>({ key: 'visits', direction: 'desc' });
  const sorted = [...rows].sort((a, b) => {
    const av = a[sort.key as keyof Row];
    const bv = b[sort.key as keyof Row];
    const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
    return sort.direction === 'asc' ? cmp : -cmp;
  });
  return (
    <DataTable
      caption="Visitors"
      columns={columns}
      rows={sorted}
      rowKey={(r) => r.ip}
      sort={sort}
      loading={loading}
      onSortChange={(key) =>
        setSort((s) => ({ key, direction: s.key === key && s.direction === 'desc' ? 'asc' : 'desc' }))
      }
      onRowClick={() => {}}
      isRowFlagged={(r) => r.status === 'blocked'}
      empty={
        <EmptyState
          title="No visitors match these filters"
          body="Try widening the date range or clearing the paid-only filter."
          action={<Button variant="ghost" size="sm">Reset filters</Button>}
        />
      }
    />
  );
}

const meta = {
  title: 'Components/DataTable',
  component: DataTable,
  parameters: { layout: 'padded' },
  // The stories drive a stateful wrapper; these satisfy the required props so
  // autodocs can still generate the prop table from the component itself.
  args: { columns: [], rows: [], rowKey: () => '', caption: 'Visitors' },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: () => <Demo rows={ROWS} /> };
export const Loading: Story = { render: () => <Demo rows={[]} loading /> };
export const Empty: Story = { render: () => <Demo rows={[]} /> };
export const SingleRow: Story = { render: () => <Demo rows={ROWS.slice(0, 1)} /> };

export const SortingWorks: Story = {
  name: 'Interaction: header toggles sort direction',
  render: () => <Demo rows={ROWS} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const header = canvas.getByRole('button', { name: /ip address/i });
    await userEvent.click(header);
    await expect(header.closest('th')).toHaveAttribute('aria-sort', 'descending');
    await userEvent.click(header);
    await expect(header.closest('th')).toHaveAttribute('aria-sort', 'ascending');
  },
};
