/**
 * The visitor decision hero: an enclosure.
 *
 * DESIGN.md carries status as border weight and style rather than colour fill
 * — 2px ink for blocked, dashed for a judgement call, dotted for incomplete.
 * This hero takes that rule literally and promotes it to the whole hero: the
 * border states the verdict, the replay sits inside the same enclosure rather
 * than beside it, and hairlines divide the argument within it. One reason,
 * once — the arrival strip below carries the per-visit evidence, so nothing
 * here restates it.
 *
 * Every component here is presentational. Formatting money, dates and relative
 * time stays in the app, so the design system never owns a currency or a locale.
 */

import type { ReactNode } from 'react';

export interface DecisionHeroProps {
  status: 'blocked' | 'ambiguous' | 'review' | 'incomplete' | 'allowed';
  headingId: string;
  identity: string;
  /** The status tag, rendered beside the identity. */
  statusPill: ReactNode;
  where: ReactNode;
  /** The control that changes this decision. Secondary to the verdict. */
  action?: ReactNode;
  /** One sentence. Not restated anywhere else in the hero. */
  reason: ReactNode;
  /** `false` renders the unresolved treatment: body grey, 400, italic. */
  settled?: boolean;
  replay: ReactNode;
  replayLabel: string;
  /** DecisiveCell + FinancialCell + JourneyRow, in that order. */
  children: ReactNode;
}

export function DecisionHero({
  status,
  headingId,
  identity,
  statusPill,
  where,
  action,
  reason,
  settled = true,
  replay,
  replayLabel,
  children,
}: DecisionHeroProps) {
  return (
    <section className={`cg-hero cg-hero--${status}`} aria-labelledby={headingId}>
      <figure className="cg-hero__replay" aria-label={replayLabel}>
        {replay}
      </figure>

      <header className="cg-hero__head">
        <div className="cg-hero__id">
          <h1 className="cg-hero__ip" id={headingId}>
            {identity}
          </h1>
          {statusPill}
        </div>
        <p className="cg-hero__where">{where}</p>
        {action && <div className="cg-hero__action">{action}</div>}
      </header>

      <div className="cg-hero__why">
        <p className={`cg-hero__reason${settled ? '' : ' cg-hero__reason--open'}`}>{reason}</p>
      </div>

      {children}
    </section>
  );
}

export interface DecisiveCellProps {
  /** e.g. "Blocked at paid click 3" — the moment, named. */
  label: string;
  iso: string;
  stamp: string;
  /** `decisive` ties the label to the red decisive arrival in the strip below. */
  tone?: 'decisive' | 'neutral';
  clickLabel: string;
  /** `null` when nothing was decisive — renders "none" in muted. */
  click: string | null;
}

export function DecisiveCell({ label, iso, stamp, tone = 'neutral', clickLabel, click }: DecisiveCellProps) {
  return (
    <div className="cg-hero__cell cg-hero__cell--decisive">
      <p className={`cg-mark cg-mark--${tone}`}>
        <span className="cg-label">{label}</span>
        <time className="cg-mark__stamp" dateTime={iso}>
          {stamp}
        </time>
      </p>
      <p className="cg-hero__click">
        <span className="cg-label">{clickLabel}</span>
        <span className={`cg-hero__click-value${click ? '' : ' cg-hero__click-value--none'}`}>{click ?? 'none'}</span>
      </p>
    </div>
  );
}

export interface FinancialCellProps {
  label: string;
  spendLabel: string;
  spend: string;
  revenueLabel: string;
  /** `null` when conversion telemetry never arrived — never render it as zero. */
  revenue: string | null;
  /** Only `favourable` on a verified conversion. */
  revenueTone?: 'favourable' | 'muted';
}

export function FinancialCell({ label, spendLabel, spend, revenueLabel, revenue, revenueTone = 'muted' }: FinancialCellProps) {
  return (
    <dl className="cg-hero__cell cg-hero__money" aria-label={label}>
      <div>
        <dt className="cg-label">{spendLabel}</dt>
        <dd className="cg-money">{spend}</dd>
      </div>
      <div>
        <dt className="cg-label">{revenueLabel}</dt>
        <dd
          className={`cg-money${revenue === null ? ' cg-money--absent' : revenueTone === 'favourable' ? ' cg-money--favourable' : ''}`}
        >
          {revenue ?? 'Not captured'}
        </dd>
      </div>
    </dl>
  );
}

export interface JourneyRowProps {
  label: string;
  /** JourneyItem elements — visits, active period, dates, confidence, exclusion. */
  children: ReactNode;
}

/** Runs the full width of the enclosure, so its items never wrap against a
    narrow column the way they would inside the decisive or money cells. */
export function JourneyRow({ label, children }: JourneyRowProps) {
  return (
    <dl className="cg-hero__cell cg-hero__journey" aria-label={label}>
      {children}
    </dl>
  );
}

export interface JourneyItemProps {
  label: string;
  children: ReactNode;
}

export function JourneyItem({ label, children }: JourneyItemProps) {
  return (
    <div>
      <dt className="cg-label">{label}</dt>
      <dd className="cg-meta">{children}</dd>
    </div>
  );
}

export interface ConfidenceInlineProps {
  label: string;
  /** `null` when the evidence needed to score was never captured. */
  value: number | null;
  /** Accessible name for the meter. */
  meterLabel: string;
  /** e.g. "crossed 80% at visit 3" — where the line was passed. */
  detail?: string;
  id: string;
}

export function ConfidenceInline({ label, value, meterLabel, detail, id }: ConfidenceInlineProps) {
  const clamped = value === null ? null : Math.max(0, Math.min(100, Math.round(value)));
  const tone = clamped === null ? 'low' : clamped >= 75 ? 'high' : clamped >= 45 ? 'medium' : 'low';

  return (
    <div>
      <dt className="cg-label" id={id}>
        {label}
      </dt>
      <dd className="cg-meta">
        {clamped === null ? (
          <span className="cg-conf__absent">Unavailable — telemetry not captured</span>
        ) : (
          <span className="cg-conf">
            <span className="cg-conf__value">{clamped}%</span>
            <span
              className="cg-meter cg-conf__meter"
              role="meter"
              aria-valuenow={clamped}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={meterLabel}
            >
              <span className={`cg-meter__fill cg-meter__fill--${tone}`} style={{ width: `${clamped}%` }} />
            </span>
            {detail && <span className="cg-conf__note">{detail}</span>}
          </span>
        )}
      </dd>
    </div>
  );
}

export interface ExclusionEntry {
  platform: string;
  state: string;
}

export interface ExclusionInlineProps {
  label: string;
  entries: ExclusionEntry[];
}

/** The platform's state, kept conceptually separate from ClickerG's decision. */
export function ExclusionInline({ label, entries }: ExclusionInlineProps) {
  return (
    <div>
      <dt className="cg-label">{label}</dt>
      <dd className="cg-meta">
        {entries.map((e) => (
          <span className="cg-ex" key={e.platform}>
            {e.platform}
            <span className="cg-ex__state">{e.state}</span>
          </span>
        ))}
      </dd>
    </div>
  );
}
