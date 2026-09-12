import type { ReactNode } from 'react';
import { SignalChip, type SignalChipProps } from './SignalChip';
import { PageReplay, type ReplayBehaviour } from './PageReplay';

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
  source?: string;
  cost?: string;
  signals: SignalChipProps[];
  note?: ReactNode;
  /** Running confidence after this visit, 0–100. */
  confidence: number;
  /** Recorded engagement for this arrival; `null` when the tag never reported. */
  replay?: ReplayBehaviour | null;
  /**
   * The strip stacks notes beneath it so the visual comparison across arrivals
   * is never interrupted by prose. Set true to render the note inline instead.
   */
  showNote?: boolean;
  decisive?: boolean;
  verdict?: ReactNode;
  last?: boolean;
  stage?: string;
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
  replay,
  showNote = true,
  decisive = false,
  verdict,
}: VisitEntryProps) {
  return (
    <li className={`cg-visit${decisive ? ' cg-visit--decisive' : ''}`}>
      <div className="cg-visit__body">
        {replay !== undefined && <PageReplay behaviour={replay} size="strip" />}

        <div className="cg-visit__head">
          <span className="cg-visit__no">
            visit {index} · {confidence}%
          </span>
          <span className="cg-visit__time">{timestamp}</span>
          <span className="cg-visit__tag">{CHANNEL_LABELS[channel]}</span>
          {cost && <span className="cg-visit__meta"> · {cost}</span>}
          {source && (
            <>
              <br />
              <span className="cg-visit__meta">{source}</span>
            </>
          )}
        </div>

        {signals.length > 0 && (
          <div className="cg-visit__signals">
            {signals.map((s) => (
              <SignalChip key={s.label} {...s} />
            ))}
          </div>
        )}

        {showNote && note && <p className="cg-visit__note cg-visit__note--inline">{note}</p>}
        {verdict && <div className="cg-visit__verdict">{verdict}</div>}
      </div>
    </li>
  );
}

export function Journey({ children }: { children: ReactNode }) {
  return <ol className="cg-journey">{children}</ol>;
}
