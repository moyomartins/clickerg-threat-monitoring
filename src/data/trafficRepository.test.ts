import { describe, expect, it } from 'vitest';
import { TRAFFIC_CASES as NOTABLE, TRAFFIC_RECORDS as VISITORS } from './trafficRepository';
import { BLOCK_THRESHOLD, MIN_PAID_CLICKS_TO_BLOCK } from './scoring';
import type { VisitorStatus } from './types';

const byIp = (ip: string) => VISITORS.find((v) => v.ip === ip)!;
const statuses = new Set<VisitorStatus>(VISITORS.map((v) => v.status));

describe('traffic records', () => {
  it('has enough visitors for filtering to be meaningful', () => {
    expect(VISITORS.length).toBeGreaterThanOrEqual(60);
  });

  it('covers every status the UI can render', () => {
    for (const s of ['blocked', 'allowed', 'review', 'ambiguous', 'incomplete'] as const) {
      expect(statuses.has(s), `missing status: ${s}`).toBe(true);
    }
  });

  it('includes both single-visit and long journeys', () => {
    expect(VISITORS.some((v) => v.visits.length === 1)).toBe(true);
    expect(VISITORS.some((v) => v.visits.length >= 10)).toBe(true);
  });

  it('mixes paid and unpaid traffic inside the same journey', () => {
    expect(
      VISITORS.some(
        (v) => v.visits.some((x) => x.channel === 'paid') && v.visits.some((x) => x.channel !== 'paid'),
      ),
    ).toBe(true);
  });
});

describe('blocking model', () => {
  it('blocks the click farm and points at the visit that decided it', () => {
    const farm = byIp(NOTABLE.obviouslyMalicious);
    expect(farm.status).toBe('blocked');
    expect(farm.decisiveIndex).toBeGreaterThanOrEqual(0);
    expect(farm.confidence[farm.decisiveIndex]).toBeGreaterThanOrEqual(BLOCK_THRESHOLD);
    expect(farm.verdict).toContain('exclusion list');
  });

  it('never blocks before the minimum number of paid clicks', () => {
    for (const v of VISITORS.filter((x) => x.status === 'blocked' && !x.manualHistory?.length)) {
      const paidByDecision = v.visits
        .slice(0, v.decisiveIndex + 1)
        .filter((x) => x.channel === 'paid').length;
      expect(paidByDecision).toBeGreaterThanOrEqual(MIN_PAID_CLICKS_TO_BLOCK);
    }
  });

  it('holds the ambiguous visitor instead of blocking a paying customer', () => {
    const call = byIp(NOTABLE.judgementCall);
    expect(call.status).toBe('ambiguous');
    expect(call.decisiveIndex).toBe(-1);
    expect(call.revenueGbp).toBeGreaterThan(0);
    expect(call.verdict).toContain('judgement call');
  });

  it('refuses to score missing data as clean', () => {
    const gap = byIp(NOTABLE.incompleteData);
    expect(gap.status).toBe('incomplete');
    expect(gap.visits.every((v) => v.engagement === null)).toBe(true);
    expect(Math.max(...gap.confidence)).toBeLessThan(BLOCK_THRESHOLD);
  });

  it('keeps confidence inside 0–99 for every journey', () => {
    for (const v of VISITORS) {
      for (const c of v.confidence) {
        expect(c).toBeGreaterThanOrEqual(0);
        expect(c).toBeLessThanOrEqual(99);
      }
    }
  });
});
