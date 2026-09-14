import type { Visitor, VisitorStatus } from './types';
/** A manual decision changes current handling, never the recorded automated decision. */
export function applyManualDecision(visitor: Visitor, status: VisitorStatus, at: number): Visitor {
  const reason = status === 'blocked' ? 'Account owner requested exclusion.' : 'Account owner marked this visitor legitimate.';
  return {
    ...visitor, status, automatedStatus: visitor.automatedStatus ?? visitor.status,
    manualHistory: [...(visitor.manualHistory ?? []), { at, status, reason }],
    summary: status === 'blocked' ? 'Blocked by you' : 'Marked legitimate by you',
    verdict: `${reason} Automated recommendation: ${visitor.automatedStatus ?? visitor.status}. ${status === 'blocked' ? 'Platform confirmation is pending.' : 'Removal from platform exclusion lists is pending.'}`,
    exclusionEvents: status === 'blocked' ? [...new Set(visitor.visits.flatMap(v => v.platform ? [v.platform] : []))].map(platform => ({ platform, requestedAt: at, scope: 'Current advertising account' })) : [],
  };
}
