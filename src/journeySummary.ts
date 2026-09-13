import { paidClickNumber } from './decision';
import type { Visitor } from './data/types';

export interface JourneySummary {
  arrivalCount: number;
  countLabel: string;
  insight: string;
  state: 'empty' | 'single' | 'incomplete' | 'blocked' | 'ambiguous' | 'converted' | 'genuine' | 'review';
}

/** Section-level context, derived from the same journey and decision inputs as the hero. */
export function journeySummaryFor(visitor: Visitor): JourneySummary {
  const arrivalCount = visitor.visits.length;
  const paid = visitor.visits.filter((visit) => visit.channel === 'paid').length;
  const free = arrivalCount - paid;
  const countLabel = `${arrivalCount} ${arrivalCount === 1 ? 'arrival' : 'arrivals'} · shown in chronological order`;

  if (arrivalCount === 0) return { arrivalCount, countLabel, state: 'empty', insight: 'No arrivals have been recorded yet.' };
  if (arrivalCount === 1) return { arrivalCount, countLabel, state: 'single', insight: 'Only one arrival has been recorded, so no repeated pattern is available yet.' };
  if (visitor.status === 'incomplete' || visitor.visits.some((visit) => visit.engagement === null)) {
    return { arrivalCount, countLabel, state: 'incomplete', insight: 'Some arrival evidence is unavailable because tracking stopped during this journey.' };
  }
  if (visitor.manualHistory?.length) return { arrivalCount, countLabel, state: 'review', insight: visitor.summary };
  if (visitor.status === 'blocked') {
    return {
      arrivalCount,
      countLabel,
      state: 'blocked',
      insight: `Confidence crossed the blocking threshold on paid arrival ${paidClickNumber(visitor)} after the pattern repeated.`,
    };
  }
  if (visitor.status === 'ambiguous') {
    return { arrivalCount, countLabel, state: 'ambiguous', insight: 'Automated timing appeared alongside behavior that suggested genuine intent.' };
  }
  if (visitor.revenueGbp > 0) {
    return { arrivalCount, countLabel, state: 'converted', insight: 'This journey includes a recorded conversion alongside its paid and free arrival history.' };
  }
  if (visitor.status === 'allowed') {
    return { arrivalCount, countLabel, state: 'genuine', insight: 'Engagement varied naturally across the visitor’s arrivals.' };
  }
  if (free > 0) {
    return { arrivalCount, countLabel, state: 'review', insight: `This journey contains ${paid} paid arrivals and ${free} free ${free === 1 ? 'arrival' : 'arrivals'}.` };
  }
  return { arrivalCount, countLabel, state: 'review', insight: `Confidence increased across ${paid} paid ${paid === 1 ? 'arrival' : 'arrivals'}.` };
}
