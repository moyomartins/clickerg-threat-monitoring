import { BLOCK_THRESHOLD, MIN_PAID_CLICKS_TO_BLOCK, REVIEW_THRESHOLD, reasonsFor, scoreJourney } from './scoring';
import type { Channel, FormFill, Visit, Visitor, VisitorStatus, VpnState } from './types';

/**
 * Deterministic mock traffic.
 *
 * Seeded so the same journeys appear on every reload — a fraud screen that
 * reshuffles itself between refreshes is impossible to review or to demo.
 *
 * The interesting cases are pinned and easy to find:
 *   41.203.88.7   — the obvious one: a click farm, blocked
 *   82.14.90.221  — the honest judgement call: real conversion, robotic cadence
 *   178.62.40.9   — incomplete data: our tag stopped reporting mid-journey
 */

export { NOW } from './clock';
import { NOW } from './clock';
export const MOCK_SEED = 4242;
const DAY = 86_400_000;
const HOUR = 3_600_000;

/* ------------------------------------------------------------------ rng --- */

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T,>(r: () => number, xs: readonly T[]): T => xs[Math.floor(r() * xs.length)];
const between = (r: () => number, lo: number, hi: number) => lo + r() * (hi - lo);
const intBetween = (r: () => number, lo: number, hi: number) => Math.floor(between(r, lo, hi + 1));

/* -------------------------------------------------------------- fixtures --- */

const LOCATIONS = [
  ['Bristol', 'England', 'United Kingdom', 'GB'],
  ['Leeds', 'England', 'United Kingdom', 'GB'],
  ['Manchester', 'England', 'United Kingdom', 'GB'],
  ['Glasgow', 'Scotland', 'United Kingdom', 'GB'],
  ['London', 'England', 'United Kingdom', 'GB'],
  ['Dublin', 'Leinster', 'Ireland', 'IE'],
  ['Austin', 'Texas', 'United States', 'US'],
  ['Chicago', 'Illinois', 'United States', 'US'],
  ['Toronto', 'Ontario', 'Canada', 'CA'],
  ['Amsterdam', 'North Holland', 'Netherlands', 'NL'],
  ['Frankfurt', 'Hesse', 'Germany', 'DE'],
  ['Warsaw', 'Mazovia', 'Poland', 'PL'],
  ['Lagos', 'Lagos', 'Nigeria', 'NG'],
  ['Bengaluru', 'Karnataka', 'India', 'IN'],
  ['Ho Chi Minh City', 'Ho Chi Minh', 'Vietnam', 'VN'],
  ['São Paulo', 'São Paulo', 'Brazil', 'BR'],
  ['Singapore', 'Central', 'Singapore', 'SG'],
  ['Sydney', 'New South Wales', 'Australia', 'AU'],
] as const;

const GOOGLE_CAMPAIGNS = ['uk-brand-exact', 'uk-competitor-terms', 'generic-broad-match', 'retargeting-display'];
const META_CAMPAIGNS = ['meta-lookalike-1pct', 'meta-retarget-7d'];
const KEYWORDS = [
  'clickerg pricing',
  'click fraud protection',
  'ppc fraud tool',
  'stop invalid clicks',
  'ad fraud software',
  'google ads click fraud',
];
const REFERRERS = ['reddit.com/r/PPC', 'producthunt.com', 'g2.com', 'linkedin.com', 'news.ycombinator.com'];

/* --------------------------------------------------------------- builder --- */

interface VisitSeed {
  at: number;
  channel: Channel;
  engagement?: Visit['engagement'];
  botProbability?: number | null;
  vpn?: VpnState;
  formFill?: FormFill;
  converted?: boolean;
  conversionValueGbp?: number;
  clickCadenceSec?: number | null;
  fingerprintReuse?: number;
  sessionSimilarity?: number;
  hourCluster?: boolean;
  utmConsistent?: boolean;
}

