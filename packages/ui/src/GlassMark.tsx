import { useId } from 'react';

/**
 * The ClickGuard mark as frosted glass, drawn inline rather than loaded through
 * `url()` so its two shapes can be styled independently , an SVG referenced as
 * a CSS background is an isolated document and cannot see the page's custom
 * properties.
 *
 * Both shapes are the same white. What separates them is density alone: the
 * outer body renders 30% more opaque than the inner facet, so the facet reads
 * as recessed beneath the surface rather than sitting on top of it. That
 * relationship is expressed once, in CSS (`--cg-glass-outer-opacity` is derived
 * from `--cg-glass-inner-opacity`), so the two can never drift apart.
 *
 * Each shape carries its own filter instance. Filter ids are document-global,
 * so they are suffixed per instance , two decisive cards on screen would
 * otherwise collide on the same id.
 *
 * Decorative only: the wrapper carries `aria-hidden`, and nothing here is
 * focusable or hit-testable.
 */
export function GlassMark() {
  const uid = useId().replace(/:/g, '');
  const outer = `cg-glass-outer-${uid}`;
  const inner = `cg-glass-inner-${uid}`;

  /* Both filters share one flood opacity. The 80% relationship is applied once,
     as element opacity on each path, so it scales the specular rim and the
     body by the same factor , the highlight can never erase the distinction
     between the two shapes. */
  const glass = (
    <>
      <feTurbulence type="fractalNoise" baseFrequency=".11" numOctaves="2" seed="19" result="texture" />
      <feDisplacementMap in="SourceGraphic" in2="texture" scale=".38" xChannelSelector="R" yChannelSelector="G" result="refracted" />
      <feGaussianBlur in="refracted" stdDeviation=".16" result="softened" />
      <feGaussianBlur in="SourceAlpha" stdDeviation=".34" result="edge" />
      <feComposite in="edge" in2="SourceAlpha" operator="out" result="rim" />
      <feFlood floodColor="#ffffff" floodOpacity=".7" result="light" />
      <feComposite in="light" in2="rim" operator="in" result="highlight" />
    </>
  );

  return (
    <svg className="cg-glass-mark" viewBox="0 0 27 32" fill="none" aria-hidden="true" focusable="false">
      <defs>
        {/* The body sits on the card, so it casts the depth shadow. */}
        <filter id={outer} x="-14%" y="-14%" width="128%" height="128%" colorInterpolationFilters="sRGB">
          {glass}
          <feDropShadow dx="0" dy=".34" stdDeviation=".7" floodColor="#50545c" floodOpacity=".55" result="depth" />
          <feMerge>
            <feMergeNode in="depth" />
            <feMergeNode in="softened" />
            <feMergeNode in="highlight" />
          </feMerge>
        </filter>
        {/* The facet is recessed within the body, so it casts none , a second
            shadow here would darken the shape it is supposed to sit inside. */}
        <filter id={inner} x="-14%" y="-14%" width="128%" height="128%" colorInterpolationFilters="sRGB">
          {glass}
          <feMerge>
            <feMergeNode in="softened" />
            <feMergeNode in="highlight" />
          </feMerge>
        </filter>
      </defs>
      <path className="cg-glass-mark__outer" filter={`url(#${outer})`} fill="rgb(255 255 255)" d="M0 23.9925V3.97166C0 3.74023 0.155439 3.53766 0.378979 3.47776L13.2258 0.03546C13.3125 0.0122297 13.4038 0.0122297 13.4905 0.03546L26.3374 3.47776C26.5609 3.53766 26.7163 3.74023 26.7163 3.97166V10.2903C26.7163 10.5727 26.4874 10.8017 26.205 10.8017H23.201C22.9186 10.8017 22.6897 10.5727 22.6897 10.2903V6.91173C22.6897 6.68031 22.5343 6.47773 22.3107 6.41784L13.4905 4.05446C13.4038 4.03123 13.3125 4.03123 13.2258 4.05446L4.4056 6.41784C4.18206 6.47773 4.02662 6.68031 4.02662 6.91173V21.4998C4.02662 21.6825 4.12408 21.8513 4.28228 21.9426L13.1025 27.035C13.2607 27.1263 13.4556 27.1263 13.6138 27.035L22.434 21.9426C22.5922 21.8513 22.6897 21.6825 22.6897 21.4998V17.4488C22.6897 17.1664 22.4608 16.9375 22.1784 16.9375H13.8695C13.5871 16.9375 13.3582 16.7085 13.3582 16.4262V13.55C13.3582 13.2676 13.5871 13.0387 13.8695 13.0387H26.205C26.4874 13.0387 26.7163 13.2676 26.7163 13.55V23.9925C26.7163 24.1751 26.6189 24.3439 26.4607 24.4353L13.6138 31.8524C13.4556 31.9437 13.2607 31.9437 13.1025 31.8524L0.255659 24.4353C0.0974565 24.3439 0 24.1751 0 23.9925Z" />
      <path className="cg-glass-mark__inner" filter={`url(#${inner})`} fill="rgb(255 255 255)" d="M13.6138 20.6333L16.2435 19.1151C16.3212 19.0702 16.4094 19.0466 16.4992 19.0466H19.9414C20.2238 19.0466 20.4527 19.2755 20.4527 19.5579V20.4857C20.4527 20.6684 20.3552 20.8372 20.197 20.9285L13.6138 24.7293C13.4556 24.8207 13.2607 24.8207 13.1025 24.7293L6.5193 20.9285C6.36109 20.8372 6.26364 20.6684 6.26364 20.4857V8.57342C6.26364 8.342 6.41908 8.13943 6.64261 8.07953L13.2258 6.31556C13.3125 6.29233 13.4038 6.29233 13.4905 6.31556L20.0737 8.07953C20.2973 8.13943 20.4527 8.342 20.4527 8.57342V10.2903C20.4527 10.5727 20.2238 10.8017 19.9414 10.8017H16.4295C16.3848 10.8017 16.3403 10.7958 16.2971 10.7842L13.4905 10.0322C13.4038 10.009 13.3125 10.009 13.2258 10.0322L10.7332 10.7001C10.5096 10.76 10.3542 10.9626 10.3542 11.194V18.7514C10.3542 18.934 10.4516 19.1028 10.6098 19.1942L13.1025 20.6333C13.2607 20.7247 13.4556 20.7247 13.6138 20.6333Z" />
    </svg>
  );
}
