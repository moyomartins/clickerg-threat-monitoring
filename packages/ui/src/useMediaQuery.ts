import { useEffect, useState } from 'react';

/**
 * Matches a media query after mount.
 *
 * Starts `false` so the server render and the first client render agree, then
 * corrects itself. Use it where the two presentations differ in *markup* , a
 * compact row is not a squeezed wide row, and an accordion is not a card, so
 * neither can be reached by CSS overrides alone. Anything that is purely a
 * matter of styling belongs in a media query in the stylesheet instead.
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia(query);
    const sync = () => setMatches(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [query]);

  return matches;
}
