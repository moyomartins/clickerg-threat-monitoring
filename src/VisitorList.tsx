import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  EmptyState,
  Field,
  FilterBar,
  FilterGroup,
  PageReplay,
  SteppedRangeField,
  Select,
  Skeleton,
  SortDirectionIcon,
  StatusPill,
  TextInput,
  Toggle,
  ViewModeSwitch,
  VisitorScanRow,
  type SortState,
  type VisitorStatus,
  type ViewMode,
} from '@clickerg/ui';
import { representativeBehaviour } from './behaviour';
import type { Visitor } from './data/types';
import { NOW } from './data/clock';
import { matchesFilters } from './filters';
import { money, relative } from './format';
import { supplementalEvidence } from './supplementalEvidence';

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
  if (v.summary.trim() === ',') return ' replay-card__why--none';
  return SETTLED.has(v.status) ? '' : ' replay-card__why--open';
};

const WINDOWS = [
  { value: 'all', label: 'All time' },
  { value: '1', label: 'Last 24 hours' },
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
];

const CONTEXT_KEY = 'cg-monitoring-context';
interface MonitoringContext {
  query: string;
  status: string;
  country: string;
  window: string;
  paidOnly: boolean;
  minBot: number;
  sort: SortState;
  view: ViewMode;
  expanded: string | null;
}
const DEFAULT_CONTEXT: MonitoringContext = {
  query: '', status: 'all', country: 'all', window: 'all', paidOnly: false, minBot: 0,
  sort: { key: 'lastSeen', direction: 'desc' }, view: 'grid', expanded: null,
};
function readMonitoringContext(): MonitoringContext {
  try {
    const stored = sessionStorage.getItem(CONTEXT_KEY);
    return stored ? { ...DEFAULT_CONTEXT, ...JSON.parse(stored) } : DEFAULT_CONTEXT;
  } catch {
    return DEFAULT_CONTEXT;
  }
}


interface Props {
  visitors: Visitor[];
  loading: boolean;
  onOpen: (ip: string) => void;
}

export function VisitorList({ visitors, loading, onOpen }: Props) {
  const [initialContext] = useState(readMonitoringContext);
  const [query, setQuery] = useState(initialContext.query);
  const [status, setStatus] = useState(initialContext.status);
  const [country, setCountry] = useState(initialContext.country);
  const [window, setWindow] = useState(initialContext.window);
  const [paidOnly, setPaidOnly] = useState(initialContext.paidOnly);
  const [minBot, setMinBot] = useState(initialContext.minBot);
  const [sort, setSort] = useState<SortState>(initialContext.sort);
  const [view, setView] = useState<ViewMode>(initialContext.view);
  const [expanded, setExpanded] = useState<string | null>(initialContext.expanded);

  useEffect(() => {
    sessionStorage.setItem(CONTEXT_KEY, JSON.stringify({ query, status, country, window, paidOnly, minBot, sort, view, expanded }));
  }, [query, status, country, window, paidOnly, minBot, sort, view, expanded]);

  const countries = useMemo(
    () => [...new Set(visitors.map((v) => v.country))].sort(),
    [visitors],
  );

  const filtered = useMemo(() => {
    return visitors.filter((v) => matchesFilters(v, { query, status, country, window, paidOnly, minBot }, NOW));
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

  const setViewMode = (next: ViewMode) => {
    setView(next);
    setExpanded(null);
  };

  /* Monitoring summary metrics describe the current account snapshot, not the filtered subset. */
  const blocked = visitors.filter((v) => v.status === 'blocked');
  const wasted = blocked.reduce((s, v) => s + v.spendGbp, 0);

  return (
    <>
      <h1 className="page__title">Threat monitoring</h1>
      <p className="page__lede">
        Every visitor recorded on your site, across paid and free arrivals, and what we decided about them. Blocking is
        cumulative , open any visitor to see the whole journey and the point where we made the call.
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
        <FilterGroup label="Filter by category" fill>
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
                iconOnly
                disabled={loading}
                aria-label={`Sort ${sort.direction === 'desc' ? 'descending' : 'ascending'}, change direction`}
                tooltip={`Sort ${sort.direction === 'desc' ? 'descending' : 'ascending'}`}
                onClick={() => setSort((x) => ({ ...x, direction: x.direction === 'desc' ? 'asc' : 'desc' }))}
              >
                <SortDirectionIcon direction={sort.direction} />
              </Button>
            </div>
          </Field>
        </FilterGroup>
        <FilterGroup label="Minimum bot probability">
          <SteppedRangeField id="bot" label="Minimum bot probability" value={minBot} steps={[0, 25, 50, 75, 100]} disabled={loading} onChange={setMinBot} />
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
        <ViewModeSwitch value={view} onChange={setViewMode} />
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
      ) : view === 'list' ? (
        <div className="visitor-list-view">
          {rows.map((v) => {
            const latest = v.visits.at(-1);
            const isExpanded = expanded === v.ip;
            return (
              <VisitorScanRow
                key={v.ip}
                status={v.status}
                ip={v.ip}
                location={`${v.city}, ${v.country}`}
                summary={v.summary}
                confidence={`${Math.max(...v.confidence)}%`}
                paid={String(v.paidVisits)}
                spend={money(v.spendGbp)}
                lastSeen={relative(v.lastSeen)}
                source={latest?.campaign ?? latest?.referrer}
                replay={representativeBehaviour(v)}
                evidence={supplementalEvidence(v, visitors)}
                evidenceLayout={7}
                expanded={isExpanded}
                onToggle={() => setExpanded(isExpanded ? null : v.ip)}
                onOpen={() => onOpen(v.ip)}
              >
                {latest && <p>{latest.platform ?? latest.channel} · {latest.landingPage ?? 'Landing page not recorded'} · {latest.costGbp == null ? 'No paid click cost' : money(latest.costGbp)}</p>}
              </VisitorScanRow>
            );
          })}
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
