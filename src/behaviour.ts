import type { ReplayBehaviour } from '@clickerg/ui';
import type { Visit, Visitor } from './data/types';

export const behaviourOf = (visit: Visit): ReplayBehaviour | null =>
  visit.engagement === null
    ? null
    : {
        scrollPct: visit.engagement.scrollPct,
        dwellSec: visit.engagement.dwellSec,
        clicks: visit.engagement.clicks,
        mouseMoves: visit.engagement.mouseMoves,
      };

/**
 * What a visitor's card replays: their most recent arrival that actually
 * reported. If nothing ever reported, the card says so rather than drawing a
 * clean page , missing data is a state, not a pass.
 */
export function representativeBehaviour(v: Visitor): ReplayBehaviour | null {
  for (let i = v.visits.length - 1; i >= 0; i -= 1) {
    const b = behaviourOf(v.visits[i]);
    if (b) return b;
  }
  return null;
}
