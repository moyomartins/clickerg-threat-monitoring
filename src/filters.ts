import type { Visitor } from './data/types';
export interface TrafficFilters { query: string; status: string; country: string; window: string; paidOnly: boolean; minBot: number }
/** Paid-only selects visitors with any paid arrival; their full journey is retained. */
export function matchesFilters(v: Visitor, f: TrafficFilters, now: number): boolean {
  if (f.status !== 'all' && v.status !== f.status || f.country !== 'all' && v.country !== f.country) return false;
  if (f.window !== 'all' && v.lastSeen < now - Number(f.window) * 86_400_000) return false;
  if (f.paidOnly && v.paidVisits === 0) return false;
  const known = v.visits.flatMap((x) => x.botProbability === null ? [] : [x.botProbability]);
  if (f.minBot > 0 && (!known.length || Math.max(...known) * 100 < f.minBot)) return false;
  const haystack = [v.ip, ...(v.aliases ?? []), v.city, v.region, v.country, v.summary,
    ...v.visits.map((x) => `${x.campaign ?? ''} ${x.keyword ?? ''} ${x.referrer ?? ''}`)].join(' ').toLowerCase();
  return haystack.includes(f.query.trim().toLowerCase());
}