function makeVisit(r: () => number, id: string, seed: VisitSeed): Visit {
  const paid = seed.channel === 'paid';
  const platform = paid ? (r() < 0.75 ? 'Google Ads' : 'Meta Ads') : undefined;
  const campaign = paid ? pick(r, platform === 'Meta Ads' ? META_CAMPAIGNS : GOOGLE_CAMPAIGNS) : undefined;
  const engagement = seed.engagement === undefined ? { scrollPct: intBetween(r, 20, 90), dwellSec: intBetween(r, 20, 240), clicks: intBetween(r, 1, 6), mouseMoves: intBetween(r, 40, 600) } : seed.engagement;
  if (engagement && (seed.formFill && seed.formFill !== 'none' || seed.converted)) engagement.clicks = Math.max(2, engagement.clicks);
  if (engagement && seed.clickCadenceSec != null) {
    engagement.clicks = Math.max(2, engagement.clicks);
    engagement.dwellSec = Math.max(engagement.dwellSec, Math.ceil(seed.clickCadenceSec * (engagement.clicks - 1)));
  }
  return {
    id,
    at: seed.at,
    channel: seed.channel,
    platform,
    campaign,
    landingPage: campaign === 'uk-brand-exact' ? '/pricing' : '/click-fraud-protection',
    keyword: paid && platform === 'Google Ads' && campaign !== 'retargeting-display' ? pick(r, KEYWORDS) : undefined,
    referrer: seed.channel === 'referral' ? pick(r, REFERRERS) : seed.channel === 'organic' ? 'google.com' : undefined,
    costGbp: paid ? Number(between(r, 1.8, 9.4).toFixed(2)) : undefined,
    engagement,
    formSubmitted: engagement === null ? null : seed.formFill !== undefined && seed.formFill !== 'none',
    conversionCaptured: engagement !== null,
    botProbability: seed.botProbability === undefined ? Number(between(r, 0.03, 0.25).toFixed(2)) : seed.botProbability,
    vpn: seed.vpn ?? 'none',
    formFill: engagement === null ? 'unknown' : seed.formFill ?? 'none',
    converted: seed.converted ?? false,
    conversionValueGbp: seed.conversionValueGbp,
    clickCadenceSec: engagement === null || seed.clickCadenceSec === undefined ? null : seed.clickCadenceSec,
    fingerprintReuse: seed.fingerprintReuse ?? 1,
    sessionSimilarity: seed.sessionSimilarity ?? Number(between(r, 0.1, 0.55).toFixed(2)),
    hourCluster: seed.hourCluster ?? false,
    utmConsistent: seed.utmConsistent ?? true,
  };
}

const fmtDate = (ms: number) =>
  new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/** Turns a journey into the status, the one-line summary and the full verdict. */
