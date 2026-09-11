export type Severity = 'high' | 'medium' | 'low' | 'neutral' | 'unknown';

export interface SignalChipProps {
  label: string;
  /** Rendered value. Pass `undefined` with severity="unknown" for missing data. */
  value?: string;
  severity?: Severity;
  /** Plain-language explanation, shown as a native tooltip. */
  hint?: string;
  className?: string;
}

export function SignalChip({
  label,
  value,
  severity = 'neutral',
  hint,
  className = '',
}: SignalChipProps) {
  const cls = `cg-chip cg-chip--${severity} ${className}`.trim();
  const body = (
    <>
      <span className="cg-chip__label">
        <span className="cg-chip__mark" aria-hidden="true" />
        {label}
      </span>
      <span className="cg-chip__value">
        {severity === 'unknown' ? (value ?? 'not captured') : value}
      </span>
    </>
  );

  if (!hint) return <span className={cls}>{body}</span>;
  return (
    <span className={cls} title={hint}>
      {body}
      <span className="cg-visually-hidden" hidden>
        {hint}
      </span>
    </span>
  );
}
