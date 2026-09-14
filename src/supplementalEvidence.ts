import type { TelemetryEvidence } from '@clickerg/ui';
import type { Visitor } from './data/types';

/** Diagnostic observations reserved for the list's on-demand evidence panel. */
export function supplementalEvidence(visitor: Visitor, allVisitors: Visitor[]): TelemetryEvidence[] {
  const latest = visitor.visits.at(-1)!;
  const network = latest.vpn === 'datacenter'
    ? 'AS24940 · Hetzner Online · datacenter'
    : latest.vpn === 'residential-proxy'
      ? 'AS9009 · residential proxy network'
      : latest.vpn === 'consumer-vpn'
        ? 'AS7922 · consumer VPN exit'
        : 'AS3320 · consumer broadband';
  const usesUkCampaign = latest.campaign?.startsWith('uk-') ?? false;
  const countryMismatch = usesUkCampaign && visitor.country !== 'United Kingdom';
  const fifteenMinutes = 15 * 60 * 1000;
  const accountBurst = allVisitors.flatMap((item) => item.visits).filter((visit) => visit.channel === 'paid' && Math.abs(visit.at - latest.at) <= fifteenMinutes).length;
  const relatedFingerprintIps = visitor.visits.reduce((count, visit) => Math.max(count, Math.max(0, visit.fingerprintReuse - 1)), 0);
  const repeatedPaths = new Set(visitor.visits.map((visit) => visit.landingPage ?? visit.referrer).filter(Boolean));
  const sync = visitor.exclusionEvents?.map((event) => `${event.platform.replace(' Ads', '')}: ${event.confirmedAt ? 'synced' : 'pending'}`).join(' · ') ?? 'No exclusion action required';
  const userAgent = latest.vpn === 'datacenter' ? 'Chrome 127 · Linux x86_64' : latest.vpn === 'residential-proxy' ? 'Chrome 126 · Windows 10' : 'Safari 17 · macOS';
  return [
    { label: 'ISP / ASN', value: network, tone: latest.vpn === 'datacenter' ? 'high' : 'neutral' },
    { label: 'Targeting match', value: countryMismatch ? `${visitor.country} IP on UK campaign` : 'IP geography aligns with campaign', tone: countryMismatch ? 'medium' : 'low' },
    { label: 'Account click burst', value: `${accountBurst} paid arrivals in the surrounding 15 min`, tone: accountBurst >= 4 ? 'high' : 'neutral' },
    { label: 'Shared fingerprint', value: relatedFingerprintIps ? `Observed on ${relatedFingerprintIps} other IP${relatedFingerprintIps === 1 ? '' : 's'}` : 'No cross-IP match recorded', tone: relatedFingerprintIps >= 3 ? 'high' : relatedFingerprintIps ? 'medium' : 'low' },
    { label: 'User agent', value: userAgent, tone: 'neutral' },
    { label: 'Landing / referrer pattern', value: repeatedPaths.size === 1 ? 'Repeated path or referrer across this journey' : `${repeatedPaths.size} landing or referrer paths in journey`, tone: repeatedPaths.size === 1 && visitor.visits.length > 2 ? 'medium' : 'neutral' },
    { label: 'Exclusion delivery', value: sync, tone: visitor.status === 'blocked' ? 'neutral' : 'low' },
  ];
}