export function assemble(
  ip: string,
  location: (typeof LOCATIONS)[number],
  visits: Visit[],
  dataGap?: string,
): Visitor {
  visits = [...visits].sort((a, b) => a.at - b.at);
  const confidence = scoreJourney(visits);
  const paidVisits = visits.filter((v) => v.channel === 'paid').length;
  const spendGbp = visits.reduce((s, v) => s + (v.channel === 'paid' ? Math.round((v.costGbp ?? 0) * 100) : 0), 0) / 100;
  const revenueGbp = visits.reduce((s, v) => s + (v.converted ? Math.round((v.conversionValueGbp ?? 0) * 100) : 0), 0) / 100;

  let paidSoFar = 0;
  let decisiveIndex = -1;
  let conversionSeen = false;
  visits.forEach((v, i) => {
    if (v.channel === 'paid') paidSoFar += 1;
    conversionSeen ||= v.converted;
    if (!conversionSeen && decisiveIndex === -1 && confidence[i] >= BLOCK_THRESHOLD && paidSoFar >= MIN_PAID_CLICKS_TO_BLOCK) {
      decisiveIndex = i;
    }
  });

  const converted = revenueGbp > 0;
  const peak = Math.max(...confidence);
  /** Money on one side, automation signals on the other — an honest tie. */
  const conflicted = converted && peak >= REVIEW_THRESHOLD;

  let status: VisitorStatus;
  if (conflicted && decisiveIndex === -1) {
    status = 'ambiguous';
    decisiveIndex = -1;
  } else if (decisiveIndex !== -1) {
    status = 'blocked';
  } else if (dataGap) {
    status = 'incomplete';
  } else if (peak >= REVIEW_THRESHOLD) {
    status = 'review';
  } else {
    status = 'allowed';
  }

  const evidence = decisiveIndex >= 0 ? visits.slice(0, decisiveIndex + 1) : visits;
  const topReasons = evidence
    .flatMap((v) => reasonsFor(v).map((x) => ({ ...x, channel: v.channel })))
    .filter((x) => x.delta > 0)
    .sort((a, b) => b.delta - a.delta);
  const uniqueReasons = [...new Map(topReasons.map((x) => [x.signal, x])).values()];
  const money = `£${spendGbp.toFixed(2)}`;

  let summary: string;
  let verdict: string;

  if (status === 'blocked') {
    const at = visits[decisiveIndex];
    summary = `${evidence.filter((v) => v.channel === 'paid').length} paid clicks before the decision, ${uniqueReasons[0]?.text ?? 'pattern consistent with automation'}`;
    verdict =
      `We blocked this visitor on ${fmtDate(at.at)}, at paid click number ${
        visits.slice(0, decisiveIndex + 1).filter((v) => v.channel === 'paid').length
      }. ` +
      `By that decision it ${uniqueReasons.slice(0, 3).map((x) => x.text).join(', ')}. ` +
      `No conversion had been recorded when the decision was made. The complete history totals ${money} of ad spend and £${revenueGbp.toFixed(2)} of recorded revenue. ` +
      `The exclusion list request is pending; platform confirmation has not been recorded.`;
  } else if (status === 'ambiguous') {
    summary = `Converted ${`£${revenueGbp.toFixed(2)}`} but ${uniqueReasons[0]?.text ?? 'shows automated timing'}`;
    verdict =
      `This one is a judgement call and we have not blocked it. ` +
      `The case against: it ${uniqueReasons.slice(0, 2).map((x) => x.text).join(', and it ')}. ` +
      `The case for: it converted, ${`£${revenueGbp.toFixed(2)}`} of real revenue against ${money} of clicks, and it engaged with the pages it landed on. ` +
      `A determined competitor can buy something to look legitimate, and a genuine customer can sit behind a corporate VPN — we cannot tell those apart from the signals alone. ` +
      `We would rather show you the conflict than block a paying customer on our own judgement.`;
  } else if (status === 'incomplete') {
    summary = dataGap ?? 'Partial data for this visitor';
    verdict =
      `We do not have enough to decide. ${dataGap} ` +
      `The visits we did record reached ${peak}% confidence, which is below our blocking line, and we do not fill missing signals in with assumptions. ` +
      `If this IP visits again with the tag reporting normally, scoring will resume from where it left off.`;
  } else if (status === 'review') {
    summary = uniqueReasons[0]?.text ?? 'Mixed signals, watching';
    verdict =
      `Not blocked. Confidence peaked at ${peak}%, against our blocking line of ${BLOCK_THRESHOLD}%. ` +
      `What we noticed: it ${uniqueReasons.slice(0, 2).map((x) => x.text).join(', and it ')}. ` +
      `Blocking requires at least ${MIN_PAID_CLICKS_TO_BLOCK} paid arrivals and ${BLOCK_THRESHOLD}% confidence; we are still observing this journey.`;
  } else {
    summary = converted ? `Converted £${revenueGbp.toFixed(2)}` : '—';
    verdict =
      `Nothing to act on. Confidence peaked at ${peak}%, well under our blocking line. ` +
      `${paidVisits === 0 ? 'None of these visits came from a paid click, so none of them cost you anything.' : `${paidVisits} of ${visits.length} visits came from paid clicks (${money}).`}` +
      `${converted ? ` This visitor converted for £${revenueGbp.toFixed(2)}.` : ''}`;
  }

  if (decisiveIndex >= 0) visits = visits.map((v, i) => i > decisiveIndex && v.channel === 'paid' ? { ...v, postDecisionReason: 'Paid arrival while platform exclusion confirmation was pending.' } : v);
  return {
    ip,
    mockMetadata: true,
    automatedStatus: status,
    exclusionEvents: decisiveIndex < 0 ? [] : [...new Set(visits.filter((v) => v.platform).map((v) => v.platform!))].map((platform) => ({ platform, requestedAt: visits[decisiveIndex].at, scope: 'Mock advertising account' })),
    city: location[0],
    region: location[1],
    country: location[2],
    countryCode: location[3],
    visits,
    confidence,
    status,
    decisiveIndex,
    summary,
    verdict,
    firstSeen: visits[0].at,
    lastSeen: visits[visits.length - 1].at,
    paidVisits,
    spendGbp: Number(spendGbp.toFixed(2)),
    revenueGbp: Number(revenueGbp.toFixed(2)),
    dataGap,
  };
}

