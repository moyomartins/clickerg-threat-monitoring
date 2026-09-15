import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrivalDisclosure } from './ArrivalDisclosure';
import { GlassMark } from './GlassMark';
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
  /** Compact visible timestamp. */
  timestamp: string;
  /** Optional machine-readable timestamp and its full spoken label. */
  timestampIso?: string;
  timestampLabel?: string;
  channel: Channel;
  source?: string;
  cost?: string;
  signals: SignalChipProps[];
  /**
   * Names the contextual disclosure and supplies its body , hover, focus, or
   * tap on the card reveals it. Omit for a card with nothing to disclose
   * (e.g. a Storybook example that isn't demonstrating the interaction).
   */
  explanation?: { title: string; content: ReactNode };
  /** Running confidence after this visit, 0–100. */
  confidence: number;
  /** Recorded engagement for this arrival; `null` when the tag never reported. */
  replay?: ReplayBehaviour | null;
  decisive?: boolean;
  /**
   * Storybook-only: freezes the decorative reflection at a known point so it
   * can be captured deterministically. Production leaves this undefined and
   * the sweep runs autonomously.
   */
  reflectionPhase?: 'idle' | 'entering' | 'active' | 'exiting' | 'completed' | 'autonomous';
  verdict?: ReactNode;
  last?: boolean;
  stage?: string;
}

export function VisitEntry({
  index,
  timestamp,
  timestampIso,
  timestampLabel,
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
  const frozen = reflectionPhase !== undefined && reflectionPhase !== 'autonomous';
  const reflection = useAutonomousReflection(decisive && !frozen);
  const phaseClass = frozen
    ? ` cg-visit--reflection-phase-${reflectionPhase}`
    : reflection.running
      ? ''
      : ' cg-visit--reflection-paused';
  const cardClassName = `cg-visit${decisive ? ` cg-visit--decisive${phaseClass}` : ''}`;
  const reflectionStyle = decisive ? reflectionTiming(index) : undefined;

  const card = (
    <>
      {decisive && (
        <span ref={reflection.ref} className="cg-visit__reflection-logo" aria-hidden="true">
          <GlassMark />
        </span>
      )}
      <div className="cg-visit__body">
        {replay !== undefined && <PageReplay behaviour={replay} size="strip" />}

        <div className="cg-visit__head">
          <div className="cg-visit__head-row">
            <span className="cg-visit__no">
              visit {index} · {confidence}%
            </span>
            {timestampIso ? (
              <time className="cg-visit__time" dateTime={timestampIso} aria-label={timestampLabel}>{timestamp}</time>
            ) : (
              <span className="cg-visit__time">{timestamp}</span>
            )}
          </div>
          <div className="cg-visit__head-row">
            <span className="cg-visit__tag">{CHANNEL_LABELS[channel]}</span>
            {cost && <span className="cg-visit__meta">{cost}</span>}
          </div>
          {source && <span className="cg-visit__meta cg-visit__source">{source}</span>}
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
    return <li className={cardClassName} style={reflectionStyle}>{card}</li>;
  }

  return (
    <ArrivalDisclosure
      className={`${cardClassName} cg-focusable`}
      style={reflectionStyle}
      label={explanation.title}
      content={explanation.content}
      triggerLabel={`Visit ${index}, ${confidence}% confidence. Additional arrival details available.`}
    >
      {card}
    </ArrivalDisclosure>
  );
}

/**
 * Per-card timing. Two cards on screen together must not sweep in lockstep, so
 * each varies both how long it rests and when its first pass starts. Both are
 * derived from the arrival's own index rather than `Math.random`, so a render
 * and a re-render produce identical markup and hydration has nothing to
 * disagree about.
 *
 * The cycle is traversal + rest, and the traversal is a fixed 24% of it, so
 * varying the cycle varies both: 11.3s , 12.4s gives a 2.71 , 2.98s traversal
 * and 8.59 , 9.42s at rest. Widening the cycle further would push the traversal
 * past 3s, where the reveal starts to drag.
 */
function reflectionTiming(index: number): CSSProperties {
  const cycle = 11.3 + ((index * 0.47) % 1.1);
  const firstPass = 2.5 + ((index * 0.61) % 1.5);
  return {
    ['--cg-reflection-duration']: `${cycle.toFixed(2)}s`,
    ['--cg-reflection-delay']: `${firstPass.toFixed(2)}s`,
  } as CSSProperties;
}

/**
 * Keeps the decorative sweep from being scheduled while nobody can see it:
 * offscreen cards and backgrounded tabs pause, and everything is torn down on
 * unmount. It never touches hover, focus, or any user input.
 */
function useAutonomousReflection(active: boolean) {
  const ref = useRef<HTMLSpanElement>(null);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!active) return;
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;

    let onscreen = true;
    const sync = () => setRunning(onscreen && document.visibilityState !== 'hidden');
    const observer = new IntersectionObserver(
      (entries) => {
        onscreen = entries[entries.length - 1].isIntersecting;
        sync();
      },
      { rootMargin: '200px' },
    );
    observer.observe(element);
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, [active]);

  return { ref, running };
}

export function Journey({ children, labelledBy }: { children: ReactNode; labelledBy?: string }) {
  return <ol className="cg-journey" aria-labelledby={labelledBy}>{children}</ol>;
}
