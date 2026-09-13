import { describe, expect, it } from 'vitest';
import { VISITORS } from './data/mock';
import { journeySummaryFor } from './journeySummary';

const byIp = (ip: string) => {
  const visitor = VISITORS.find((item) => item.ip === ip || item.aliases?.includes(ip));
  if (!visitor) throw new Error(`fixture ${ip} missing`);
  return visitor;
};

describe('journeySummaryFor', () => {
  it('uses the blocking decision and paid arrival number for a click farm', () => {
    const summary = journeySummaryFor(byIp('41.203.88.7'));
    expect(summary.state).toBe('blocked');
    expect(summary.countLabel).toMatch(/arrivals · shown in chronological order/);
    expect(summary.insight).toMatch(/blocking threshold on paid arrival \d+/);
  });

  it('keeps ambiguous and incomplete evidence honest', () => {
    expect(journeySummaryFor(byIp('82.14.90.221')).state).toBe('ambiguous');
    expect(journeySummaryFor(byIp('178.62.40.9')).state).toBe('incomplete');
  });

  it('does not claim a repeated pattern for a single arrival', () => {
    const visitor = byIp('41.203.88.7');
    const summary = journeySummaryFor({ ...visitor, visits: [visitor.visits[0]], confidence: [visitor.confidence[0]], paidVisits: 1 });
    expect(summary.state).toBe('single');
    expect(summary.countLabel).toBe('1 arrival · shown in chronological order');
  });
});
