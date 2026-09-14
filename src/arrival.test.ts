import { describe, expect, it } from 'vitest';
import { fetchTrafficRecords } from './data/trafficRepository';
import { BLOCK_THRESHOLD } from './data/scoring';
import type { Visit } from './data/types';
import { arrivalExplanationFor, noteFor } from './arrival';

const all = await fetchTrafficRecords(0);
const byIp = (ip: string) => {
  const v = all.find((x) => x.ip === ip || x.aliases?.includes(ip));
  if (!v) throw new Error(`fixture ${ip} missing`);
  return v;
};

const farm = byIp('41.203.88.7'); //  unambiguous click farm , has a decisive visit
const tie = byIp('82.14.90.221'); //  real conversion, robotic cadence
const gap = byIp('178.62.40.9'); //   our own tag stopped reporting

const baseVisit: Visit = {
  id: 'v',
  at: 0,
  channel: 'direct',
  engagement: { scrollPct: 40, dwellSec: 20, clicks: 1, mouseMoves: 50 },
  botProbability: 0.3,
  vpn: 'none',
  formFill: 'none',
  converted: false,
  clickCadenceSec: null,
  fingerprintReuse: 1,
  sessionSimilarity: 0.5,
  hourCluster: false,
  utmConsistent: true,
};

describe('noteFor , the missing-data fix', () => {
  it('never reads as a clean result when the tag never reported and nothing else fired', () => {
    const note = noteFor({ ...baseVisit, engagement: null });
    expect(note).toContain('tag stopped reporting');
    expect(note).not.toContain('Nothing stood out');
  });

  it('still leads with the missing-data sentence even when other signals also fired', () => {
    const note = noteFor({ ...baseVisit, engagement: null, vpn: 'datacenter' });
    expect(note).toContain('tag stopped reporting');
    expect(note).toContain('Against them:');
  });

  it('a genuinely unremarkable visit with full data still reads as "nothing stood out"', () => {
    const note = noteFor({ ...baseVisit, channel: 'paid' });
    expect(note).toBe('Nothing stood out on this visit.');
  });

  it('a non-paid visit still carries the "counts for half" clause', () => {
    const note = noteFor({ ...baseVisit, channel: 'organic', engagement: null });
    expect(note).toMatch(/counts for half/);
  });
});

describe('arrivalExplanationFor , blocked visitor', () => {
  it('titles the decisive arrival distinctly from every other arrival', () => {
    const decisive = arrivalExplanationFor(farm, farm.decisiveIndex);
    expect(decisive.title).toBe('Why this arrival was decisive');
    expect(decisive.decisive).toBe(true);
  });

  it('flags the threshold crossing only on the decisive visit, and only when it actually crossed', () => {
    const decisive = arrivalExplanationFor(farm, farm.decisiveIndex);
    expect(decisive.crossedThreshold).toBe(decisive.confidenceAfter >= BLOCK_THRESHOLD);
    farm.visits.forEach((_, i) => {
      if (i === farm.decisiveIndex) return;
      expect(arrivalExplanationFor(farm, i).crossedThreshold).toBe(false);
    });
  });

  it('the first visit\'s "before" confidence is 0 , nothing has happened yet', () => {
    expect(arrivalExplanationFor(farm, 0).confidenceBefore).toBe(0);
  });

  it('every later visit\'s "before" is the previous visit\'s "after" , no gaps, no invention', () => {
    for (let i = 1; i < farm.visits.length; i++) {
      expect(arrivalExplanationFor(farm, i).confidenceBefore).toBe(farm.confidence[i - 1]);
    }
  });

  it('a paid visit carries a cost and no source; cost is never invented for free visits', () => {
    farm.visits.forEach((v, i) => {
      const e = arrivalExplanationFor(farm, i);
      if (v.channel === 'paid') {
        expect(e.cost).not.toBeNull();
        expect(e.source).toBeNull();
      } else {
        expect(e.cost).toBeNull();
      }
    });
  });
});

describe('arrivalExplanationFor , judgement call', () => {
  it('is never marked decisive , the visitor was never blocked', () => {
    expect(tie.decisiveIndex).toBe(-1);
    tie.visits.forEach((_, i) => {
      const e = arrivalExplanationFor(tie, i);
      expect(e.decisive).toBe(false);
      expect(e.crossedThreshold).toBe(false);
    });
  });

  it('titles each visit by its own effect on confidence, not the visitor-level status', () => {
    tie.visits.forEach((_, i) => {
      const e = arrivalExplanationFor(tie, i);
      expect(['Why confidence increased', 'Why confidence decreased', 'What this arrival showed']).toContain(e.title);
    });
  });
});

describe('arrivalExplanationFor , incomplete data', () => {
  it('every visit is flagged missing, and its body says so', () => {
    gap.visits.forEach((v, i) => {
      expect(v.engagement).toBeNull();
      const e = arrivalExplanationFor(gap, i);
      expect(e.missing).toBe(true);
      expect(e.body).toContain('tag stopped reporting');
    });
  });

  it('titles a missing-data arrival "What product could assess", not a confidence-direction title', () => {
    gap.visits.forEach((_, i) => {
      expect(arrivalExplanationFor(gap, i).title).toBe('What product could assess');
    });
  });
});

describe('arrivalExplanationFor , every visitor', () => {
  it('produces a real body for every single arrival, with no placeholder or undefined text', () => {
    all.forEach((visitor) => {
      visitor.visits.forEach((_, i) => {
        const e = arrivalExplanationFor(visitor, i);
        expect(e.body.length).toBeGreaterThan(5);
        expect(e.body).not.toMatch(/undefined|NaN|\[object/);
      });
    });
  });
});
