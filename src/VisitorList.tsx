import { useMemo, useState } from 'react';
import {
  Button,
  EmptyState,
  Field,
  FilterBar,
  FilterGroup,
  PageReplay,
  RangeField,
  Select,
  Skeleton,
  StatusPill,
  TextInput,
  Toggle,
  type SortState,
  type VisitorStatus,
} from '@clickerg/ui';
import { representativeBehaviour } from './behaviour';
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

/* A settled call states itself plainly; an open one must not borrow that authority,
   so its reason keeps the lighter, italic treatment the system uses for unresolved values.
   A visitor with nothing notable to say carries an em-dash, which is a placeholder rather
   than a finding and is kept quiet so it cannot read as the card's headline. */
const SETTLED = new Set<VisitorStatus>(['blocked', 'allowed']);

const whyTone = (v: Visitor) => {
  if (v.summary.trim() === '—') return ' replay-card__why--none';
  return SETTLED.has(v.status) ? '' : ' replay-card__why--open';
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
        <div className="stats__lead">
          <span className="stat__value stat__value--lead">
            {loading ? <Skeleton width="110px" height="34px" /> : money(wasted)}
          </span>
          <span className="stat__label">Spend behind blocked IPs</span>
        </div>
        <div className="stats__support">
          <span className="stat__value stat__value--support">
            {loading ? <Skeleton width="40px" height="22px" /> : blocked.length}
          </span>
          <span className="stat__label">Blocked</span>
        </div>
        <div className="stats__context">
          <div>
            <span className="stat__value stat__value--context">
              {loading ? <Skeleton width="40px" height="17px" /> : visitors.length}
            </span>
            <span className="stat__label">Visitors seen</span>
          </div>
          <div>
            <span className="stat__value stat__value--context">
              {loading ? <Skeleton width="40px" height="17px" /> : visitors.reduce((s, v) => s + v.paidVisits, 0)}
            </span>
            <span className="stat__label">Paid clicks</span>
          </div>
        </div>
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
        <FilterGroup label="Filter by category">
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
          <Field label="Sort by" htmlFor="sort">
            <div className="cg-sortfield">
              <Select
                id="sort"
                value={sort.key}
                disabled={loading}
                onChange={(e) => setSort((x) => ({ ...x, key: e.target.value }))}
                options={[
                  { value: 'lastSeen', label: 'Last seen' },
                  { value: 'status', label: 'Status' },
                  { value: 'confidence', label: 'Confidence' },
                  { value: 'spend', label: 'Spend' },
                  { value: 'visits', label: 'Visit count' },
                  { value: 'ip', label: 'IP address' },
                  { value: 'location', label: 'Location' },
                ]}
              />
              <Button
                variant="ghost"
                size="sm"
                disabled={loading}
                aria-label={`Sort ${sort.direction === 'desc' ? 'descending' : 'ascending'}, change direction`}
                onClick={() => setSort((x) => ({ ...x, direction: x.direction === 'desc' ? 'asc' : 'desc' }))}
              >
                {sort.direction === 'desc' ? '↓ Desc' : '↑ Asc'}
              </Button>
            </div>
          </Field>
        </FilterGroup>
        <FilterGroup label="Bot probability threshold">
          <RangeField id="bot" label="Bot probability" value={minBot} onChange={setMinBot} />
        </FilterGroup>
        <FilterGroup label="Paid traffic only">
          <Toggle label="Paid clicks only" checked={paidOnly} onChange={setPaidOnly} disabled={loading} />
        </FilterGroup>
        {filtersActive && (
          <Button variant="ghost" size="sm" className="filterbar__reset" onClick={reset}>
            Reset
          </Button>
        )}
      </FilterBar>

      <div className="toolbar">
        <span className="toolbar__count" aria-live="polite">
          {loading ? 'Loading visitors…' : `${rows.length} of ${visitors.length} visitors`}
        </span>
      </div>

      {loading ? (
        <div className="replays">
          {Array.from({ length: 12 }, (_, i) => (
            <article className="replay-card" key={`skeleton-${i}`} aria-hidden="true">
              <div className="replay-card__verdict">
                <Skeleton width="11ch" height="17px" />
                <Skeleton width="62px" height="14px" />
              </div>
              <div className="replay-card__why">
                <Skeleton width="92%" height="13px" />
              </div>
              <div className="replay-card__facts">
                <Skeleton width="78%" height="11px" />
              </div>
              <div className="replay-card__evidence">
                <PageReplay behaviour={null} loading />
              </div>
            </article>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="replay-empty">
          <PageReplay behaviour={null} caption={false} />
          {visitors.length === 0 ? (
            <EmptyState
              title="No traffic yet"
              body="Once your ads start running, every click that reaches your site will show up here as a replay within a few seconds."
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
          )}
        </div>
      ) : (
        <div className="replays">
          {rows.map((v) => (
            <article
              key={v.ip}
              className={`replay-card replay-card--${v.status}`}
              tabIndex={0}
              role="button"
              aria-label={`${v.ip}, ${v.city}. ${v.summary}`}
              onClick={() => onOpen(v.ip)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpen(v.ip);
                }
              }}
            >
              <p className="replay-card__verdict">
                <span className="replay-card__ip">{v.ip}</span>
                <StatusPill status={v.status} />
              </p>
              <p className={`replay-card__why${whyTone(v)}`}>{v.summary}</p>
              <p className="replay-card__facts">
                {v.city}, {v.country} · {v.visits.length} visits · {v.paidVisits} paid ·{' '}
                {money(v.spendGbp)} · {relative(v.lastSeen)}
              </p>
              <div className="replay-card__evidence">
                <PageReplay behaviour={representativeBehaviour(v)} />
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
