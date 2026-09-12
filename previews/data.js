/**
 * Shared content for every direction preview.
 *
 * Pulled verbatim from the running production app so the six directions tell
 * an identical story and the comparison stays about design. Two grammar
 * fragments were repaired ("it the same browser fingerprint…" → "the same
 * browser fingerprint…"); the defect is in src/data/scoring.ts and is flagged
 * separately rather than reproduced six times here.
 *
 * Nothing in this file is imported by the product. It is a copy on purpose.
 */

export const SUMMARY = [
  { value: '53', label: 'Visitors seen' },
  { value: '13', label: 'Blocked' },
  { value: '£979.39', label: 'Spend behind blocked IPs' },
  { value: '306', label: 'Paid clicks' },
];

export const VISITORS = [
  {
    ip: '41.203.88.7', city: 'Lagos', country: 'Nigeria', status: 'blocked',
    visits: 29, paid: 29, free: 0, spend: '£158.38', confidence: 99,
    seen: '12h ago', first: '2d ago', pinned: 'The click farm',
    why: '29 paid clicks, scored 78% on our automation model',
  },
  {
    ip: '82.14.90.221', city: 'Leeds', country: 'United Kingdom', status: 'ambiguous',
    visits: 6, paid: 5, free: 1, spend: '£24.05', confidence: 63,
    seen: '2d ago', first: '9d ago', pinned: 'The honest tie',
    why: 'Converted £249.00 but used a consumer VPN',
  },
  {
    ip: '178.62.40.9', city: 'Unknown', country: 'Unknown', status: 'incomplete',
    visits: 3, paid: 2, free: 1, spend: '£15.23', confidence: 17,
    seen: '4d ago', first: '5d ago', pinned: 'Tag stopped reporting',
    why: 'Our tag stopped reporting partway through this journey, so engagement and form data were never captured.',
  },
  { ip: '151.80.14.53', city: 'Lagos', country: 'Nigeria', status: 'blocked', visits: 16, paid: 16, free: 0, spend: '£88.40', confidence: 99, seen: '49m ago', first: '23h ago', why: '16 paid clicks, scored 96% on our automation model' },
  { ip: '78.132.89.54', city: 'Toronto', country: 'Canada', status: 'blocked', visits: 18, paid: 18, free: 0, spend: '£105.71', confidence: 99, seen: '1h ago', first: 'yesterday', why: '18 paid clicks, scored 97% on our automation model' },
  { ip: '118.132.36.23', city: 'Toronto', country: 'Canada', status: 'blocked', visits: 10, paid: 6, free: 4, spend: '£29.31', confidence: 95, seen: '1h ago', first: 'yesterday', why: '6 paid clicks, scored 66% on our automation model' },
  { ip: '199.52.204.61', city: 'Leeds', country: 'United Kingdom', status: 'blocked', visits: 15, paid: 15, free: 0, spend: '£104.43', confidence: 99, seen: '1h ago', first: 'yesterday', why: '15 paid clicks, scored 93% on our automation model' },
  { ip: '113.0.60.50', city: 'Warsaw', country: 'Poland', status: 'blocked', visits: 7, paid: 6, free: 1, spend: '£28.51', confidence: 94, seen: '1h ago', first: '20h ago', why: '6 paid clicks, scored 78% on our automation model' },
  { ip: '203.189.22.232', city: 'Singapore', country: 'Singapore', status: 'blocked', visits: 18, paid: 18, free: 0, spend: '£106.24', confidence: 99, seen: '2h ago', first: 'yesterday', why: '18 paid clicks, scored 92% on our automation model' },
  { ip: '148.94.122.52', city: 'Amsterdam', country: 'Netherlands', status: 'blocked', visits: 12, paid: 12, free: 0, spend: '£80.76', confidence: 99, seen: '2h ago', first: '17h ago', why: '12 paid clicks, scored 86% on our automation model' },
];

export const STATUS_LABEL = {
  blocked: 'Blocked',
  ambiguous: 'Judgement call',
  incomplete: 'Incomplete data',
  review: 'Under review',
  allowed: 'Not blocked',
};

