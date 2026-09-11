export type VisitorStatus = 'blocked' | 'allowed' | 'review' | 'ambiguous' | 'incomplete';

const LABELS: Record<VisitorStatus, string> = {
  blocked: 'Blocked',
  allowed: 'Not blocked',
  review: 'Under review',
  ambiguous: 'Judgement call',
  incomplete: 'Incomplete data',
};

export interface StatusPillProps {
  status: VisitorStatus;
  /** Override the default copy — e.g. "Blocked 3 Nov". */
  label?: string;
  className?: string;
}

export function StatusPill({ status, label, className = '' }: StatusPillProps) {
  return (
    <span className={`cg-status cg-status--${status} ${className}`.trim()}>
      {status !== 'blocked' && <span className="cg-status__dot" aria-hidden="true" />}
      {label ?? LABELS[status]}
    </span>
  );
}
