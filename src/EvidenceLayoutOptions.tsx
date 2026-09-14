import { useMemo, useState } from 'react';
import { VisitorScanRow } from '@clickerg/ui';
import { representativeBehaviour } from './behaviour';
import { money, relative } from './format';
import type { Visitor } from './data/types';
import { supplementalEvidence } from './supplementalEvidence';

const OPTIONS = [
  ['Balanced diagnostic grid', 'Replay left, grouped two-column evidence right.'],
  ['Signal stack', 'A single reading column for deliberate review.'],
  ['Three-column scan', 'Compact field scan for wide desktop screens.'],
  ['Replay-led facts', 'Replay and source lead, supporting signals follow.'],
  ['Label rail', 'Aligned label rail makes values easy to compare.'],
  ['Severity-first', 'High-risk observations occupy the leading positions.'],
  ['Grouped categories', 'Network, traffic, and delivery form clear clusters.'],
  ['Compact audit strip', 'A dense two-row diagnostic summary.'],
  ['Narrative evidence', 'Signals follow the latest-arrival context in reading order.'],
  ['Action-led summary', 'Exclusion delivery and highest-risk evidence sit near the action.'],
] as const;

export function EvidenceLayoutOptions({ visitors, onOpen }: { visitors: Visitor[]; onOpen: (ip: string) => void }) {
  const [option, setOption] = useState(0);
  const visitor = useMemo(() => visitors.find((item) => item.status === 'blocked') ?? visitors[0], [visitors]);
  if (!visitor) return null;
  const latest = visitor.visits.at(-1);
  return <section className={`evidence-lab evidence-lab--${option + 1}`}>
    <header className="evidence-lab__head"><div><p>Development comparison environment</p><h1>Evidence panel layouts</h1><span>Choose a composition for Option 9, expandable list rows.</span></div><a href="#/">Back to monitoring</a></header>
    <nav className="evidence-lab__options" aria-label="Evidence layout options">
      {OPTIONS.map(([name], index) => <button type="button" key={name} aria-pressed={option === index} onClick={() => setOption(index)}><b>{index + 1}</b>{name}</button>)}
    </nav>
    <section className="evidence-lab__note"><b>Option {option + 1}: {OPTIONS[option][0]}</b><span>{OPTIONS[option][1]}</span></section>
    <VisitorScanRow
      status={visitor.status} ip={visitor.ip} location={`${visitor.city}, ${visitor.country}`} summary={visitor.summary}
      confidence={`${Math.max(...visitor.confidence)}%`} paid={String(visitor.paidVisits)} spend={money(visitor.spendGbp)} lastSeen={relative(visitor.lastSeen)}
      source={latest?.campaign ?? latest?.referrer} replay={representativeBehaviour(visitor)} evidence={supplementalEvidence(visitor, visitors)} evidenceLayout={option + 1} expanded onOpen={() => onOpen(visitor.ip)}
    >{latest && <p>{latest.platform ?? latest.channel} · {latest.landingPage ?? 'Landing page not recorded'} · {latest.costGbp == null ? 'No paid click cost' : money(latest.costGbp)}</p>}</VisitorScanRow>
  </section>;
}