/* ------------------------------------------------------------ archetypes --- */

type Archetype = 'clean-organic' | 'normal-prospect' | 'competitor-probe' | 'proxy-burst' | 'click-farm';

function journeyFor(r: () => number, archetype: Archetype, ip: string): Visit[] {
  const v = (i: number, seed: VisitSeed) => makeVisit(r, `${ip}-${i}`, seed);

  switch (archetype) {
    case 'clean-organic': {
      const n = intBetween(r, 1, 5);
      /* One decision, not two independent rolls — `converted` and its value
         must always agree, or a visit can convert for an unrecorded amount. */
      const willConvert = r() < 0.25;
      return Array.from({ length: n }, (_, i) => {
        const last = i === n - 1;
        return v(i, {
          at: NOW - (n - i) * DAY * between(r, 0.6, 4),
          channel: pick(r, ['organic', 'direct', 'referral'] as const),
          formFill: r() < 0.3 ? 'valid' : 'none',
          converted: last && willConvert,
          conversionValueGbp: last && willConvert ? Number(between(r, 90, 480).toFixed(2)) : undefined,
        });
      });
    }
    case 'normal-prospect': {
      const n = intBetween(r, 2, 7);
      const willConvert = r() < 0.35;
      return Array.from({ length: n }, (_, i) => {
        const last = i === n - 1;
        return v(i, {
          at: NOW - (n - i) * DAY * between(r, 0.4, 3),
          channel: i === 0 || r() < 0.5 ? 'paid' : pick(r, ['organic', 'direct'] as const),
          formFill: last && r() < 0.5 ? 'valid' : 'none',
          converted: last && willConvert,
          conversionValueGbp: last && willConvert ? Number(between(r, 120, 640).toFixed(2)) : undefined,
        });
      });
    }
    case 'competitor-probe': {
      const n = intBetween(r, 5, 11);
      return Array.from({ length: n }, (_, i) =>
        v(i, {
          at: NOW - (n - i) * HOUR * between(r, 6, 30),
          channel: 'paid',
          engagement: { scrollPct: intBetween(r, 3, 18), dwellSec: intBetween(r, 5, 34), clicks: 1, mouseMoves: intBetween(r, 0, 40) },
          botProbability: Number(between(r, 0.38, 0.72).toFixed(2)),
          vpn: pick(r, ['consumer-vpn', 'residential-proxy', 'none'] as const),
          clickCadenceSec: r() < 0.7 ? Number(between(r, 2.0, 6).toFixed(1)) : null,
          fingerprintReuse: intBetween(r, 2, 5),
          sessionSimilarity: Number(between(r, 0.7, 0.92).toFixed(2)),
          hourCluster: r() < 0.7,
          utmConsistent: r() > 0.4,
        }),
      );
    }
    case 'proxy-burst': {
      const n = intBetween(r, 6, 14);
      return Array.from({ length: n }, (_, i) =>
        v(i, {
          at: NOW - (n - i) * HOUR * between(r, 1, 5),
          channel: r() < 0.85 ? 'paid' : 'direct',
          engagement: { scrollPct: intBetween(r, 0, 8), dwellSec: intBetween(r, 1, 9), clicks: intBetween(r, 1, 3), mouseMoves: r() < 0.6 ? 0 : intBetween(r, 1, 12) },
          botProbability: Number(between(r, 0.62, 0.9).toFixed(2)),
          vpn: r() < 0.6 ? 'residential-proxy' : 'datacenter',
          formFill: r() < 0.4 ? 'risky' : 'none',
          clickCadenceSec: Number(between(r, 1.2, 3.4).toFixed(1)),
          fingerprintReuse: intBetween(r, 3, 9),
          sessionSimilarity: Number(between(r, 0.8, 0.93).toFixed(2)),
          hourCluster: true,
          utmConsistent: r() > 0.6,
        }),
      );
    }
    case 'click-farm': {
      const n = intBetween(r, 8, 18);
      return Array.from({ length: n }, (_, i) =>
        v(i, {
          at: NOW - (n - i) * HOUR * between(r, 0.4, 2),
          channel: 'paid',
          engagement: { scrollPct: 0, dwellSec: intBetween(r, 1, 4), clicks: intBetween(r, 1, 2), mouseMoves: 0 },
          botProbability: Number(between(r, 0.84, 0.97).toFixed(2)),
          vpn: 'datacenter',
          formFill: r() < 0.6 ? 'invalid' : 'none',
          clickCadenceSec: Number(between(r, 0.3, 1.2).toFixed(1)),
          fingerprintReuse: intBetween(r, 5, 14),
          sessionSimilarity: Number(between(r, 0.9, 0.98).toFixed(2)),
          hourCluster: true,
          utmConsistent: false,
        }),
      );
    }
  }
}

