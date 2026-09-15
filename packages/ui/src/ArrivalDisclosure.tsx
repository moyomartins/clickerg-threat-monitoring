/**
 * A card that reveals more about itself on hover, focus, or tap , without
 * growing, without reflowing its neighbours, and without being clipped by an
 * ancestor that scrolls (the horizontally-scrolling journey strip).
 *
 * The mechanics use the native Popover API: the disclosure is promoted to the
 * top layer when shown, which is what lets it escape the strip's
 * `overflow-x: auto` for free , no manual portal, no manual overflow
 * workaround. Positioning still has to be computed by hand, because a plain
 * popover has no opinion about where it sits relative to its trigger.
 *
 * Dismissal (outside click, Escape) is native to `popover="auto"`. The
 * popover content is intentionally non-interactive , no focusable element
 * inside it , so focus never leaves the trigger card, and closing it never
 * needs to restore focus anywhere: it never went anywhere.
 */

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode , type CSSProperties } from 'react';

export interface ArrivalDisclosureProps {
  /** Names the popover region and doubles as its visible heading. Responds
   *  to the arrival's own state , e.g. "Why confidence increased". */
  label: string;
  /** The popover's body: prose plus whatever structured facts apply. */
  content: ReactNode;
  /** Accessible name for the complete card trigger. */
  triggerLabel: string;
  /** Passed to the `<li>` this component owns , status/reflection modifiers. */
  className?: string;
  /** Applied to the same element as `className` , e.g. the decisive card's
   *  own reflection delay, so two cards never sweep in lockstep. */
  style?: CSSProperties;
  /** The card's own visible content. */
  children: ReactNode;
}

const CLOSE_DELAY_MS = 150;

/* Hover-to-reveal is a pointer affordance, not a universal one. A touch screen
   still dispatches compatibility mouse events after a tap, which is how a
   hover-opened panel gets stuck open on iOS and Android with no way to dismiss
   it by "moving away". Devices that cannot truly hover therefore get the tap
   and keyboard paths only , the desktop behaviour itself is unchanged. */
const canHover = () =>
  typeof window === 'undefined' ||
  !window.matchMedia ||
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const GAP = 8;

export function ArrivalDisclosure({
  label,
  content,
  triggerLabel,
  className = '',
  style: cardStyle,
  children,
}: ArrivalDisclosureProps) {
  const reactId = useId();
  const popoverId = `arrival-pop-${reactId}`;
  const titleId = `${popoverId}-title`;

  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<'below' | 'above'>('below');
  const [style, setStyle] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const position = () => {
    const btn = triggerRef.current;
    const pop = popoverRef.current;
    if (!btn || !pop) return;

    const trigger = btn.getBoundingClientRect();
    const popH = pop.offsetHeight;
    const popW = pop.offsetWidth;

    const spaceBelow = window.innerHeight - trigger.bottom;
    const below = spaceBelow >= popH + GAP || spaceBelow >= trigger.top;
    setPlacement(below ? 'below' : 'above');

    const top = below ? trigger.bottom + GAP : trigger.top - popH - GAP;
    let left = trigger.left;
    left = Math.min(left, window.innerWidth - popW - GAP);
    left = Math.max(left, GAP);

    setStyle({ top: Math.round(top), left: Math.round(left) });
  };

  const show = () => {
    clearTimeout(closeTimer.current);
    const pop = popoverRef.current;
    if (!pop || pop.matches(':popover-open')) return;
    pop.showPopover();
    // Position after the popover has a box to measure, and again once painted
    // so a size that depends on content (e.g. wrapped text) is accounted for.
    position();
    requestAnimationFrame(position);
  };

  const scheduleHide = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => popoverRef.current?.hidePopover(), CLOSE_DELAY_MS);
  };

  const cancelHide = () => clearTimeout(closeTimer.current);

  /* Native light-dismiss (Escape, outside click) bypasses `show`/`scheduleHide`,
     so `open` , and the trigger's `aria-expanded` , is synced from the
     popover's own toggle event rather than from our call sites. */
  useEffect(() => {
    const pop = popoverRef.current;
    if (!pop) return;
    const onToggle = (e: Event) => {
      const isOpen = (e as ToggleEvent).newState === 'open';
      setOpen(isOpen);
      if (isOpen) position();
    };
    pop.addEventListener('toggle', onToggle);
    return () => pop.removeEventListener('toggle', onToggle);
  }, []);

  /* Reposition while scrolling, and close if the trigger has scrolled out of
     view entirely rather than leave the popover floating over content it no
     longer names. The journey strip scrolls internally , its `scroll` event
     does not bubble and, empirically, is not observed by a `window`-level
     capture listener either, so the listener has to go on the strip itself
     (and on every other scrollable ancestor between the trigger and the
     document) rather than assuming window-capture sees everything. */
  useEffect(() => {
    if (!open) return;
    const btn = triggerRef.current;
    if (!btn) return;

    const onScrollOrResize = () => {
      const r = btn.getBoundingClientRect();
      const offscreen = r.bottom < 0 || r.top > window.innerHeight || r.right < 0 || r.left > window.innerWidth;
      if (offscreen) popoverRef.current?.hidePopover();
      else position();
    };

    const scrollParents: (Element | Window)[] = [window];
    for (let node = btn.parentElement; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (/(auto|scroll)/.test(style.overflowX + style.overflowY)) scrollParents.push(node);
    }

    scrollParents.forEach((el) => el.addEventListener('scroll', onScrollOrResize, { passive: true }));
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      scrollParents.forEach((el) => el.removeEventListener('scroll', onScrollOrResize));
      window.removeEventListener('resize', onScrollOrResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* `popover="auto"` already closes on Escape for a real, trusted keypress ,
     but that native path only honours trusted events, so anything driving
     the keyboard programmatically (tests, some assistive tooling) needs this
     explicit handler to get the same guarantee. */
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && popoverRef.current?.matches(':popover-open')) {
      popoverRef.current.hidePopover();
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      show();
    }
  };

  return (
    <li>
      <div
        ref={triggerRef}
        className={className}
        style={cardStyle}
        role="button"
        tabIndex={0}
        aria-label={triggerLabel}
        aria-description="Press Enter or Space for additional arrival details."
        aria-expanded={open}
        aria-describedby={popoverId}
        onClick={show}
        onMouseEnter={() => canHover() && show()}
        onMouseLeave={() => canHover() && scheduleHide()}
        onFocus={show}
        onBlur={scheduleHide}
        onKeyDown={onKeyDown}
      >
        {children}
      </div>

      <div
        id={popoverId}
        ref={popoverRef}
        popover="auto"
        role="region"
        aria-labelledby={titleId}
        className={`cg-arrival-pop cg-arrival-pop--${placement}`}
        style={{ top: style.top, left: style.left }}
        onMouseEnter={() => canHover() && cancelHide()}
        onMouseLeave={() => canHover() && scheduleHide()}
      >
        <p className="cg-arrival-pop__title" id={titleId}>
          {label}
        </p>
        {content}
      </div>
    </li>
  );
}
