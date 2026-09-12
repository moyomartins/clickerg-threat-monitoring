/**
 * The component the Replay world exists for.
 *
 * It renders the page a visitor landed on and draws what they actually did on
 * it. Every mark is backed by recorded engagement — and, just as importantly,
 * nothing is drawn that the tag did not record.
 *
 * The tag records depths and counts, not coordinates: `scrollPct`, `dwellSec`,
 * `clicks`, `mouseMoves`. So scroll depth is drawn *on* the page, because it is
 * positional data. Mouse movement and clicks are drawn *beneath* it as meters
 * and a tally, because inventing a path or a click position would make this
 * component illustrate a conclusion rather than show evidence — the one thing
 * the product may not do.
 *
 * Absence is drawn. No mouse movement and a tag that stopped reporting are both
 * explicit, labelled marks, never a blank frame.
 */

export interface ReplayBehaviour {
  /** 0–100. Positional: drawn on the page. */
  scrollPct: number;
  dwellSec: number;
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

/** A human browsing session produces a few hundred move events; cap the scale there. */
const MOVE_SCALE = 400;

export function PageReplay({ behaviour, size = 'card', caption = true, loading = false }: PageReplayProps) {
  const scrollPct = behaviour ? Math.max(0, Math.min(100, behaviour.scrollPct)) : 0;
  const movePct = behaviour ? Math.min(100, Math.round((behaviour.mouseMoves / MOVE_SCALE) * 100)) : 0;
  const clicks = behaviour ? behaviour.clicks : 0;
  const silent = behaviour !== null && behaviour.mouseMoves === 0;

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
        {!loading && behaviour !== null && (
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
              <p className="cg-replay__caption">
                <b>{scrollPct}%</b> of the page seen · {behaviour.dwellSec}s
              </p>
              <p className="cg-replay__measure">
                <span className="cg-replay__measure-label">mouse</span>
                <span className="cg-replay__bar" role="img" aria-label={`${behaviour.mouseMoves} mouse movements recorded`}>
                  <span
                    className={`cg-replay__bar-fill${silent ? ' is-silent' : ''}`}
                    style={{ width: `${movePct}%` }}
                  />
                </span>
                <span className="cg-replay__measure-value">{behaviour.mouseMoves}</span>
              </p>
              <p className="cg-replay__measure">
                <span className="cg-replay__measure-label">clicks</span>
                <span className="cg-replay__tally" role="img" aria-label={`${clicks} clicks recorded`}>
                  {Array.from({ length: Math.min(clicks, 8) }, (_, i) => (
                    <i key={i} />
                  ))}
                  {clicks > 8 && <em>+{clicks - 8}</em>}
                </span>
                <span className="cg-replay__measure-value">{clicks}</span>
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
