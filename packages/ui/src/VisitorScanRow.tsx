import type { ReactNode } from 'react';
import { PageReplay, type ReplayBehaviour } from './PageReplay';
import { StatusPill, STATUS_LABELS, type VisitorStatus } from './StatusPill';
import { useMediaQuery } from './useMediaQuery';

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

/* The project draws its own icons inline, the way ViewModeSwitch does, rather
   than carrying an icon package for a handful of glyphs. */
const EyeIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M1 8s2.5-4.5 7-4.5S15 8 15 8s-2.5 4.5-7 4.5S1 8 1 8z" />
    <circle cx="8" cy="8" r="2.25" />
  </svg>
);
const EyeOffIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M1 8s2.5-4.5 7-4.5c1.2 0 2.26.32 3.16.8M15 8s-2.5 4.5-7 4.5c-1.2 0-2.26-.32-3.16-.8" />
    <path d="M6.4 6.4a2.25 2.25 0 003.2 3.2" />
    <path d="M2 14L14 2" />
  </svg>
);

/**
 * The evidence panel is identical in both presentations, so it is written once
 * and shared. Only the collapsed header differs between wide and narrow , a
 * mobile row is not a squeezed desktop row, it carries different fields.
 */
function VisitorEvidence({
  id, layout, replay, source, children, evidence, ip, onOpen,
}: {
  id: string;
  layout: number;
  replay?: ReplayBehaviour | null;
  source?: string;
  children?: ReactNode;
  evidence: TelemetryEvidence[];
  ip: string;
  onOpen?: () => void;
}) {
  return (
    <div id={id} className={`cg-visitor-row__detail cg-visitor-row__detail--layout-${layout}`}>
      {replay && <PageReplay behaviour={replay} size="hero" />}
      <div className="cg-visitor-row__detail-copy">
        <div className="cg-visitor-row__detail-header">
          <div className="cg-visitor-row__arrival">
            <p className="cg-visitor-row__detail-label">Latest recorded arrival</p>
            {source && <p>{source}</p>}
            {children}
          </div>
          {onOpen && (
            <button
              type="button"
              className="cg-visitor-row__open cg-focusable"
              aria-label={`Open full journey for ${ip}`}
              onClick={onOpen}
            >
              Open full journey
            </button>
          )}
        </div>
        {evidence.length > 0 && (
          <dl className="cg-visitor-row__telemetry">
            {evidence.map((item) => (
              <div key={item.label} className={item.tone ? `cg-visitor-row__telemetry--${item.tone}` : ''}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}

/** A compact, responsive visitor representation shared by app explorations and Storybook. */
export function VisitorScanRow({
  status, ip, location, summary, confidence, paid, spend, lastSeen, source, replay,
  expanded = false, onToggle, onOpen, children, evidence = [], evidenceLayout = 1,
}: VisitorScanRowProps) {
  const evidenceId = `visitor-evidence-${ip.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
  /* The breakpoint this component already uses for its own narrow layout. */
  const compact = useMediaQuery('(max-width: 767px)');

  const panel = expanded && (
    <VisitorEvidence
      id={evidenceId}
      layout={evidenceLayout}
      replay={replay}
      source={source}
      evidence={evidence}
      ip={ip}
      onOpen={onOpen}
    >
      {children}
    </VisitorEvidence>
  );

  if (compact) {
    /* One line per visitor: verdict, address, place. Scanning, not reading ,
       everything else is a number the reader would have to stop and interpret,
       and all of it is a tap away in the evidence panel and on the journey
       screen. Keeping it here only makes the list too tall to scan.

       The place truncates before the address does, because the address is what
       the row exists to identify. `aria-label` carries all three regardless of
       what the ellipsis takes, so nothing is lost to a screen reader. */
    return (
      <article className={`cg-visitor-row cg-visitor-row--${status} cg-visitor-row--compact`}>
        <div className="cg-visitor-row__compact">
          <button
            type="button"
            className="cg-visitor-row__compact-main cg-focusable"
            onClick={onOpen}
            aria-label={`Open ${ip}, ${location}, ${STATUS_LABELS[status]}`}
          >
            <span className="cg-visitor-row__compact-status">
              <StatusPill status={status} />
            </span>
            <b className="cg-mono cg-visitor-row__compact-ip">{ip}</b>
            <small className="cg-visitor-row__compact-loc">{location}</small>
          </button>
          {onToggle && (
            <button
              type="button"
              className="cg-visitor-row__eye cg-focusable"
              aria-expanded={expanded}
              aria-controls={evidenceId}
              aria-label={`${expanded ? 'Hide' : 'Show'} evidence for ${ip}`}
              onClick={(event) => {
                // The row itself navigates; revealing evidence must not.
                event.stopPropagation();
                onToggle();
              }}
            >
              {expanded ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          )}
        </div>
        {panel}
      </article>
    );
  }

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
      {onToggle && <button type="button" className="cg-visitor-row__expand cg-focusable" aria-expanded={expanded} aria-controls={evidenceId} onClick={onToggle}>{expanded ? 'Hide evidence' : 'Show evidence'}</button>}
      {panel}
    </article>
  );
}