/* ------------------------------------------------------------- the cases --- */

/** The obviously guilty one. Every signal points the same way. */
function clickFarm(): Visitor {
  const r = rng(1001);
  const ip = '41.203.88.7';
  const start = NOW - 2 * DAY;
  const visits: Visit[] = Array.from({ length: 29 }, (_, i) =>
    makeVisit(r, `${ip}-${i}`, {
      at: start + i * HOUR * 1.3 + intBetween(r, 0, 600) * 1000,
      channel: 'paid',
      engagement: { scrollPct: 0, dwellSec: intBetween(r, 1, 3), clicks: 1, mouseMoves: 0 },
      botProbability: Number(Math.min(0.97, 0.62 + i * 0.02).toFixed(2)),
      vpn: 'datacenter',
      formFill: i % 3 === 0 ? 'invalid' : 'none',
      clickCadenceSec: Number(between(r, 0.3, 0.9).toFixed(1)),
      fingerprintReuse: 4 + i,
      sessionSimilarity: Number(Math.min(0.98, 0.86 + i * 0.004).toFixed(2)),
      hourCluster: true,
      utmConsistent: false,
    }),
  );
  return assemble(ip, LOCATIONS[12], visits);
}

/** The honest judgement call: real money, robotic timing. */
function judgementCall(): Visitor {
  const r = rng(2002);
  const ip = '82.14.90.221';
  const visits: Visit[] = [
    makeVisit(r, `${ip}-0`, {
      at: NOW - 9 * DAY + 4 * HOUR,
      channel: 'paid',
      engagement: { scrollPct: 78, dwellSec: 214, clicks: 5, mouseMoves: 412 },
      botProbability: 0.12,
      vpn: 'consumer-vpn',
    }),
    makeVisit(r, `${ip}-1`, {
      at: NOW - 8 * DAY - 2 * HOUR,
      channel: 'organic',
      engagement: { scrollPct: 64, dwellSec: 168, clicks: 3, mouseMoves: 302 },
      botProbability: 0.14,
      vpn: 'consumer-vpn',
    }),
    makeVisit(r, `${ip}-2`, {
      at: NOW - 7 * DAY + 7 * HOUR,
      channel: 'paid',
      engagement: { scrollPct: 71, dwellSec: 190, clicks: 4, mouseMoves: 388 },
      botProbability: 0.31,
      vpn: 'datacenter',
      clickCadenceSec: 3.2,
      sessionSimilarity: 0.89,
      hourCluster: true,
    }),
    makeVisit(r, `${ip}-3`, {
      at: NOW - 6 * DAY + 11 * HOUR,
      channel: 'paid',
      engagement: { scrollPct: 69, dwellSec: 182, clicks: 4, mouseMoves: 361 },
      botProbability: 0.44,
      vpn: 'datacenter',
      formFill: 'valid',
      clickCadenceSec: 3.1,
      fingerprintReuse: 3,
      sessionSimilarity: 0.91,
      hourCluster: true,
      converted: true,
      conversionValueGbp: 249,
    }),
    makeVisit(r, `${ip}-4`, {
      at: NOW - 4 * DAY + 9 * HOUR,
      channel: 'paid',
      engagement: { scrollPct: 66, dwellSec: 176, clicks: 4, mouseMoves: 349 },
      botProbability: 0.58,
      vpn: 'datacenter',
      clickCadenceSec: 3.0,
      fingerprintReuse: 5,
      sessionSimilarity: 0.93,
      hourCluster: true,
      utmConsistent: false,
    }),
    makeVisit(r, `${ip}-5`, {
      at: NOW - 2 * DAY + 6 * HOUR,
      channel: 'paid',
      engagement: { scrollPct: 70, dwellSec: 181, clicks: 4, mouseMoves: 358 },
      botProbability: 0.66,
      vpn: 'datacenter',
      clickCadenceSec: 3.0,
      fingerprintReuse: 7,
      sessionSimilarity: 0.94,
      hourCluster: true,
      utmConsistent: false,
    }),
  ];
  return assemble(ip, LOCATIONS[1], visits);
}

