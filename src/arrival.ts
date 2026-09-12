/**
 * Per-arrival copy: the signal chips, the plain-language note, and the
 * contextual explanation shown when a journey card is hovered or focused.
 *
 * Moved out of VisitorDetail.tsx so the card's `note` prop and the new
 * contextual disclosure are guaranteed to read the same sentence — there is
 * one explanation generator, not two. `noteFor` is unchanged in shape from
 * the version that used to render in the standalone "What each arrival
 * showed" section below the strip; the only behavioural fix is that a visit
 * whose tag never reported no longer reads as "nothing stood out" (a clean
 * result) when nothing else fired either — it now says so explicitly.
 */

import { BLOCK_THRESHOLD, deltaFor, reasonsFor } from './data/scoring';
import type { Visit, Visitor } from './data/types';
import type { SignalChipProps } from '@clickerg/ui';
import { money } from './format';

const VPN_COPY: Record<Visit['vpn'], string> = {
  none: 'None',
  'consumer-vpn': 'Consumer VPN',
  'residential-proxy': 'Residential proxy',
  datacenter: 'Datacenter IP',
};

const FORM_COPY: Record<Visit['formFill'], string> = {
  none: 'No form submitted',
  valid: 'Deliverable email',
  risky: 'Disposable email',
  invalid: 'Undeliverable email',
};

export function signalsFor(visit: Visit): SignalChipProps[] {
  const chips: SignalChipProps[] = [];

  chips.push(
    visit.engagement === null
      ? {
          label: 'Interaction',
          severity: 'unknown',
          hint: 'Our tag never reported engagement for this visit, so it is excluded from scoring rather than assumed clean.',
        }
      : {
          label: 'Interaction',
          value: `${visit.engagement.scrollPct}% scrolled, ${visit.engagement.dwellSec}s`,
          severity:
            visit.engagement.dwellSec < 6 && visit.engagement.scrollPct < 12
              ? 'high'
              : visit.engagement.dwellSec > 45
                ? 'low'
                : 'neutral',
          hint: `${visit.engagement.clicks} click(s), ${visit.engagement.mouseMoves} mouse movements recorded.`,
        },
  );

  chips.push({
    label: 'Bot probability',
    value: `${Math.round(visit.botProbability * 100)}%`,
    severity: visit.botProbability >= 0.8 ? 'high' : visit.botProbability >= 0.6 ? 'medium' : 'low',
    hint: 'How confident our model is that this visit was automated rather than a person.',
  });

  chips.push({
    label: 'VPN / proxy',
    value: VPN_COPY[visit.vpn],
    severity: visit.vpn === 'datacenter' ? 'high' : visit.vpn === 'residential-proxy' ? 'medium' : visit.vpn === 'consumer-vpn' ? 'neutral' : 'low',
    hint: 'Whether the connection was masking where the visitor really is.',
  });

  if (visit.formFill !== 'none') {
    chips.push({
      label: 'Form fill',
      value: FORM_COPY[visit.formFill],
      severity: visit.formFill === 'invalid' ? 'high' : visit.formFill === 'risky' ? 'medium' : 'low',
      hint: 'Deliverability of the email address submitted at the time of the form fill.',
    });
  }

  if (visit.clickCadenceSec !== null) {
    chips.push({
      label: 'Click cadence',
      value: `${visit.clickCadenceSec.toFixed(1)}s between clicks`,
      severity: visit.clickCadenceSec < 1.5 ? 'high' : visit.clickCadenceSec < 4 ? 'medium' : 'neutral',
      hint: 'Time between repeat clicks. Under a second is faster than a person can read the page.',
    });
  }

  if (visit.fingerprintReuse > 1) {
    chips.push({
      label: 'Device fingerprint',
      value: `Seen in ${visit.fingerprintReuse} sessions`,
      severity: visit.fingerprintReuse >= 3 ? 'medium' : 'neutral',
      hint: 'The same browser fingerprint appearing across sessions that present themselves as different visitors.',
    });
  }

  chips.push({
    label: 'Session similarity',
    value: visit.sessionSimilarity.toFixed(2),
    severity: visit.sessionSimilarity > 0.85 ? 'high' : visit.sessionSimilarity > 0.7 ? 'medium' : 'low',
    hint: 'How closely this session repeats the previous one. Real people vary; scripts do not.',
  });

  if (visit.converted) {
    chips.push({
      label: 'Conversion',
      value: money(visit.conversionValueGbp ?? 0),
      severity: 'low',
      hint: 'This visit produced actual revenue.',
    });
  }

  if (visit.costGbp !== undefined) {
    chips.push({
      label: 'Click cost',
      value: money(visit.costGbp),
      severity: 'neutral',
      hint: 'What this click cost you. Only paid visits cost money.',
    });
  }

  return chips;
}

