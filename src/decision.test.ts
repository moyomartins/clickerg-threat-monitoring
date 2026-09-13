import { describe, expect, it } from 'vitest';
import { BLOCK_THRESHOLD } from './data/scoring';
import { fetchVisitors } from './data/mock';
import type { Visitor } from './data/types';
import {
  confidenceFor,
  crossedAt,
  decisiveMarkFor,
  exclusionPlatforms,
  paidClickNumber,
  reasonFor,
  revenueFor,
} from './decision';

const all = await fetchVisitors(0);
const byIp = (ip: string) => {
  const v = all.find((x) => x.ip === ip || x.aliases?.includes(ip));
  if (!v) throw new Error(`fixture ${ip} missing`);
  return v;
};

/* The three pinned cases the product is designed around. */
const farm = byIp('41.203.88.7'); //      unambiguous click farm
const tie = byIp('82.14.90.221'); //      real conversion, robotic cadence
const gap = byIp('178.62.40.9'); //       our own tag stopped reporting

describe('decision brief , blocked visitor', () => {
  it('is the case it claims to be', () => {
    expect(farm.status).toBe('blocked');
    expect(farm.decisiveIndex).toBeGreaterThanOrEqual(0);
  });

  it('names the paid click the decision landed on, not the journey length', () => {
    const clickNo = paidClickNumber(farm);
    expect(clickNo).toBeGreaterThan(0);
    /* The block happens at the decisive arrival, so the number can never be the
       whole journey , that was the bug the first version of this copy shipped. */
    expect(clickNo).toBeLessThanOrEqual(farm.paidVisits);
    expect(reasonFor(farm)).toContain(`paid click ${clickNo}`);
  });

  it('states the reason once, in behaviour and money, without model vocabulary', () => {
    const reason = reasonFor(farm);
    expect(reason).not.toMatch(/automation model|algorithm|risk engine|\bAI\b|machine learning/i);
    expect(reason).toContain(`${BLOCK_THRESHOLD}%`);
    /* One short paragraph, not a stack of restatements. */
    expect(reason.length).toBeLessThan(220);
  });

  it('stamps the decisive arrival, not the latest visit', () => {
    const mark = decisiveMarkFor(farm);
    expect(mark.tone).toBe('decisive');
    expect(mark.at).toBe(farm.visits[farm.decisiveIndex].at);
    expect(mark.label).toBe(`Blocked at paid click ${paidClickNumber(farm)}`);
  });

  it('reports confidence as a supporting fact, with where the line was crossed', () => {
    const { value, detail } = confidenceFor(farm);
    expect(value).toBe(Math.max(...farm.confidence));
    expect(crossedAt(farm)).not.toBeNull();
    expect(detail).toContain(`crossed ${BLOCK_THRESHOLD}%`);
  });

  it('lists only platforms the journey actually used', () => {
    const platforms = exclusionPlatforms(farm);
    expect(platforms.length).toBeGreaterThan(0);
    const real = new Set(farm.visits.map((v) => v.platform).filter(Boolean));
    platforms.forEach((p) => expect(real.has(p as 'Google Ads' | 'Meta Ads')).toBe(true));
  });
});

describe('decision brief , judgement call', () => {
  it('is the honest tie: real revenue and a suspicious pattern', () => {
    expect(tie.status).toBe('ambiguous');
    expect(tie.revenueGbp).toBeGreaterThan(0);
  });

  it('does not claim a block, and says why the call was held', () => {
    const reason = reasonFor(tie);
    expect(reason).toMatch(/held the call rather than blocking/);
    expect(reason).not.toMatch(/blocked the IP/);
  });

  it('shows verified revenue rather than suppressing it', () => {
    expect(revenueFor(tie)).toBe(`£${tie.revenueGbp.toFixed(2)}`);
  });

  it('never marks the stamp with the decisive red reserved for a block', () => {
    expect(decisiveMarkFor(tie).tone).toBe('neutral');
  });
});

describe('decision brief , incomplete data', () => {
  it('is the case whose telemetry never arrived', () => {
    expect(gap.status).toBe('incomplete');
    expect(gap.visits.every((v) => v.engagement === null)).toBe(true);
  });

  it('reports revenue as unknown rather than as a clean zero', () => {
    expect(gap.revenueGbp).toBe(0);
    expect(revenueFor(gap)).toBeNull();
  });

  it('withholds a confidence number the evidence cannot support', () => {
    expect(confidenceFor(gap).value).toBeNull();
  });

  it('explains the gap in the reason instead of inventing one', () => {
    expect(reasonFor(gap)).toBe(gap.dataGap);
  });
});

describe('decision brief , every visitor', () => {
  it('produces a reason for all of them, with no placeholder text', () => {
    all.forEach((v: Visitor) => {
      const reason = reasonFor(v);
      expect(reason.length).toBeGreaterThan(10);
      expect(reason).not.toMatch(/undefined|NaN|\[object/);
    });
  });

  it('never claims a decisive click for a visitor that was never decided', () => {
    all
      .filter((v) => v.decisiveIndex < 0)
      .forEach((v) => {
        expect(paidClickNumber(v)).toBe(0);
        expect(decisiveMarkFor(v).label).toBe(v.manualHistory?.length ? 'Manual decision' : 'Last assessed');
      });
  });
});
