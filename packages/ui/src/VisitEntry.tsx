import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { ArrivalDisclosure } from './ArrivalDisclosure';
import { GlassMark } from './GlassMark';
import { SignalChip, type SignalChipProps } from './SignalChip';
import { PageReplay, type ReplayBehaviour } from './PageReplay';
import { useMediaQuery } from './useMediaQuery';

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

/**
 * The journey is one list of arrivals rendered two ways. Below the stacked
 * breakpoint , or on a touch device that cannot hover , each arrival becomes a
 * tap-controlled disclosure instead of a card in a row, because a row of cards
 * at phone width can only be delivered by shrinking them past legibility or by
 * scrolling sideways, and neither is an acceptable way to read evidence.
 *
 * The accordion state lives on `Journey` rather than on each arrival so that
 * opening one closes the last, and so the page that maps visitor data into
 * `VisitEntry` never has to know which presentation is in play.
 */
interface JourneyDisclosure {
  stacked: boolean;
  expanded: number | null;
  toggle: (index: number) => void;
  idFor: (index: number) => { item: string; panel: string; trigger: string };
}

const JourneyContext = createContext<JourneyDisclosure | null>(null);

/* Phone widths always stack. So does any pointer that cannot hover, up to the
   desktop grid's own breakpoint: a coarse pointer has no way to reach a
   hover-revealed disclosure, so it needs the explicit control regardless of
   how wide the device reports itself to be. */
const STACKED_QUERY = '(max-width: 599.98px), ((hover: none) and (pointer: coarse) and (max-width: 899.98px))';

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
  const journey = useContext(JourneyContext);
  const stacked = journey?.stacked ?? false;
  const ids = journey?.idFor(index);
  const open = stacked && journey?.expanded === index;

  const frozen = reflectionPhase !== undefined && reflectionPhase !== 'autonomous';
  /* Stacked: the sweep is scheduled only while this arrival is actually open.
     A collapsed panel is `hidden`, so its card would otherwise animate where
     nobody can see it. Expanding does not *trigger* the sweep , it lets the
     autonomous schedule resume, which is why nothing here reads a tap. */
  const reflection = useAutonomousReflection(decisive && !frozen && (!stacked || open));
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

  if (stacked && ids) {
    const longValue = (value?: string) => (value ?? '').length > 22;
    return (
      <li
        id={ids.item}
        className={`cg-visit-m${decisive ? ' cg-visit-m--decisive' : ''}`}
        style={reflectionStyle}
      >
        <h3 className="cg-visit-m__heading">
          <button
            type="button"
            id={ids.trigger}
            className="cg-visit-m__trigger cg-focusable"
            aria-expanded={open}
            aria-controls={ids.panel}
            onClick={() => journey?.toggle(index)}
          >
            <span className="cg-visit-m__summary">
              <span className="cg-visit-m__line">
                <span className="cg-visit-m__no">visit {index}</span>
                <span className="cg-visit-m__conf">{confidence}%</span>
              </span>
              <span className="cg-visit-m__line">
                <span className="cg-visit-m__tag">
                  {CHANNEL_LABELS[channel]}
                  {cost ? ` · ${cost}` : ''}
                </span>
                {timestampIso ? (
                  <time className="cg-visit-m__time" dateTime={timestampIso} aria-label={timestampLabel}>
                    {timestamp}
                  </time>
                ) : (
                  <span className="cg-visit-m__time">{timestamp}</span>
                )}
              </span>
              {source && <span className="cg-visit-m__source">{source}</span>}
              {decisive && <span className="cg-visit-m__flag">decisive arrival</span>}
            </span>
            <svg className="cg-visit-m__chevron" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            </svg>
          </button>
        </h3>

        <div
          id={ids.panel}
          className={`cg-visit-m__panel${decisive ? phaseClass : ''}`}
          role="region"
          aria-labelledby={ids.trigger}
          hidden={!open}
        >
          {decisive && (
            <span ref={reflection.ref} className="cg-visit__reflection-logo" aria-hidden="true">
              <GlassMark />
            </span>
          )}
          {replay !== undefined && (
            <div className="cg-visit-m__replay">
              <PageReplay behaviour={replay} size="card" />
            </div>
          )}

          {source && (
            <SignalChip label="Source" value={source} severity="neutral" className="cg-visit-m__signal cg-visit-m__signal--long" />
          )}

          {signals.map((s) => (
            <SignalChip
              key={s.label}
              {...s}
              className={`cg-visit-m__signal${longValue(s.value) ? ' cg-visit-m__signal--long' : ''}`}
            />
          ))}

          {explanation && (
            <div className="cg-visit-m__why">
              <p className="cg-visit-m__why-title">{explanation.title}</p>
              {explanation.content}
            </div>
          )}

          {verdict && <div className="cg-visit__verdict cg-visit-m__verdict">{verdict}</div>}
        </div>
      </li>
    );
  }

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

export function Journey({
  children,
  labelledBy,
  decisiveArrival,
}: {
  children: ReactNode;
  labelledBy?: string;
  /** 1-based visit number of the decisive arrival, when the journey has one. */
  decisiveArrival?: number;
}) {
  const stacked = useMediaQuery(STACKED_QUERY);
  const base = useId().replace(/:/g, '');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [touched, setTouched] = useState(false);

  /* A blocked journey opens at the arrival where blocking happened, so the
     answer is on screen without hunting for it. Only until the reader makes a
     choice of their own , after that their choice stands, including a
     deliberate collapse. */
  useEffect(() => {
    if (stacked && !touched && decisiveArrival !== undefined) setExpanded(decisiveArrival);
  }, [stacked, touched, decisiveArrival]);

  const idFor = (index: number) => ({
    item: `${base}-arrival-${index}`,
    panel: `${base}-arrival-${index}-panel`,
    trigger: `${base}-arrival-${index}-trigger`,
  });

  const toggle = (index: number) => {
    setTouched(true);
    setExpanded((current) => (current === index ? null : index));
  };

  /* The only programmatic scroll in the section. Expanding and collapsing
     never move the page, so the reader keeps their place. */
  const jump = () => {
    if (decisiveArrival === undefined) return;
    setTouched(true);
    setExpanded(decisiveArrival);
    document
      .getElementById(idFor(decisiveArrival).item)
      ?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  return (
    <JourneyContext.Provider value={{ stacked, expanded, toggle, idFor }}>
      {stacked && decisiveArrival !== undefined && (
        <button type="button" className="cg-journey__jump cg-focusable" onClick={jump}>
          Jump to blocked arrival
        </button>
      )}
      <ol className={`cg-journey${stacked ? ' cg-journey--stacked' : ''}`} aria-labelledby={labelledBy}>
        {children}
      </ol>
    </JourneyContext.Provider>
  );
}
