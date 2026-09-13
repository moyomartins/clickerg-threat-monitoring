import type { ReactNode } from 'react';

export function JourneySection({ id, count, insight, children }: { id: string; count: string; insight: string; children?: ReactNode }) {
  return (
    <section className="cg-journey-section" aria-labelledby={id}>
      <div className="cg-journey-section__head">
        <h2 id={id}>Journey replay</h2>
        <p className="cg-journey-section__count">{count}</p>
        <p className="cg-journey-section__insight">{insight}</p>
      </div>
      {children}
    </section>
  );
}