/** The click-farm drill-down: the case the brief asks every direction to show. */
export const CASE = {
  ip: '41.203.88.7',
  city: 'Lagos',
  country: 'Nigeria',
  status: 'blocked',
  verdict:
    'We blocked this visitor on 13 Aug 2025, at paid click number 3. Across the whole journey it scored 78% on our automation model, clicked again 0.4s later — faster than the page renders, registered no mouse movement at all. That is £158.38 of ad spend with no conversion behind it. This IP is now on your exclusion list, so it will stop seeing your ads.',
  facts: [
    ['Visits', '29'], ['Paid clicks', '29'], ['Free visits', '0'],
    ['Ad spend', '£158.38'], ['Revenue', '£0.00'],
    ['First seen', '13 Aug 2025, 10:01'], ['Last seen', '14 Aug 2025, 22:28'],
  ],
  trailing: '24 further visits followed the same pattern, every one of them a paid click.',
  visits: [
    {
      n: 1, time: '13 Aug 2025, 10:01', tag: 'Paid click', cost: '£6.35',
      source: 'Google Ads · generic-broad-match · “google ads click fraud”',
      confidence: 44, decisive: false,
      signals: [
        { l: 'Interaction', v: '0% scrolled, 1s', sev: 'high' },
        { l: 'Bot probability', v: '62%', sev: 'medium' },
        { l: 'VPN / proxy', v: 'Datacenter IP', sev: 'high' },
        { l: 'Form fill', v: 'Undeliverable email', sev: 'high' },
        { l: 'Click cadence', v: '0.4s between clicks', sev: 'high' },
        { l: 'Device fingerprint', v: 'Seen in 4 sessions', sev: 'medium' },
        { l: 'Session similarity', v: '0.86', sev: 'high' },
        { l: 'Click cost', v: '£6.35', sev: 'neutral' },
      ],
      note: 'Against them: it left after 1s having scrolled 0% of the page, it scored 62% on our automation model, it arrived from a datacenter IP, not a consumer connection, it submitted an email address that does not exist, it clicked again 0.4s later — faster than the page renders, the same browser fingerprint has appeared in 4 supposedly separate sessions, it repeated the previous session almost exactly — 86% identical, where real people vary far more, it landed inside the same narrow overnight window as the other visits, and the tracking parameters did not match the referrer it claimed. Net effect: confidence up.',
    },
    {
      n: 2, time: '13 Aug 2025, 11:26', tag: 'Paid click', cost: '£5.62',
      source: 'Google Ads · uk-brand-exact · “stop invalid clicks”',
      confidence: 68, decisive: false,
      signals: [
        { l: 'Interaction', v: '0% scrolled, 3s', sev: 'high' },
        { l: 'Bot probability', v: '64%', sev: 'medium' },
        { l: 'VPN / proxy', v: 'Datacenter IP', sev: 'high' },
        { l: 'Click cadence', v: '0.5s between clicks', sev: 'high' },
        { l: 'Device fingerprint', v: 'Seen in 5 sessions', sev: 'medium' },
        { l: 'Session similarity', v: '0.86', sev: 'high' },
        { l: 'Click cost', v: '£5.62', sev: 'neutral' },
      ],
      note: 'Against them: it left after 3s having scrolled 0% of the page, it registered no mouse movement at all, it scored 64% on our automation model, it arrived from a datacenter IP, not a consumer connection, it clicked again 0.5s later — faster than the page renders, the same browser fingerprint has appeared in 5 supposedly separate sessions, it repeated the previous session almost exactly — 86% identical, where real people vary far more, it landed inside the same narrow overnight window as the other visits, and the tracking parameters did not match the referrer it claimed. Net effect: confidence up.',
    },
    {
      n: 3, time: '13 Aug 2025, 12:44', tag: 'Paid click', cost: '£5.81',
      source: 'Google Ads · retargeting-display · “google ads click fraud”',
      confidence: 83, decisive: true,
      signals: [
        { l: 'Interaction', v: '0% scrolled, 3s', sev: 'high' },
        { l: 'Bot probability', v: '66%', sev: 'medium' },
        { l: 'VPN / proxy', v: 'Datacenter IP', sev: 'high' },
        { l: 'Click cadence', v: '0.6s between clicks', sev: 'high' },
        { l: 'Device fingerprint', v: 'Seen in 6 sessions', sev: 'medium' },
        { l: 'Session similarity', v: '0.87', sev: 'high' },
        { l: 'Click cost', v: '£5.81', sev: 'neutral' },
      ],
      note: 'Against them: it left after 3s having scrolled 0% of the page, it registered no mouse movement at all, it scored 66% on our automation model, it arrived from a datacenter IP, not a consumer connection, it clicked again 0.6s later — faster than the page renders, the same browser fingerprint has appeared in 6 supposedly separate sessions, it repeated the previous session almost exactly — 87% identical, where real people vary far more, it landed inside the same narrow overnight window as the other visits, and the tracking parameters did not match the referrer it claimed. Net effect: confidence up.',
    },
    {
      n: 4, time: '13 Aug 2025, 13:59', tag: 'Paid click', cost: '£7.86',
      source: 'Google Ads · uk-brand-exact · “ppc fraud tool”',
      confidence: 92, decisive: false,
      signals: [
        { l: 'Interaction', v: '0% scrolled, 1s', sev: 'high' },
        { l: 'Bot probability', v: '68%', sev: 'medium' },
        { l: 'VPN / proxy', v: 'Datacenter IP', sev: 'high' },
        { l: 'Form fill', v: 'Undeliverable email', sev: 'high' },
        { l: 'Click cadence', v: '0.7s between clicks', sev: 'high' },
        { l: 'Device fingerprint', v: 'Seen in 7 sessions', sev: 'medium' },
        { l: 'Session similarity', v: '0.87', sev: 'high' },
        { l: 'Click cost', v: '£7.86', sev: 'neutral' },
      ],
      note: 'Against them: it left after 1s having scrolled 0% of the page, it scored 68% on our automation model, it arrived from a datacenter IP, not a consumer connection, it submitted an email address that does not exist, it clicked again 0.7s later — faster than the page renders, the same browser fingerprint has appeared in 7 supposedly separate sessions, it repeated the previous session almost exactly — 87% identical, where real people vary far more, it landed inside the same narrow overnight window as the other visits, and the tracking parameters did not match the referrer it claimed. Net effect: confidence up.',
    },
    {
      n: 5, time: '13 Aug 2025, 15:17', tag: 'Paid click', cost: '£5.06',
      source: 'Meta Ads · meta-retarget-7d',
      confidence: 97, decisive: false,
      signals: [
        { l: 'Interaction', v: '0% scrolled, 2s', sev: 'high' },
        { l: 'Bot probability', v: '70%', sev: 'medium' },
        { l: 'VPN / proxy', v: 'Datacenter IP', sev: 'high' },
        { l: 'Click cadence', v: '0.6s between clicks', sev: 'high' },
        { l: 'Device fingerprint', v: 'Seen in 8 sessions', sev: 'medium' },
        { l: 'Session similarity', v: '0.88', sev: 'high' },
        { l: 'Click cost', v: '£5.06', sev: 'neutral' },
      ],
      note: 'Against them: it left after 2s having scrolled 0% of the page, it scored 70% on our automation model, it arrived from a datacenter IP, not a consumer connection, it clicked again 0.6s later — faster than the page renders, the same browser fingerprint has appeared in 8 supposedly separate sessions, it repeated the previous session almost exactly — 88% identical, where real people vary far more, it landed inside the same narrow overnight window as the other visits, and the tracking parameters did not match the referrer it claimed. Net effect: confidence up.',
    },
  ],
};

export const DIRECTIONS = [
  { id: 'd1', name: 'Safelight Bay',   tagline: 'Evidence developing under amber light — contact-sheet grid, full-bleed detail, drying-line journey.' },
  { id: 'd2', name: 'Developer Console', tagline: 'Graphite dark-first console — dense table, split-pane detail, syntax-coloured signals.' },
  { id: 'd3', name: 'Notation Score',  tagline: 'Labanotation staff — timeline-first list, each journey read upward as a scored column.' },
  { id: 'd4', name: 'Emission Rail',   tagline: 'Calibrated off-centre rail — spectral hairlines, state carried by line weight, not hue.' },
  { id: 'd5', name: 'Orizuru Sequence', tagline: 'Vermilion washi — folded-sheet cards, the journey as thirty-two deliberate folds.' },
  { id: 'd6', name: 'Iridescent Edge', tagline: 'Diffraction bands — soft banded rows, modal detail, severity as spectral position.' },
];
