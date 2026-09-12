/**
 * 14 — Threshold.
 * Structural idea: the page IS the confidence axis. A single scale runs the
 * full height, the blocking line at 80 is the dominant page element, and every
 * visitor is positioned by severity. Status is not a column — it is altitude.
 */
import { CASE, STATUS_LABEL, SUMMARY, VISITORS } from '../data.js';
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const label = (s) => STATUS_LABEL[s] ?? s;

export const meta = {
  id: 'd14', name: 'Threshold',
  tagline: 'Severity as the page itself — one confidence axis runs full height, the blocking line at 80 cuts the screen in two, and every visitor sits at its altitude.',
  idea: 'Status stops being a column and becomes position. The threshold is page architecture, not a number in a legend.',
};

/** Spread visitors horizontally so equal-confidence ones do not stack. */
const lane = (i, n) => 6 + (i * (88 / Math.max(1, n - 1)));

export const list = () => {
  const above = VISITORS.filter((v) => v.confidence >= 80);
  const below = VISITORS.filter((v) => v.confidence < 80);
  return `
  <header class="d14-head">
    <h1>80</h1>
    <div><p class="d14-lede">Everything above this line is on your exclusion list. Everything below it is still running. The number is the only thing that decides, so it is the only thing this screen is built around.</p>
    <div class="d14-stats">${SUMMARY.map((s) => `<span><b>${esc(s.value)}</b>${esc(s.label)}</span>`).join('')}</div></div>
  </header>
  <div class="d14-field">
    <div class="d14-axis">${[99, 80, 60, 40, 20, 0].map((n) => `<span style="--y:${100 - n}%" class="${n === 80 ? 'is-line' : ''}">${n}</span>`).join('')}</div>
    <div class="d14-plot">
      <span class="d14-line"><em>BLOCKING THRESHOLD — 80</em></span>
      <span class="d14-zone d14-zone--over"></span>
      ${above.map((v, i) => `
        <article class="d14-pin d14-pin--${v.status}" style="--y:${100 - v.confidence}%;--x:${lane(i, above.length)}%">
          <b>${esc(v.ip)}</b><span>${esc(v.city)} · ${esc(v.spend)}</span><em>${v.confidence}</em>
        </article>`).join('')}
      ${below.map((v, i) => `
        <article class="d14-pin d14-pin--${v.status}" style="--y:${100 - v.confidence}%;--x:${lane(i, below.length)}%">
          <b>${esc(v.ip)}</b><span>${esc(v.city)} · ${esc(v.spend)}</span><em>${v.confidence}</em>
        </article>`).join('')}
    </div>
  </div>
  <div class="d14-why">
    <h2>Why each one sits where it does</h2>
    ${VISITORS.map((v) => `<p class="d14-why__row"><b>${esc(v.ip)}</b><i>${v.confidence}</i><span class="d14-tag d14-tag--${v.status}">${esc(label(v.status))}</span>${esc(v.why)}</p>`).join('')}
  </div>`;
};

export const detail = () => `
  <header class="d14-head d14-head--detail">
    <h1>83</h1>
    <div>
      <p class="d14-crossed">crossed at visit 3</p>
      <p class="d14-ip">${esc(CASE.ip)} · ${esc(CASE.city)}, ${esc(CASE.country)}</p>
      <p class="d14-lede">${esc(CASE.verdict)}</p>
    </div>
  </header>
  <div class="d14-field d14-field--climb">
    <div class="d14-axis">${[99, 80, 60, 40, 20, 0].map((n) => `<span style="--y:${100 - n}%" class="${n === 80 ? 'is-line' : ''}">${n}</span>`).join('')}</div>
    <div class="d14-plot">
      <span class="d14-line"><em>BLOCKING THRESHOLD — 80</em></span>
      <span class="d14-zone d14-zone--over"></span>
      ${CASE.visits.map((v, i) => `
        <span class="d14-step ${v.decisive ? 'is-decisive' : ''}" style="--y:${100 - v.confidence}%;--x:${8 + i * 21}%">
          <i></i><b>${v.confidence}</b><em>visit ${v.n}</em>
        </span>`).join('')}
    </div>
  </div>
  <dl class="d14-facts">${CASE.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
  <div class="d14-evidence">
    ${CASE.visits.map((v) => `
      <section class="d14-ev ${v.decisive ? 'is-decisive' : ''}">
        <div class="d14-ev__n"><b>${v.confidence}</b><span>after visit ${v.n}</span></div>
        <div class="d14-ev__body">
          <p class="d14-ev__head">${esc(v.time)} · ${esc(v.tag)} · ${esc(v.cost)}<br><span>${esc(v.source)}</span></p>
          <ul class="d14-sig">${v.signals.map((s) => `<li class="sev-${s.sev}"><span>${esc(s.l)}</span><b>${esc(s.v)}</b></li>`).join('')}</ul>
          <p>${esc(v.note)}</p>
          ${v.decisive ? '<p class="d14-cross">▲ This is the visit that put it over 80.</p>' : ''}
        </div>
      </section>`).join('')}
    <p class="d14-trailing">${esc(CASE.trailing)}</p>
  </div>`;
