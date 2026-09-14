import { useMemo, useState } from 'react';
import {
  Field, FilterBar, FilterGroup, PageReplay, Select, StatusPill, SteppedRangeField,
  TextInput, Toggle, ViewModeSwitch, VisitorScanRow, type ViewMode,
} from '@clickerg/ui';
import { representativeBehaviour } from './behaviour';
import { matchesFilters } from './filters';
import { money, relative } from './format';
import { NOW } from './data/clock';
import type { Visitor } from './data/types';
import { supplementalEvidence } from './supplementalEvidence';

type LabOption = {
  name: string;
  switchLocation: string;
  listModel: string;
  density: string;
  replay: string;
  benefit: string;
  tradeoff: string;
  rationale: string;
};

const OPTIONS: LabOption[] = [
  { name: 'Conventional results toolbar', switchLocation: 'Results toolbar, right', listModel: 'Stable horizontal rows', density: 'Comfortable', replay: 'Deferred to detail', benefit: 'Fastest to discover', tradeoff: 'Toolbar gains one control', rationale: 'The familiar count-left, actions-right toolbar makes the view preference easy to find. Rows keep identity, reason, confidence, spend and recency aligned; replay stays in the investigation step.' },
  { name: 'Count-side view switch', switchLocation: 'Beside result count', listModel: 'Rows with sort context', density: 'Comfortable', replay: 'Deferred to detail', benefit: 'Count and view read together', tradeoff: 'Less independent toolbar space', rationale: 'Result count and display choice form one compact monitoring cluster while sort remains separate. It favors users who change density as they move from overview to inspection.' },
  { name: 'Filter-integrated switch', switchLocation: 'End of filter row', listModel: 'Structured scan rows', density: 'Comfortable', replay: 'Deferred to detail', benefit: 'Near the monitoring controls', tradeoff: 'Must be clearly labelled as display', rationale: 'The switch appears after a thin control separation, labelled View, so it remains visibly a display preference and never masquerades as a filter.' },
  { name: 'Labelled segmented control', switchLocation: 'Results toolbar, right', listModel: 'Stable horizontal rows', density: 'Comfortable', replay: 'Deferred to detail', benefit: 'Explicit for new users', tradeoff: 'Uses more toolbar width', rationale: 'Visible Grid and List labels remove icon interpretation. The bordered segment keeps the control flat and familiar within the existing field vocabulary.' },
  { name: 'Icon-only view switch', switchLocation: 'Results toolbar, right', listModel: 'Structured scan rows', density: 'Compact', replay: 'Deferred to detail', benefit: 'Lowest visual weight', tradeoff: 'Discovery depends on tooltip', rationale: 'Square buttons match existing icon-only controls. Native titles and accessible names make the compact control understandable without adding permanent visual noise.' },
  { name: 'Density-aware list', switchLocation: 'Results toolbar, right', listModel: 'Comfortable or compact rows', density: 'User-selectable', replay: 'Deferred to detail', benefit: 'Fits manager and analyst work', tradeoff: 'One extra list-only choice', rationale: 'A density choice appears only after List is active, when it has meaning. Comfortable preserves explanatory scanning; Compact promotes rapid comparison.' },
  { name: 'Replay-first list', switchLocation: 'Results toolbar, right', listModel: 'Thumbnail-led rows', density: 'Comfortable', replay: 'Small leading replay', benefit: 'Preserves visual recognition', tradeoff: 'Fewer rows at once', rationale: 'A contained PageReplay thumbnail remains at the leading edge so the list retains the product’s behavioral evidence language before users open a visitor.' },
  { name: 'Evidence-first list', switchLocation: 'Results toolbar, right', listModel: 'Threat evidence columns', density: 'Compact', replay: 'Expandable evidence', benefit: 'Fast threat triage', tradeoff: 'Less visual replay at rest', rationale: 'Status, IP, confidence, summary, paid spend and recency lead the scan. Replay is deferred until a visitor asks for investigation.' },
  { name: 'Expandable list rows', switchLocation: 'Results toolbar, right', listModel: 'One expanded row', density: 'Compact at rest', replay: 'In expanded evidence', benefit: 'Dense default with depth on demand', tradeoff: 'One extra action', rationale: 'Compact rows protect vertical space; an explicit disclosure opens the replay and source context. Only one row stays expanded so scanning remains stable.' },
  { name: 'Hybrid adaptive system', switchLocation: 'Results toolbar, right', listModel: 'Compact responsive summaries', density: 'Adaptive', replay: 'Grid wide, compact list narrow', benefit: 'Respects available space', tradeoff: 'Automatic default needs clear override', rationale: 'Wide windows start in Grid and narrow windows start in List, while the preference remains overrideable. The mobile list is purpose-built, never a squeezed desktop table.' },
];

