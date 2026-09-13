/**
 * The component the Replay world exists for.
 *
 * It renders the page a visitor landed on and draws what they actually did on
 * it. Every mark is backed by recorded engagement — and, just as importantly,
 * nothing is drawn that the tag did not record.
 *
 * The tag records depths and counts, not coordinates: `scrollPct`, `dwellSec`,
 * `clicks`, `mouseMoves`. So scroll depth is drawn *on* the page, because it is
 * positional data. The compact readout beneath it states only page depth and
 * dwell time; mouse movement and click counts remain available to scoring and
 * explanations without repeating that evidence in every card.
 *
 * Absence is drawn. No mouse movement and a tag that stopped reporting are both
 * explicit, labelled marks, never a blank frame.
 */

export interface ReplayBehaviour {
  /** 0–100. Positional: drawn on the page. */
  scrollPct: number | null;
  dwellSec: number | null;
  /** Counts only — no coordinates are recorded, so none are drawn. */
  clicks: number;
  mouseMoves: number;
}

export interface PageReplayProps {
  /** `null` means the tag never reported for this visit. */
  behaviour: ReplayBehaviour | null;
  size?: 'card' | 'hero' | 'strip';
  /** Hides the measured read-out beneath the page. */
  caption?: boolean;
  loading?: boolean;
}

function dwellLabel(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return minutes ? `${minutes}m ${remainder}s` : `${remainder}s`;
}

function replayReadout(scrollPct: number | null, dwellSec: number | null) {
  const depth = scrollPct === null ? 'Page depth not captured' : `${scrollPct}% of the page seen`;
  const dwell = dwellSec === null ? 'Time not captured' : dwellLabel(dwellSec);
  const accessibleDepth = scrollPct === null ? depth : `${scrollPct} percent of the page seen`;
  const accessibleDwell = dwellSec === null ? dwell : `in ${dwellLabel(dwellSec)}`;
  return { display: `${depth} · ${dwell}`, accessible: `${accessibleDepth} ${accessibleDwell}` };
}

export function PageReplay({ behaviour, size = 'card', caption = true, loading = false }: PageReplayProps) {
  const scrollPct = behaviour?.scrollPct == null ? null : Math.max(0, Math.min(100, behaviour.scrollPct));
  const dwellSec = behaviour?.dwellSec ?? null;
  const silent = behaviour !== null && behaviour.mouseMoves === 0;
  const readout = replayReadout(scrollPct, dwellSec);

  return (
    <div className={`cg-replay cg-replay--${size}`}>
      <div className="cg-replay__page">
        {/* The page itself — structure is known before behaviour is. */}
        <span className="cg-wf cg-wf--nav" />
        <span className="cg-wf cg-wf--hero" />
        <span className="cg-wf cg-wf--cta" />
        <span className="cg-wf cg-wf--bar" style={{ top: '46%' }} />
        <span className="cg-wf cg-wf--bar" style={{ top: '56%', width: '70%' }} />
        <span className="cg-wf cg-wf--bar" style={{ top: '70%' }} />
        <span className="cg-wf cg-wf--bar" style={{ top: '80%', width: '52%' }} />

        {/* Scroll depth is the one positional thing the tag records. */}
        {!loading && behaviour !== null && scrollPct !== null && (
          <span className="cg-replay__seen" style={{ height: `${scrollPct}%` }} />
        )}

        {!loading && behaviour === null && (
          <span className="cg-replay__mark cg-replay__mark--void">tag stopped reporting</span>
        )}
        {!loading && silent && (
          <span className="cg-replay__mark cg-replay__mark--none">no mouse movement recorded</span>
        )}
      </div>

      {caption && (
        <div className="cg-replay__read">
          {loading ? (
            <span className="cg-skel" style={{ width: '12ch' }} />
          ) : behaviour === null ? (
            <p className="cg-replay__caption">not recorded</p>
          ) : (
            <>
              <p className="cg-replay__caption" aria-label={readout.accessible}>{readout.display}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
