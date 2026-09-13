import type { Visit } from './types';

/**
 * The scoring model.
 *
 * Every number an advertiser sees in the UI comes out of this file, and so
 * does every sentence explaining it , the explanation is generated from the
 * same rules that move the score, so the two can never drift apart.
 *
 * Blocking is cumulative: a visit contributes a delta, the deltas accumulate
 * across the whole journey, and the block happens when the running total
 * crosses BLOCK_THRESHOLD. Non-paid visits still inform the picture but are
 * weighted down , they cost the advertiser nothing.
 */

export const BLOCK_THRESHOLD = 80;
export const REVIEW_THRESHOLD = 50;
/** A visitor is never blocked off a single click, however bad it looks. */
export const MIN_PAID_CLICKS_TO_BLOCK = 3;

export interface Reason {
  /** Signal label, matching the chip shown in the detail view. */
  signal: string;
  delta: number;
  /** Advertiser-facing sentence fragment: "clicked again 0.6s apart". */
  text: string;
}

const NON_PAID_WEIGHT = 0.5;

export function reasonsFor(visit: Visit): Reason[] {
  const r: Reason[] = [];
  const add = (signal: string, delta: number, text: string) => r.push({ signal, delta, text });

  if (visit.engagement === null) {
    add('Interaction level', 0, 'our tag stopped reporting, so engagement was never captured');
  } else {
    const { scrollPct, dwellSec, mouseMoves } = visit.engagement;
    if (dwellSec < 6 && scrollPct < 12) {
      add('Interaction level', 14, `left after ${dwellSec}s having scrolled ${scrollPct}% of the page`);
    } else if (dwellSec > 45 && scrollPct > 50) {
      add('Interaction level', -10, `read the page for ${Math.round(dwellSec / 60)}m and scrolled ${scrollPct}%`);
    }
    if (mouseMoves === 0 && dwellSec > 2) {
      add('Interaction level', 8, 'registered no mouse movement at all');
    }
  }

  if (visit.botProbability !== null && visit.botProbability >= 0.8) {
    add('Bot probability', 18, `scored ${pct(visit.botProbability)} on our automation model`);
  } else if (visit.botProbability !== null && visit.botProbability >= 0.6) {
    add('Bot probability', 10, `scored ${pct(visit.botProbability)} on our automation model`);
  } else if (visit.botProbability !== null && visit.botProbability <= 0.2) {
    add('Bot probability', -6, `looks human to our automation model (${pct(visit.botProbability)})`);
  }

  if (visit.vpn === 'datacenter') add('VPN / proxy', 12, 'arrived from a datacenter IP, not a consumer connection');
  else if (visit.vpn === 'residential-proxy') add('VPN / proxy', 8, 'came through a residential proxy network');
  else if (visit.vpn === 'consumer-vpn') add('VPN / proxy', 3, 'used a consumer VPN');

  if (visit.formFill === 'invalid') add('Form fill', 12, 'submitted an email address that does not exist');
  else if (visit.formFill === 'risky') add('Form fill', 5, 'submitted a disposable email address');
  else if (visit.formFill === 'valid') add('Form fill', -8, 'submitted a deliverable email address');

  if (visit.converted) {
    add('Conversion', -35, `converted , £${visit.conversionValueGbp?.toFixed(2)} of actual revenue`);
  }

  if (visit.clickCadenceSec !== null) {
    if (visit.clickCadenceSec < 1.5) {
      add('Click cadence', 15, `clicked again ${visit.clickCadenceSec.toFixed(1)}s later , faster than the page renders`);
    } else if (visit.clickCadenceSec < 4) {
      add('Click cadence', 7, `clicked again ${visit.clickCadenceSec.toFixed(1)}s later`);
    }
  }

  if (visit.fingerprintReuse >= 3) {
    add('Device fingerprint', 10, `the same browser fingerprint has appeared in ${visit.fingerprintReuse} supposedly separate sessions`);
  }

  if (visit.sessionSimilarity > 0.85) {
    add('Session similarity', 12, `repeated the previous session almost exactly , ${pct(visit.sessionSimilarity)} identical, where real people vary far more`);
  }

  if (visit.hourCluster) add('Time-of-day cluster', 5, 'landed inside the same narrow overnight window as the other visits');
  if (!visit.utmConsistent) add('UTM consistency', 6, 'the tracking parameters did not match the referrer it claimed');

  return r;
}

export function deltaFor(visit: Visit): number {
  const raw = reasonsFor(visit).reduce((sum, x) => sum + x.delta, 0);
  return visit.channel === 'paid' ? raw : raw * NON_PAID_WEIGHT;
}

/**
 * A single visit's risk, 0–100. The raw delta is squashed through a logistic
 * curve so one spectacular visit cannot pin the score at 100 and a long run of
 * mildly odd visits cannot creep there either , the curve is centred on the
 * point where a visit stops looking like a distracted human.
 */
export function visitRisk(visit: Visit): number {
  const raw = deltaFor(visit);
  return 100 / (1 + Math.exp(-(raw - RISK_CENTER) / RISK_SLOPE));
}

const RISK_CENTER = 30;
const RISK_SLOPE = 18;
/** How much of the previous score survives into the next visit. */
const MEMORY = 0.55;
/** Repetition is itself evidence, but only once the pattern already looks bad. */
const VOLUME_CAP = 15;

/** Running confidence across a journey, clamped to 0–99. */
export function scoreJourney(visits: Visit[]): number[] {
  let ema = 0;
  let paidSoFar = 0;
  return visits.map((v) => {
    if (v.channel === 'paid') paidSoFar += 1;
    ema = ema * MEMORY + visitRisk(v) * (1 - MEMORY);
    const volume = ema > 40 ? Math.min(VOLUME_CAP, Math.max(0, paidSoFar - 2) * 2) : 0;
    return Math.round(clamp(ema + volume));
  });
}

export const clamp = (n: number) => Math.max(0, Math.min(99, n));
export const pct = (n: number) => `${Math.round(n * 100)}%`;
