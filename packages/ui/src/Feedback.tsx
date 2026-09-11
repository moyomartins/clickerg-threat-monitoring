import type { ReactNode } from 'react';

export interface EmptyStateProps {
  title: string;
  body?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, body, action }: EmptyStateProps) {
  return (
    <div className="cg-empty">
      <p className="cg-empty__title">{title}</p>
      {body && <p className="cg-empty__body">{body}</p>}
      {action}
    </div>
  );
}

export interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

export function Skeleton({ width = '100%', height = '12px', className = '' }: SkeletonProps) {
  return <div className={`cg-skel ${className}`.trim()} style={{ width, height }} aria-hidden="true" />;
}

export interface ConfidenceMeterProps {
  /** 0–100. */
  value: number;
  label?: string;
}

export function ConfidenceMeter({ value, label = 'Confidence this visitor is fraudulent' }: ConfidenceMeterProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const tone = clamped >= 75 ? 'high' : clamped >= 45 ? 'medium' : 'low';
  return (
    <div className="cg-visit__confidence">
      <span>{label}</span>
      <span
        className="cg-meter"
        role="meter"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <span className={`cg-meter__fill cg-meter__fill--${tone}`} style={{ width: `${clamped}%` }} />
      </span>
      <strong className="cg-mono">{clamped}%</strong>
    </div>
  );
}