/** The edge case: our own data is missing for part of the journey. */
function incompleteData(): Visitor {
  const r = rng(3003);
  const ip = '178.62.40.9';
  const visits: Visit[] = [
    makeVisit(r, `${ip}-0`, {
      at: NOW - 5 * DAY,
      channel: 'paid',
      engagement: null,
      botProbability: 0.41,
      vpn: 'residential-proxy',
    }),
    makeVisit(r, `${ip}-1`, {
      at: NOW - 5 * DAY + 3 * HOUR,
      channel: 'paid',
      engagement: null,
      botProbability: 0.47,
      vpn: 'residential-proxy',
      clickCadenceSec: 5.2,
    }),
    makeVisit(r, `${ip}-2`, {
      at: NOW - 4 * DAY,
      channel: 'direct',
      engagement: null,
      botProbability: 0.44,
      vpn: 'residential-proxy',
    }),
  ];
  const visitor = assemble(
    ip,
    LOCATIONS[9],
    visits,
    'Our tag stopped reporting partway through this journey, so engagement and form data were never captured.',
  );
  return { ...visitor, city: 'Unknown', region: '', country: 'Unknown', countryCode: '??' };
}

/* ------------------------------------------------------------- generation --- */

function generated(): Visitor[] {
  const r = rng(MOCK_SEED);
  const plan: Archetype[] = [
    ...Array<Archetype>(13).fill('clean-organic'),
    ...Array<Archetype>(14).fill('normal-prospect'),
    ...Array<Archetype>(11).fill('competitor-probe'),
    ...Array<Archetype>(7).fill('proxy-burst'),
    ...Array<Archetype>(5).fill('click-farm'),
  ];

  return plan.map((archetype, i) => {
    const ip = `${intBetween(r, 12, 220)}.${intBetween(r, 0, 255)}.${intBetween(r, 0, 255)}.${intBetween(r, 1, 254)}`;
    const location = LOCATIONS[(i * 7 + Math.floor(r() * 5)) % LOCATIONS.length];
    const visits = journeyFor(r, archetype, ip).sort((a, b) => a.at - b.at);
    return assemble(ip, location, visits);
  });
}

