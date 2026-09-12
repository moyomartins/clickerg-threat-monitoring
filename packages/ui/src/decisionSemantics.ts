/**
 * Semantics the decision brief shares with anything else that renders a verdict.
 * Kept out of Decision.tsx so that file exports components only.
 */

import type { VisitorStatus } from './StatusPill';

/** A settled call states itself plainly; an open one keeps the unresolved treatment. */
export const SETTLED_STATUSES: VisitorStatus[] = ['blocked', 'allowed'];

export const isSettled = (status: VisitorStatus) => SETTLED_STATUSES.includes(status);
