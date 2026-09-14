import type { ReactNode } from 'react';
import { PageReplay, type ReplayBehaviour } from './PageReplay';
import { StatusPill, type VisitorStatus } from './StatusPill';

export interface TelemetryEvidence {
  label: string;
  value: string;
  tone?: 'high' | 'medium' | 'low' | 'neutral';
}

export interface VisitorScanRowProps {
  status: VisitorStatus;
  ip: string;
  location: string;
  summary: string;
  confidence: string;
  paid: string;
  spend: string;
  lastSeen: string;
  source?: string;
  replay?: ReplayBehaviour | null;
  expanded?: boolean;
  onToggle?: () => void;
  onOpen?: () => void;
  children?: ReactNode;
  evidence?: TelemetryEvidence[];
  evidenceLayout?: number;
}

/** A compact, responsive visitor representation shared by app explorations and Storybook. */
export function VisitorScanRow({
  status, ip, location, summary, confidence, paid, spend, lastSeen, source, replay,
  expanded = false, onToggle, onOpen, children, evidence = [], evidenceLayout = 1,
}: VisitorScanRowProps) {
  return (
    <article className={`cg-visitor-row cg-visitor-row--${status}`}>
      <button type="button" className="cg-visitor-row__main cg-focusable" onClick={onOpen} aria-label={`Open ${ip}`}>
        <span className="cg-visitor-row__status"><StatusPill status={status} /></span>
        <span className="cg-visitor-row__identity"><b className="cg-mono">{ip}</b><small>{location}</small></span>
        <span className="cg-visitor-row__summary">{summary}</span>
        <span className="cg-visitor-row__fact"><b>{confidence}</b><small>Bot probability</small></span>
        <span className="cg-visitor-row__fact"><b>{paid}</b><small>Paid clicks</small></span>
        <span className="cg-visitor-row__fact"><b>{spend}</b><small>Spend</small></span>
        <span className="cg-visitor-row__fact"><b>{lastSeen}</b><small>Last seen</small></span>
      </button>
      {onToggle && <button type="button" className="cg-visitor-row__expand cg-focusable" aria-expanded={expanded} onClick={onToggle}>{expanded ? 'Hide evidence' : 'Show evidence'}</button>}
      {expanded && <div className={`cg-visitor-row__detail cg-visitor-row__detail--layout-${evidenceLayout}`}>
        {replay && <PageReplay behaviour={replay} size="hero" />}
        <div className="cg-visitor-row__detail-copy">
          <div className="cg-visitor-row__detail-header">
            <div className="cg-visitor-row__arrival">
              <p className="cg-visitor-row__detail-label">Latest recorded arrival</p>
              {source && <p>{source}</p>}
              {children}
            </div>
            {onOpen && <button type="button" className="cg-visitor-row__open cg-focusable" aria-label={`Open full journey for ${ip}`} onClick={onOpen}>Open full journey</button>}
          </div>
          {evidence.length > 0 && <dl className="cg-visitor-row__telemetry">
            {evidence.map((item) => (
              <div key={item.label} className={item.tone ? `cg-visitor-row__telemetry--${item.tone}` : ''}>
                <dt>{item.label}</dt><dd>{item.value}</dd>
              </div>
            ))}
          </dl>}
        </div>
      </div>}
    </article>
  );
}
