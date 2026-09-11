import { useMemo, useState } from 'react';
import {
  Button,
  Card,
  DataTable,
  EmptyState,
  Field,
  FilterBar,
  RangeField,
  Select,
  Skeleton,
  StatusPill,
  TextInput,
  Toggle,
  type Column,
  type SortState,
  type VisitorStatus,
} from '@clickerg/ui';
import type { Visitor } from './data/types';
import { NOW } from './data/mock';
import { money, relative } from './format';

const STATUS_RANK: Record<VisitorStatus, number> = {
  blocked: 0,
  ambiguous: 1,
  review: 2,
  incomplete: 3,
  allowed: 4,
};

const WINDOWS = [
  { value: 'all', label: 'All time' },
  { value: '1', label: 'Last 24 hours' },
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
];

const maxBot = (v: Visitor) => Math.max(...v.visits.map((x) => x.botProbability));

interface Props {
  visitors: Visitor[];
  loading: boolean;
  onOpen: (ip: string) => void;
}

export function VisitorList({ visitors, loading, onOpen }: Props) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [country, setCountry] = useState('all');
  const [window, setWindow] = useState('all');
  const [paidOnly, setPaidOnly] = useState(false);
  const [minBot, setMinBot] = useState(0);
  const [sort, setSort] = useState<SortState>({ key: 'lastSeen', direction: 'desc' });

  const countries = useMemo(
    () => [...new Set(visitors.map((v) => v.country))].sort(),
    [visitors],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cutoff = window === 'all' ? 0 : NOW - Number(window) * 86_400_000;

    return visitors.filter((v) => {
      if (status !== 'all' && v.status !== status) return false;
      if (country !== 'all' && v.country !== country) return false;
      if (v.lastSeen < cutoff) return false;
      if (paidOnly && v.paidVisits === 0) return false;
      if (maxBot(v) * 100 < minBot) return false;
      if (!q) return true;
      const haystack = [
        v.ip,
        v.city,
        v.region,
        v.country,
        v.summary,
        ...v.visits.map((x) => `${x.campaign ?? ''} ${x.keyword ?? ''} ${x.referrer ?? ''}`),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [visitors, query, status, country, window, paidOnly, minBot]);

  const rows = useMemo(() => {
    const dir = sort.direction === 'asc' ? 1 : -1;
    const value = (v: Visitor): string | number => {
      switch (sort.key) {
        case 'status':
          return STATUS_RANK[v.status];
        case 'ip':
          return v.ip.split('.').map((n) => n.padStart(3, '0')).join('.');
        case 'location':
          return `${v.country} ${v.city}`;
        case 'visits':
          return v.visits.length;
        case 'spend':
          return v.spendGbp;
        case 'confidence':
          return Math.max(...v.confidence);
        default:
          return v.lastSeen;
      }
    };
    return [...filtered].sort((a, b) => {
      const av = value(a);
      const bv = value(b);
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return cmp * dir;
    });
  }, [filtered, sort]);

  const filtersActive =
    query !== '' || status !== 'all' || country !== 'all' || window !== 'all' || paidOnly || minBot > 0;

  const reset = () => {
    setQuery('');
    setStatus('all');
    setCountry('all');
    setWindow('all');
    setPaidOnly(false);
    setMinBot(0);
  };

  const columns: Column<Visitor>[] = [
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      width: '160px',
      render: (v) => <StatusPill status={v.status} />,
    },
    {
      key: 'ip',
      header: 'IP address',
      sortable: true,
      width: '150px',
      render: (v) => <span className="cg-mono">{v.ip}</span>,
    },
    {
      key: 'location',
      header: 'Location',
      sortable: true,
      render: (v) => (
        <>
          {v.city}
          <span className="cell__sub">{v.country}</span>
        </>
      ),
    },
    {
      key: 'visits',
      header: 'Visits',
      sortable: true,
      width: '120px',
      render: (v) => (
        <>
          {v.visits.length}
          <span className="cell__sub">
            {v.paidVisits} paid · {v.visits.length - v.paidVisits} free
          </span>
        </>
      ),
    },
    {
      key: 'spend',
      header: 'Paid spend',
      sortable: true,
      width: '110px',
      render: (v) => <span className="cg-mono">{money(v.spendGbp)}</span>,
    },
    {
      key: 'confidence',
      header: 'Confidence',
      sortable: true,
      width: '110px',
      render: (v) => <span className="cg-mono">{Math.max(...v.confidence)}%</span>,
    },
    {
      key: 'lastSeen',
      header: 'Last seen',
      sortable: true,
      width: '130px',
      render: (v) => (
        <>
          {relative(v.lastSeen)}
          <span className="cell__sub">{v.visits.length > 1 ? `first seen ${relative(v.firstSeen)}` : 'single visit'}</span>
        </>
      ),
    },
    {
      key: 'why',
      header: 'Why',
      render: (v) => <span className="cell__why" title={v.summary}>{v.summary}</span>,
    },
    {
      key: 'open',
      header: '',
      width: '120px',
      render: (v) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(v.ip);
          }}
        >
          View journey
        </Button>
      ),
    },
  ];

  const blocked = visitors.filter((v) => v.status === 'blocked');
  const wasted = blocked.reduce((s, v) => s + v.spendGbp, 0);

  return (
    <>
      <h1 className="page__title">Threat monitoring</h1>
      <p className="page__lede">
        Every visitor that has landed on your site from an ad, and what we decided about them. Blocking is
        cumulative — open any visitor to see the whole journey and the point where we made the call.
      </p>

      <div className="stats">
        <Card density="compact">
          <span className="stat__value">{loading ? <Skeleton width="60px" height="28px" /> : visitors.length}</span>
          <span className="stat__label">Visitors seen</span>
        </Card>
        <Card density="compact">
          <span className="stat__value">{loading ? <Skeleton width="60px" height="28px" /> : blocked.length}</span>
          <span className="stat__label">Blocked</span>
        </Card>
        <Card density="compact">
          <span className="stat__value">
            {loading ? <Skeleton width="90px" height="28px" /> : money(wasted)}
          </span>
          <span className="stat__label">Spend behind blocked IPs</span>
        </Card>
        <Card density="compact">
          <span className="stat__value">
            {loading ? <Skeleton width="60px" height="28px" /> : visitors.reduce((s, v) => s + v.paidVisits, 0)}
          </span>
          <span className="stat__label">Paid clicks</span>
        </Card>
      </div>

      <FilterBar>
        <Field label="Search IP, city or campaign" htmlFor="q" grow>
          <TextInput
            id="q"
            type="search"
            placeholder="41.203.88.7, Leeds, uk-brand-exact…"
            value={query}
            disabled={loading}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Field>
        <Field label="Status" htmlFor="status">
          <Select
            id="status"
            value={status}
            disabled={loading}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'blocked', label: 'Blocked' },
              { value: 'ambiguous', label: 'Judgement call' },
              { value: 'review', label: 'Under review' },
              { value: 'allowed', label: 'Not blocked' },
              { value: 'incomplete', label: 'Incomplete data' },
            ]}
          />
        </Field>
        <Field label="Country" htmlFor="country">
          <Select
            id="country"
            value={country}
            disabled={loading}
            onChange={(e) => setCountry(e.target.value)}
            options={[{ value: 'all', label: 'Everywhere' }, ...countries.map((c) => ({ value: c, label: c }))]}
          />
        </Field>
        <Field label="Last seen" htmlFor="window">
          <Select
            id="window"
            value={window}
            disabled={loading}
            onChange={(e) => setWindow(e.target.value)}
            options={WINDOWS}
          />
        </Field>
        <RangeField id="bot" label="Bot probability" value={minBot} onChange={setMinBot} />
        <Toggle label="Paid clicks only" checked={paidOnly} onChange={setPaidOnly} disabled={loading} />
        {filtersActive && (
          <Button variant="ghost" size="sm" onClick={reset}>
            Reset
          </Button>
        )}
      </FilterBar>

      <div className="toolbar">
        <span className="toolbar__count" aria-live="polite">
          {loading ? 'Loading visitors…' : `${rows.length} of ${visitors.length} visitors`}
        </span>
      </div>

      <DataTable
        caption="Visitors, their status and the reason behind it"
        columns={columns}
        rows={rows}
        rowKey={(v) => v.ip}
        sort={sort}
        loading={loading}
        skeletonRows={10}
        onSortChange={(key) =>
          setSort((s) => ({
            key,
            direction: s.key === key && s.direction === 'desc' ? 'asc' : 'desc',
          }))
        }
        onRowClick={(v) => onOpen(v.ip)}
        isRowFlagged={(v) => v.status === 'blocked'}
        empty={
          visitors.length === 0 ? (
            <EmptyState
              title="No traffic yet"
              body="Once your ads start running, every click that reaches your site will show up here within a few seconds."
            />
          ) : (
            <EmptyState
              title="No visitors match these filters"
              body="Nothing here fits the current combination. Widening the date range or clearing the bot-probability threshold usually helps."
              action={
                <Button variant="ghost" size="sm" onClick={reset}>
                  Reset filters
                </Button>
              }
            />
          )
        }
      />
    </>
  );
}