/** Authored scenario templates, with seeded engagement/cost variation. */
function references(): Visitor[] {
  return Array.from({ length: 24 }, (_, index) => {
    const r = rng(8000 + index);
    const scenario = ['repeat-shopper', 'shared-network', 'insufficient-evidence', 'high-engagement-free', 'tracking-stopped', 'conversion-conflict'][index % 6];
    const ip = `203.0.113.${index + 1}`;
    const n = scenario === 'insufficient-evidence' ? 2 : [7, 3, 2, 16, 4, 8, 31, 12][index % 8];
    const age = ([0.03, 2, 12, 38][Math.floor(index / 6)] + between(r, 0, 0.3)) * DAY;
    const span = [0.04, 3, 14, 35][index % 4] * DAY;
    const offsets = Array.from({ length: n }, () => r()).sort((a, b) => a - b);
    const visits = offsets.map((offset, i) => {
      const final = i === n - 1;
      const concerning = scenario === 'insufficient-evidence' || scenario === 'conversion-conflict' && i > 1;
      const missing = scenario === 'tracking-stopped' && i > 0;
      const channel: Channel = scenario === 'high-engagement-free' ? (['organic', 'referral', 'direct'] as const)[i % 3]
        : scenario === 'insufficient-evidence' || scenario === 'conversion-conflict' ? 'paid'
        : i === 0 ? 'paid' : final ? 'direct' : (['referral', 'paid', 'organic'] as const)[i % 3];
      const converted = scenario === 'conversion-conflict' ? i === 1 : final && ['repeat-shopper', 'shared-network'].includes(scenario);
      return makeVisit(r, `${ip}-${i}`, {
        at: NOW - age - span * (1 - (final ? 1 : offset)), channel,
        engagement: missing ? null : concerning ? { scrollPct: intBetween(r, 1, 9), dwellSec: 4, clicks: 3, mouseMoves: 0 }
          : { scrollPct: intBetween(r, 55, 96), dwellSec: intBetween(r, 65, 320), clicks: intBetween(r, 3, 9), mouseMoves: intBetween(r, 50, 640) },
        botProbability: missing || index === 4 ? null : concerning ? 0.9 : [0.12, 0.25, 0.5, 0.75][index % 4],
        vpn: concerning ? 'residential-proxy' : scenario === 'shared-network' ? 'consumer-vpn' : 'none',
        converted, conversionValueGbp: converted ? intBetween(r, 9900, 49900) / 100 : undefined,
        formFill: converted ? 'valid' : 'none',
        clickCadenceSec: concerning ? 0.8 : null,
        fingerprintReuse: concerning ? i + 1 : 1,
        sessionSimilarity: concerning && i > 0 ? 0.94 : 0.25,
        utmConsistent: !concerning,
      });
    });
    return { ...assemble(ip, LOCATIONS[index % LOCATIONS.length], visits, scenario === 'tracking-stopped' ? 'Tracking reported the first arrival, then stopped; later engagement, form and conversion evidence is not captured.' : undefined), scenario };
  });
}

