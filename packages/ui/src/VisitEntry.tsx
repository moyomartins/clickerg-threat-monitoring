import type { ReactNode } from 'react';
import { SignalChip, type SignalChipProps } from './SignalChip';
import { ConfidenceMeter } from './Feedback';

export type Channel = 'paid' | 'organic' | 'direct' | 'referral';

const CHANNEL_LABELS: Record<Channel, string> = {
  paid: 'Paid click',
  organic: 'Organic search',
  direct: 'Direct',
  referral: 'Referral',
};

export interface VisitEntryProps {
  /** 1-based position in the journey. */
  index: number;
  timestamp: string;
  channel: Channel;
  /** Campaign / keyword / referrer detail for this visit. */
  source?: string;
  /** Only paid visits cost money. */
  cost?: string;
  signals: SignalChipProps[];
  /** Plain-language note about what this visit changed. */
  note?: ReactNode;
  /** Running confidence after this visit, 0–100. */
  confidence: number;
  /** The visit where the system crossed its blocking threshold. */
  decisive?: boolean;
  /** Verdict copy, shown in a dark panel under the decisive visit. */
  verdict?: ReactNode;
  /** Hides the connector line on the final entry. */
  last?: boolean;
}

export function VisitEntry({
  index,
  timestamp,
  channel,
  source,
  cost,
  signals,
  note,
  confidence,
  decisive = false,
  verdict,
  last = false,
}: VisitEntryProps) {
  return (
    <li className={`cg-visit${decisive ? ' cg-visit--decisive' : ''}`}>
      <div className="cg-visit__rail" aria-hidden="true">
        <span className="cg-visit__node">{index}</span>
        {!last && <span className="cg-visit__line" />}
      </div>
      <div className="cg-visit__body">
        <div className="cg-visit__head">
          <span className="cg-visit__time">{timestamp}</span>
          <span className={`cg-visit__tag${channel === 'paid' ? ' cg-visit__tag--paid' : ''}`}>
            {CHANNEL_LABELS[channel]}
          </span>
          {cost && <span className="cg-visit__meta cg-mono">{cost}</span>}
          {source && <span className="cg-visit__meta">{source}</span>}
        </div>

        {signals.length > 0 && (
          <div className="cg-visit__signals">
            {signals.map((s) => (
              <SignalChip key={s.label} {...s} />
            ))}
          </div>
        )}

        {note && <p className="cg-visit__note">{note}</p>}
        <ConfidenceMeter value={confidence} label={`Confidence after visit ${index}`} />
        {verdict && <div className="cg-visit__verdict">{verdict}</div>}
      </div>
    </li>
  );
}

export function Journey({ children }: { children: ReactNode }) {
  return <ol className="cg-journey" style={{ listStyle: 'none', margin: 0, padding: 0 }}>{children}</ol>;
}