function peak(v: Visitor) { return Math.max(...v.confidence); }

export function LayoutOptions({ visitors, loading, onOpen }: { visitors: Visitor[]; loading: boolean; onOpen: (ip: string) => void }) {
  const [optionIndex, setOptionIndex] = useState(0);
  const [view, setView] = useState<ViewMode>(() => (sessionStorage.getItem('cg-layout-lab-view') as ViewMode) || 'grid');
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [paidOnly, setPaidOnly] = useState(false);
  const [minBot, setMinBot] = useState(0);
  const option = OPTIONS[optionIndex];
  const iconOnly = optionIndex === 4;
  const countries = useMemo(() => [...new Set(visitors.map((v) => v.country))].sort(), [visitors]);
  const [country, setCountry] = useState('all');
  const rows = useMemo(() => visitors.filter((v) => matchesFilters(v, { query, status, country, window: 'all', paidOnly, minBot }, NOW)), [visitors, query, status, country, paidOnly, minBot]);
  const chooseView = (next: ViewMode) => { setView(next); sessionStorage.setItem('cg-layout-lab-view', next); };

  return <section className={`layout-lab layout-lab--option-${optionIndex + 1} layout-lab--${density}`}>
    <header className="layout-lab__head">
      <div><p className="layout-lab__eyebrow">Development comparison environment</p><h1>Grid and List options</h1><p>Temporary exploration using the same visitor data and monitoring context. The live Threat monitoring page is unchanged.</p></div>
      <a className="layout-lab__back cg-focusable" href="#/">Back to monitoring</a>
    </header>
    <nav className="layout-lab__options" aria-label="Layout options">
      {OPTIONS.map((item, index) => <button key={item.name} type="button" aria-pressed={index === optionIndex} onClick={() => setOptionIndex(index)}><b>{index + 1}</b><span>{item.name}</span></button>)}
    </nav>

    <section className="layout-lab__proposal" aria-labelledby="layout-option-title">
      <div className="layout-lab__proposal-head"><div><p>Option {optionIndex + 1}</p><h2 id="layout-option-title">{option.name}</h2></div><p>{option.rationale}</p></div>
      <div className="layout-lab__comparison"><span><b>Switch</b>{option.switchLocation}</span><span><b>List model</b>{option.listModel}</span><span><b>Density</b>{option.density}</span><span><b>Replay</b>{option.replay}</span><span><b>Main benefit</b>{option.benefit}</span><span><b>Trade-off</b>{option.tradeoff}</span></div>
    </section>

    <div className="layout-lab__filters"><FilterBar>
      <Field label="Search IP, city or campaign" htmlFor="lab-q" grow><TextInput id="lab-q" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search this same visitor dataset" /></Field>
      <FilterGroup label="Filter by category" fill>
        <Field label="Status" htmlFor="lab-status"><Select id="lab-status" value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: 'all', label: 'All statuses' }, { value: 'blocked', label: 'Blocked' }, { value: 'allowed', label: 'Not blocked' }, { value: 'ambiguous', label: 'Judgement call' }, { value: 'review', label: 'Under review' }, { value: 'incomplete', label: 'Incomplete data' }]} /></Field>
        <Field label="Country" htmlFor="lab-country"><Select id="lab-country" value={country} onChange={(e) => setCountry(e.target.value)} options={[{ value: 'all', label: 'Everywhere' }, ...countries.map((c) => ({ value: c, label: c }))]} /></Field>
      </FilterGroup>
      <FilterGroup label="Minimum bot probability"><SteppedRangeField id="lab-bot" label="Minimum bot probability" value={minBot} steps={[0, 25, 50, 75, 100]} onChange={setMinBot} /></FilterGroup>
      <FilterGroup label="Paid traffic only"><Toggle label="Paid clicks only" checked={paidOnly} onChange={setPaidOnly} /></FilterGroup>
      {optionIndex === 2 && <div className="layout-lab__filter-switch"><span>View</span><ViewModeSwitch value={view} onChange={chooseView} iconOnly={iconOnly} /></div>}
    </FilterBar></div>

    <div className={`layout-lab__toolbar ${optionIndex === 1 ? 'layout-lab__toolbar--count-cluster' : ''}`}>
      <span aria-live="polite">{loading ? 'Loading visitors…' : `${rows.length} of ${visitors.length} visitors`}</span>
      {optionIndex === 1 && <ViewModeSwitch value={view} onChange={chooseView} iconOnly={iconOnly} />}
      <div className="layout-lab__toolbar-actions">
        {optionIndex !== 1 && optionIndex !== 2 && <ViewModeSwitch value={view} onChange={chooseView} iconOnly={iconOnly} />}
        {optionIndex === 5 && view === 'list' && <div className="layout-lab__density" role="group" aria-label="List density"><button type="button" aria-pressed={density === 'comfortable'} onClick={() => setDensity('comfortable')}>Comfortable</button><button type="button" aria-pressed={density === 'compact'} onClick={() => setDensity('compact')}>Compact</button></div>}
      </div>
    </div>

    {view === 'grid' ? <div className="layout-lab__grid">{rows.map((v) => <button key={v.ip} className={`layout-lab-card layout-lab-card--${v.status} cg-focusable`} type="button" onClick={() => onOpen(v.ip)}><span><b className="cg-mono">{v.ip}</b><StatusPill status={v.status} /></span><strong>{v.summary}</strong><small>{v.city}, {v.country} · {v.visits.length} visits · {v.paidVisits} paid · {money(v.spendGbp)} · {relative(v.lastSeen)}</small><PageReplay behaviour={representativeBehaviour(v)} /></button>)}</div> : <div className={`layout-lab__list layout-lab__list--${optionIndex === 6 ? 'replay-first' : ''}`}>{rows.map((v) => {
      const isExpanded = expanded === v.ip;
      const latest = v.visits.at(-1);
      const row = <VisitorScanRow key={v.ip} status={v.status} ip={v.ip} location={`${v.city}, ${v.country}`} summary={v.summary} confidence={`${peak(v)}%`} paid={String(v.paidVisits)} spend={money(v.spendGbp)} lastSeen={relative(v.lastSeen)} source={latest?.campaign ?? latest?.referrer} replay={representativeBehaviour(v)} expanded={optionIndex === 8 ? isExpanded : false} onToggle={optionIndex === 8 ? () => setExpanded(isExpanded ? null : v.ip) : undefined} onOpen={() => onOpen(v.ip)} evidence={optionIndex === 8 ? supplementalEvidence(v, visitors) : undefined}>{optionIndex === 8 && latest && <p>{latest.platform ?? latest.channel} · {latest.landingPage ?? 'Landing page not recorded'} · {latest.costGbp == null ? 'No paid click cost' : money(latest.costGbp)}</p>}</VisitorScanRow>;
      return optionIndex === 6 ? <div className="layout-lab__replay-row" key={v.ip}><PageReplay behaviour={representativeBehaviour(v)} size="strip" />{row}</div> : row;
    })}</div>}
    {!loading && rows.length === 0 && <div className="layout-lab__empty">No visitors match this monitoring context.</div>}
  </section>;
}