/** Normalize historical fixtures without discarding their journeys or deep links. */
function historical(visitor: Visitor, index: number): Visitor {
  const ip = `192.0.2.${index + 1}`;
  const visits = visitor.visits.map((visit, i) => ({ ...visit, id: `${ip}-${i}`,
    fingerprintReuse: Math.min(i + 1, visit.fingerprintReuse),
    sessionSimilarity: i === 0 ? 0 : visit.sessionSimilarity,
    hourCluster: i > 0 && visitor.visits.slice(0, i).every((prior) => Math.abs(new Date(prior.at).getUTCHours() - new Date(visit.at).getUTCHours()) <= 1),
  }));
  // Preserve the long abuse journey, but model actual confirmation and free returns.
  if (visitor.ip === '41.203.88.7') {
    const initial = assemble(ip, LOCATIONS[12], visits);
    for (let i = initial.decisiveIndex + 2; i < visits.length; i++) {
      Object.assign(visits[i], { channel: 'direct', platform: undefined, campaign: undefined, keyword: undefined, costGbp: undefined, postDecisionReason: undefined });
    }
  }
  const location = [visitor.city, visitor.region, visitor.country, visitor.countryCode] as unknown as (typeof LOCATIONS)[number];
  const result = assemble(ip, location, visits, visitor.dataGap);
  result.aliases = [visitor.ip];
  if (visitor.ip === '41.203.88.7') {
    result.scenario = 'paid-abuse-then-direct';
    const lastPaid = visits.filter((v) => v.channel === 'paid').at(-1)!;
    result.exclusionEvents = result.exclusionEvents?.map((event) => ({ ...event, confirmedAt: lastPaid.at + 60_000 }));
    result.verdict = result.verdict.replace('The exclusion list request is pending; platform confirmation has not been recorded.', 'Both platform exclusion list requests were confirmed after the final paid arrival. Subsequent direct visits remain possible: ad exclusion does not block website access.');
  }
  if (visitor.ip === '82.14.90.221') result.scenario = 'judgement-call';
  if (visitor.ip === '178.62.40.9') result.scenario = 'missing-tracking';
  return result;
}

export function buildVisitors(): Visitor[] {
  const records = [judgementCall(), clickFarm(), incompleteData(), ...generated()].map(historical);
  const authored = references();
  const manual = authored.find((v) => v.scenario === 'shared-network')!;
  manual.manualHistory = [{ at: NOW, status: 'blocked', reason: 'Account owner requested exclusion after an offline abuse report; automated recommendation remains available.' }];
  manual.status = 'blocked';
  manual.summary = 'Manually excluded after an offline abuse report';
  manual.verdict = `The account owner requested exclusion. Automated recommendation: ${manual.automatedStatus}. Platform confirmation is pending.`;
  manual.exclusionEvents = [...new Set(manual.visits.flatMap((v) => v.platform ? [v.platform] : []))].map((platform) => ({ platform, requestedAt: NOW, scope: 'Mock advertising account' }));
  return [...records, ...authored].sort((a, b) => b.lastSeen - a.lastSeen);
}

export const VISITORS = buildVisitors();
export const NOTABLE = {
  obviouslyMalicious: '192.0.2.2', judgementCall: '192.0.2.1', incompleteData: '192.0.2.3',
  repeatShopper: '203.0.113.1', sharedNetwork: '203.0.113.8', insufficientEvidence: '203.0.113.3',
  highEngagementFree: '203.0.113.4', trackingStopped: '203.0.113.5', conversionConflict: '203.0.113.6',
  manualOverride: '203.0.113.2',
};

/**
 * Simulates a network round trip so the loading state is real rather than
 * decorative. `fail` is wired to `?fail=1` in the app so the error state is
 * reachable on demand instead of being a branch nobody ever sees.
 */
export function fetchVisitors(delayMs = 700, fail = false): Promise<Visitor[]> {
  return new Promise((resolve, reject) =>
    setTimeout(() => (fail ? reject(new Error('Could not reach the detection service.')) : resolve(VISITORS)), delayMs),
  );
}