export function noteFor(visit: Visit): string {
  const reasons = reasonsFor(visit);
  const against = reasons.filter((r) => r.delta > 0).map((r) => r.text);
  const forThem = reasons.filter((r) => r.delta < 0).map((r) => r.text);
  const missing = visit.engagement === null;
  const delta = Math.round(deltaFor(visit));
  const weight =
    visit.channel === 'paid'
      ? ''
      : ' This visit did not come from an ad, so it counts for half — it tells us about the visitor without costing you anything.';

  const parts: string[] = [];

  /* A tag that stopped reporting is not a clean result and is not zero — say
     so before anything else, so it can never read as "nothing stood out." */
  if (missing) {
    parts.push('Our tag stopped reporting, so engagement was never captured and was excluded from scoring.');
  }

  if (against.length === 0 && forThem.length === 0) {
    if (!missing) parts.push('Nothing stood out on this visit.');
  } else {
    if (against.length) parts.push(`Against them: it ${against.join(', it ')}.`);
    if (forThem.length) parts.push(`In their favour: it ${forThem.join(', and it ')}.`);
    parts.push(delta > 0 ? 'Net effect: confidence up.' : delta < 0 ? 'Net effect: confidence down.' : 'Net effect: no change.');
  }

  return parts.join(' ') + weight;
}

export const sourceFor = (visit: Visit) =>
  visit.channel === 'paid'
    ? [visit.platform, visit.campaign, visit.keyword && `“${visit.keyword}”`].filter(Boolean).join(' · ')
    : visit.referrer;

export interface ArrivalExplanation {
  /** Responds to the visit's own state — never the same generic heading everywhere. */
  title: string;
  /** The plain-language explanation, reused verbatim from `noteFor`. */
  body: string;
  decisive: boolean;
  crossedThreshold: boolean;
  missing: boolean;
  confidenceBefore: number;
  confidenceAfter: number;
  cost: string | null;
  /** `null` on a paid visit — cost is the relevant fact there, not source. */
  source: string | null;
}

/** Everything the contextual disclosure needs for one arrival, derived from
 *  the same visit record and scoring output as the card and the hero. */
export function arrivalExplanationFor(visitor: Visitor, index: number): ArrivalExplanation {
  const visit = visitor.visits[index];
  const decisive = index === visitor.decisiveIndex;
  const missing = visit.engagement === null;
  const confidenceBefore = index === 0 ? 0 : visitor.confidence[index - 1];
  const confidenceAfter = visitor.confidence[index];
  const delta = confidenceAfter - confidenceBefore;
  const crossedThreshold = decisive && confidenceAfter >= BLOCK_THRESHOLD;

  let title: string;
  if (decisive) title = 'Why this arrival was decisive';
  else if (missing) title = 'What ClickerG could assess';
  else if (delta > 0) title = 'Why confidence increased';
  else if (delta < 0) title = 'Why confidence decreased';
  else title = 'What this arrival showed';

  return {
    title,
    body: noteFor(visit),
    decisive,
    crossedThreshold,
    missing,
    confidenceBefore,
    confidenceAfter,
    cost: visit.costGbp !== undefined ? money(visit.costGbp) : null,
    source: visit.channel !== 'paid' ? (sourceFor(visit) || null) : null,
  };
}
