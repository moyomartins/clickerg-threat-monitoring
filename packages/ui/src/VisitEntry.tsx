import type { ReactNode } from 'react';
import { ArrivalDisclosure } from './ArrivalDisclosure';
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
  /**
   * Names the contextual disclosure and supplies its body — hover, focus, or
   * tap on the card reveals it. Omit for a card with nothing to disclose
   * (e.g. a Storybook example that isn't demonstrating the interaction).
   */
  explanation?: { title: string; content: ReactNode };
  /** Running confidence after this visit, 0–100. */
  confidence: number;
  /** Recorded engagement for this arrival; `null` when the tag never reported. */
  replay?: ReplayBehaviour | null;
  decisive?: boolean;
  /** Story-only frozen phase for reviewing the decorative decisive reflection. */
  reflectionPhase?: 'inactive' | 'entering' | 'centred' | 'leaving' | 'exited';
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
  explanation,
  confidence,
  replay,
  decisive = false,
  reflectionPhase,
  verdict,
}: VisitEntryProps) {
  const cardClassName = `cg-visit${decisive ? ' cg-visit--decisive' : ''}${reflectionPhase ? ` cg-visit--reflection-${reflectionPhase}` : ''}`;

  const card = (
    <>
      {decisive && <span className="cg-visit__reflection-logo" aria-hidden="true" />}
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

        {verdict && <div className="cg-visit__verdict">{verdict}</div>}
      </div>
    </>
  );

  if (!explanation) {
    return <li className={cardClassName}>{card}</li>;
  }

  return (
    <ArrivalDisclosure className={cardClassName} label={explanation.title} content={explanation.content}>
      {card}
    </ArrivalDisclosure>
  );
}

export function Journey({ children }: { children: ReactNode }) {
  return <ol className="cg-journey">{children}</ol>;
}
