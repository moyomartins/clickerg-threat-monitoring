import {
  Button,
  Card,
  ConfidenceMeter,
  EmptyState,
  Journey,
  StatusPill,
  VisitEntry,
  type SignalChipProps,
  type VisitorStatus,
} from '@clickerg/ui';
import type { Visit, Visitor } from './data/types';
import { deltaFor, reasonsFor } from './data/scoring';
import { dateTime, money, relative } from './format';

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

function signalsFor(visit: Visit): SignalChipProps[] {
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

function noteFor(visit: Visit): string {
  const reasons = reasonsFor(visit);
  const against = reasons.filter((r) => r.delta > 0).map((r) => r.text);
  const forThem = reasons.filter((r) => r.delta < 0).map((r) => r.text);
  const delta = Math.round(deltaFor(visit));
  const weight =
    visit.channel === 'paid'
      ? ''
      : ' This visit did not come from an ad, so it counts for half — it tells us about the visitor without costing you anything.';

  if (against.length === 0 && forThem.length === 0) {
    return `Nothing stood out on this visit.${weight}`;
  }

  const parts: string[] = [];
  if (against.length) parts.push(`Against them: it ${against.join(', it ')}.`);
  if (forThem.length) parts.push(`In their favour: it ${forThem.join(', and it ')}.`);
  parts.push(delta > 0 ? `Net effect: confidence up.` : delta < 0 ? `Net effect: confidence down.` : 'Net effect: no change.');
  return parts.join(' ') + weight;
}

const sourceFor = (visit: Visit) =>
  visit.channel === 'paid'
    ? [visit.platform, visit.campaign, visit.keyword && `“${visit.keyword}”`].filter(Boolean).join(' · ')
    : visit.referrer;

interface Props {
  visitor: Visitor | undefined;
  onBack: () => void;
  onStatusChange: (ip: string, status: VisitorStatus) => void;
}

export function VisitorDetail({ visitor, onBack, onStatusChange }: Props) {
  if (!visitor) {
    return (
      <>
        <div className="detail__back">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back to all visitors
          </Button>
        </div>
        <EmptyState
          title="We have no record of that visitor"
          body="The link may be stale, or this IP may have dropped out of your retention window."
          action={<Button onClick={onBack}>Back to all visitors</Button>}
        />
      </>
    );
  }

  const peak = Math.max(...visitor.confidence);

  return (
    <>
      <div className="detail__back">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back to all visitors
        </Button>
      </div>

      <div className="detail__head">
        <div>
          <h1 className="detail__ip cg-mono">{visitor.ip}</h1>
          <p className="detail__where">
            {visitor.city}
            {visitor.region ? `, ${visitor.region}` : ''} · {visitor.country} · last seen {relative(visitor.lastSeen)}
          </p>
          <StatusPill status={visitor.status} />
        </div>
        <div className="detail__actions">
          {visitor.status === 'blocked' ? (
            <Button variant="ghost" onClick={() => onStatusChange(visitor.ip, 'allowed')}>
              Remove from exclusion list
            </Button>
          ) : (
            <>
              {visitor.status === 'ambiguous' && (
                <Button variant="ghost" onClick={() => onStatusChange(visitor.ip, 'allowed')}>
                  Mark as legitimate
                </Button>
              )}
              <Button onClick={() => onStatusChange(visitor.ip, 'blocked')}>Add to exclusion list</Button>
            </>
          )}
        </div>
      </div>

      <div className="detail__grid">
        <div>
          {visitor.dataGap && <p className="gap-note">{visitor.dataGap}</p>}

          <Card title="What we saw" style={{ marginBottom: 'var(--cg-space-3)' }}>
            <p className="verdict">{visitor.verdict}</p>
          </Card>

          <Card title={`The journey — ${visitor.visits.length} visits`}>
            <Journey>
              {visitor.visits.map((visit, i) => (
                <VisitEntry
                  key={visit.id}
                  index={i + 1}
                  timestamp={dateTime(visit.at)}
                  channel={visit.channel}
                  source={sourceFor(visit)}
                  cost={visit.costGbp !== undefined ? money(visit.costGbp) : undefined}
                  signals={signalsFor(visit)}
                  note={noteFor(visit)}
                  confidence={visitor.confidence[i]}
                  decisive={i === visitor.decisiveIndex}
                  verdict={i === visitor.decisiveIndex ? visitor.verdict : undefined}
                  last={i === visitor.visits.length - 1}
                />
              ))}
            </Journey>
          </Card>
        </div>

        <Card title="At a glance" density="compact">
          <ConfidenceMeter value={peak} label="Peak confidence" />
          <dl className="facts" style={{ marginTop: 'var(--cg-space-2)' }}>
            <dt>Visits</dt>
            <dd>{visitor.visits.length}</dd>
            <dt>Paid clicks</dt>
            <dd>{visitor.paidVisits}</dd>
            <dt>Free visits</dt>
            <dd>{visitor.visits.length - visitor.paidVisits}</dd>
            <dt>Ad spend</dt>
            <dd className="cg-mono">{money(visitor.spendGbp)}</dd>
            <dt>Revenue</dt>
            <dd className="cg-mono">{money(visitor.revenueGbp)}</dd>
            <dt>First seen</dt>
            <dd>{dateTime(visitor.firstSeen)}</dd>
            <dt>Last seen</dt>
            <dd>{dateTime(visitor.lastSeen)}</dd>
          </dl>
        </Card>
      </div>
    </>
  );
}
