import type { Channel, VisitorStatus } from '@clickerg/ui';

export type { Channel, VisitorStatus };

export type VpnState = 'none' | 'consumer-vpn' | 'residential-proxy' | 'datacenter';
export type FormFill = 'unknown' | 'none' | 'valid' | 'risky' | 'invalid';

export interface Engagement {
  scrollPct: number;
  dwellSec: number;
  clicks: number;
  mouseMoves: number;
}

export interface Visit {
  id: string;
  /** Epoch ms. */
  at: number;
  channel: Channel;
  platform?: 'Google Ads' | 'Meta Ads';
  campaign?: string;
  keyword?: string;
  referrer?: string;
  landingPage?: string;
  formSubmitted?: boolean | null;
  conversionCaptured?: boolean;
  postDecisionReason?: string;
  /** Paid visits only — this is the money the advertiser actually spent. */
  costGbp?: number;

  /** `null` when the tag failed to report: missing, not clean. */
  engagement: Engagement | null;
  botProbability: number | null;
  vpn: VpnState;
  formFill: FormFill;
  converted: boolean;
  conversionValueGbp?: number;

  /* Invented signals — chosen because each one is explainable to a
     non-technical advertiser in a single sentence. */
  /** Median seconds between repeat clicks in this session; null if single click. */
  clickCadenceSec: number | null;
  /** How many "separate" sessions share this browser fingerprint. */
  fingerprintReuse: number;
  /** 0–1: how identical this session's behaviour is to the previous one. */
  sessionSimilarity: number;
  /** Visit falls inside the same narrow time-of-day band as the rest. */
  hourCluster: boolean;
  /** Referrer and UTM parameters agree with each other. */
  utmConsistent: boolean;
}

export interface Visitor {
  ip: string;
  aliases?: string[];
  scenario?: string;
  mockMetadata?: true;
  automatedStatus?: VisitorStatus;
  manualHistory?: { at: number; status: VisitorStatus; reason: string }[];
  exclusionEvents?: { platform: 'Google Ads' | 'Meta Ads'; requestedAt: number; confirmedAt?: number; scope: string }[];
  city: string;
  region: string;
  country: string;
  countryCode: string;
  visits: Visit[];
  /** Running confidence after each visit, index-aligned with `visits`. */
  confidence: number[];
  status: VisitorStatus;
  /** Index into `visits` where the block was decided, or -1. */
  decisiveIndex: number;
  /** One-line "why", shown in the list. */
  summary: string;
  /** Full plain-language verdict, shown in the detail view. */
  verdict: string;
  firstSeen: number;
  lastSeen: number;
  paidVisits: number;
  spendGbp: number;
  revenueGbp: number;
  /** Set when part of this visitor's data never arrived. */
  dataGap?: string;
}
