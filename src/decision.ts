/**
 * The hero's copy, derived from the same visits the model scores.
 *
 * The hero states the conclusion once. It does not restate it as a verdict, a
 * reason, a heading, an event sentence and three bullet points , the arrival
 * cards below carry the per-visit evidence, so repeating it here only pushes
 * the journey off the screen.
 *
 * Pure functions, so the wording is covered by tests rather than by eyeballing.
 */

import { BLOCK_THRESHOLD } from './data/scoring';
import type { Visitor } from './data/types';
import { money } from './format';

const paidVisits = (v: Visitor) => v.visits.filter((x) => x.channel === 'paid');

/** Which paid click the decision landed on , "blocked at paid click 3". */
export function paidClickNumber(visitor: Visitor) {
  if (visitor.decisiveIndex < 0) return 0;
  return visitor.visits.slice(0, visitor.decisiveIndex + 1).filter((x) => x.channel === 'paid').length;
}

/** Paid arrivals that recorded no meaningful engagement at all. */
export function silentPaidCount(visitor: Visitor) {
  return paidVisits(visitor).filter(
    (x) =>
      x.engagement !== null &&
      (x.engagement.mouseMoves === 0 || (x.engagement.dwellSec < 6 && x.engagement.scrollPct < 12)),
  ).length;
}

export function fastestCadence(visitor: Visitor) {
  const cadences = paidVisits(visitor)
    .map((x) => x.clickCadenceSec)
    .filter((x): x is number => x !== null);
  return cadences.length ? Math.min(...cadences) : null;
}

/** The visit where confidence first crossed the blocking line, 1-based. */
export function crossedAt(visitor: Visitor) {
  const i = visitor.confidence.findIndex((c) => c >= BLOCK_THRESHOLD);
  return i < 0 ? null : i + 1;
}

/**
 * Conversion telemetry that never arrived is not the same as no revenue, so it
 * is reported as unknown rather than as a clean zero.
 */
export function revenueFor(visitor: Visitor): string | null {
  const captured = visitor.visits.some((x) => x.engagement !== null) || visitor.revenueGbp > 0;
  return captured ? money(visitor.revenueGbp) : null;
}

/** One short paragraph: the observable pattern, then the moment it was acted on. */
export function reasonFor(visitor: Visitor): string {
  if (visitor.manualHistory?.length) return visitor.verdict;
  if (visitor.decisiveIndex >= 0) visitor = { ...visitor, visits: visitor.visits.slice(0, visitor.decisiveIndex + 1) };
  const paidCount = paidVisits(visitor).length;
  const silent = silentPaidCount(visitor);
  const cadence = fastestCadence(visitor);
  const clickNo = paidClickNumber(visitor);

  const pattern =
    silent === paidCount && paidCount > 0
      ? 'the same limited-engagement pattern'
      : cadence !== null && cadence < 1.5
        ? 'clicks arriving faster than the page renders'
        : 'the same repeating pattern';

  switch (visitor.status) {
    case 'blocked':
      return `${paidCount} paid ${paidCount === 1 ? 'click' : 'clicks'} repeated ${pattern}. ClickGuard blocked the IP at paid click ${clickNo}, once confidence crossed ${BLOCK_THRESHOLD}%.`;
    case 'ambiguous':
      return `${paidCount} paid ${paidCount === 1 ? 'click' : 'clicks'} show machine-like timing, but the visitor converted ${money(visitor.revenueGbp)} , so ClickGuard held the call rather than blocking it.`;
    case 'review':
      return `Some arrivals look automated. Confidence has reached ${Math.round(Math.max(...visitor.confidence))}% across ${paidCount} paid ${paidCount === 1 ? 'click' : 'clicks'} against the ${BLOCK_THRESHOLD}% blocking line; at least three paid arrivals are also required.`;
    case 'incomplete':
      return visitor.dataGap ?? 'Part of this visitor’s journey never reported, so the assessment is incomplete.';
    default:
      return `Across ${visitor.visits.length} ${visitor.visits.length === 1 ? 'visit' : 'visits'}, the evidence did not warrant automatic blocking.`;
  }
}

/** The moment product acted, taken from the decisive arrival. */
export function decisiveMarkFor(visitor: Visitor) {
  const manual = visitor.manualHistory?.at(-1);
  if (manual) return { at: manual.at, label: 'Manual decision', tone: 'neutral' as const };
  const decisive = visitor.decisiveIndex >= 0 ? visitor.visits[visitor.decisiveIndex] : undefined;
  const clickNo = paidClickNumber(visitor);

  if (visitor.status === 'blocked' && decisive) {
    return { at: decisive.at, label: `Blocked at paid click ${clickNo}`, tone: 'decisive' as const };
  }
  if (visitor.status === 'ambiguous' && decisive) {
    return { at: decisive.at, label: `Held at paid click ${clickNo}`, tone: 'neutral' as const };
  }
  return { at: visitor.lastSeen, label: 'Last assessed', tone: 'neutral' as const };
}

/** Confidence is a supporting fact here; the strip carries the progression. */
export function confidenceFor(visitor: Visitor): { value: number | null; detail: string } {
  const peak = Math.max(...visitor.confidence);

  /* A clean number would imply evidence that was never captured. */
  if (visitor.status === 'incomplete') return { value: null, detail: '' };

  const crossed = crossedAt(visitor);
  if (visitor.status === 'blocked' && crossed) {
    return { value: peak, detail: `peak · crossed ${BLOCK_THRESHOLD}% at visit ${crossed}` };
  }
  return { value: peak, detail: `peak across ${visitor.visits.length} visits` };
}

/** Real platforms from the journey; the sync state itself is not simulated. */
export function exclusionPlatforms(visitor: Visitor): string[] {
  return [...new Set(paidVisits(visitor).map((x) => x.platform).filter(Boolean))] as string[];
}
