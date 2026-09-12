/**
 * The hero's copy and facts, derived once from the same visits the model
 * scores. Everything here comes from `src/decision.ts` and `src/format.ts`;
 * nothing is recomputed or hardcoded.
 */

import {
  confidenceFor,
  crossedAt,
  decisiveMarkFor,
  exclusionPlatforms,
  paidClickNumber,
  reasonFor,
  revenueFor,
} from './decision';
import { BLOCK_THRESHOLD } from './data/scoring';
import type { Visitor } from './data/types';
import { dateUtc, dateUtcShort, iso, money, relative, span, timeUtc } from './format';

export interface HeroFacts {
  status: Visitor['status'];
  settled: boolean;
  reason: string;
  /** Which paid click the call landed on; 0 when nothing was decided. */
  decisiveClick: number;
  decisive: { label: string; tone: 'decisive' | 'neutral'; iso: string; date: string; time: string };
  spend: string;
  /** `null` when conversion telemetry never arrived. */
  revenue: string | null;
  converted: boolean;
  visits: number;
  paid: number;
  free: number;
  active: string;
  firstSeen: { iso: string; date: string; short: string; time: string };
  lastSeen: { iso: string; date: string; short: string; time: string; relative: string };
  /** `null` when the evidence a score depends on was never captured. */
  peak: number | null;
  /** Confidence at the visit where the blocking line was crossed. */
  crossed: { visit: number; value: number } | null;
  threshold: number;
  platforms: { platform: string; state: string }[];
}

export function heroFacts(visitor: Visitor): HeroFacts {
  const mark = decisiveMarkFor(visitor);
  const confidence = confidenceFor(visitor);
  const crossedVisit = crossedAt(visitor);

  return {
    status: visitor.status,
    settled: visitor.status === 'blocked' || visitor.status === 'allowed',
    reason: reasonFor(visitor),
    decisiveClick: paidClickNumber(visitor),
    decisive: {
      label: mark.label,
      tone: mark.tone,
      iso: iso(mark.at),
      date: dateUtc(mark.at),
      time: timeUtc(mark.at),
    },
    spend: money(visitor.spendGbp),
    revenue: revenueFor(visitor),
    converted: visitor.revenueGbp > 0,
    visits: visitor.visits.length,
    paid: visitor.paidVisits,
    free: visitor.visits.length - visitor.paidVisits,
    active: span(visitor.firstSeen, visitor.lastSeen),
    firstSeen: {
      iso: iso(visitor.firstSeen),
      date: dateUtc(visitor.firstSeen),
      short: dateUtcShort(visitor.firstSeen),
      time: timeUtc(visitor.firstSeen),
    },
    lastSeen: {
      iso: iso(visitor.lastSeen),
      date: dateUtc(visitor.lastSeen),
      short: dateUtcShort(visitor.lastSeen),
      time: timeUtc(visitor.lastSeen),
      relative: relative(visitor.lastSeen),
    },
    peak: confidence.value,
    crossed:
      crossedVisit === null || confidence.value === null
        ? null
        : { visit: crossedVisit, value: Math.round(visitor.confidence[crossedVisit - 1]) },
    threshold: BLOCK_THRESHOLD,
    /* Real platforms from the journey; the sync state itself is not simulated. */
    platforms: exclusionPlatforms(visitor).map((platform) => ({ platform, state: 'not simulated' })),
  };
}
