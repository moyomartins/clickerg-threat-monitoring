/**
 * 15 — Cartogram.
 * Structural idea: there is no row. Area is the encoding — every visitor is a
 * rectangle sized by the money it took, so the screen answers "where did the
 * budget go" before it answers anything else. Drill-down subdivides the block.
 */
import { CASE, STATUS_LABEL, SUMMARY, VISITORS } from '../data.js';
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const label = (s) => STATUS_LABEL[s] ?? s;
const num = (s) => Number(String(s).replace(/[£,]/g, ''));

export const meta = {
  id: 'd15', name: 'Cartogram',
  tagline: 'Area is the argument — every visitor is a block sized by the spend it consumed, so the screen shows where the budget went before it says anything about status.',
  idea: 'Removes the row entirely. Size encodes money, so the worst offenders are physically the biggest thing on screen and cannot be scrolled past.',
};

/** Greedy row packing — proportional widths, row height proportional to its share. */
function pack(items, perRow = [3, 3, 4]) {
  const rows = []; let i = 0;
  for (const n of perRow) { rows.push(items.slice(i, i + n)); i += n; }
  if (i < items.length) rows.push(items.slice(i));
  return rows.filter((r) => r.length);
}

export const list = () => {
  const sorted = [...VISITORS].sort((a, b) => num(b.spend) - num(a.spend));
  const total = sorted.reduce((s, v) => s + num(v.spend), 0);
  const rows = pack(sorted);
  return `
  <header class="d15-head">
    <div class="d15-total"><span>Spend consumed by the visitors below</span><b>£${total.toFixed(2)}</b></div>
    <p class="d15-lede">Every block is one visitor, sized by what it cost you. The biggest blocks are the biggest problems — you do not have to go looking for them.</p>
    <div class="d15-stats">${SUMMARY.map((s) => `<span><b>${esc(s.value)}</b>${esc(s.label)}</span>`).join('')}</div>
  </header>
  <div class="d15-map">
    ${rows.map((row) => {
      const rowTotal = row.reduce((s, v) => s + num(v.spend), 0);
      const h = Math.max(112, Math.round((rowTotal / total) * 560));
      return `<div class="d15-row" style="--h:${h}px">
        ${row.map((v) => `
          <article class="d15-cell d15-cell--${v.status}" style="--f:${num(v.spend)}">
            <div class="d15-cell__in">
              <b class="d15-amt">${esc(v.spend)}</b>
              <span class="d15-ip">${esc(v.ip)}</span>
              <span class="d15-loc">${esc(v.city)}, ${esc(v.country)}</span>
              <span class="d15-tag">${esc(label(v.status))}</span>
              <p>${esc(v.why)}</p>
              <span class="d15-sub">${v.visits} visits · ${v.paid} paid · confidence ${v.confidence}%</span>
            </div>
          </article>`).join('')}
      </div>`;
    }).join('')}
  </div>`;
};

export const detail = () => {
  const total = CASE.visits.reduce((s, v) => s + num(v.cost), 0);
  return `
  <header class="d15-head">
    <div class="d15-total d15-total--big"><span>${esc(CASE.ip)} took</span><b>£158.38</b></div>
    <p class="d15-lede">${esc(CASE.verdict)}</p>
    <dl class="d15-facts">${CASE.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
  </header>
  <p class="d15-caption">The block, subdivided — one panel per arrival, sized by what that click cost. Shown: the first five of 29.</p>
  <div class="d15-map d15-map--detail">
    <div class="d15-row" style="--h:330px">
      ${CASE.visits.map((v) => `
        <article class="d15-cell d15-cell--visit ${v.decisive ? 'is-decisive' : ''}" style="--f:${num(v.cost)}">
          <div class="d15-cell__in">
            <b class="d15-amt">${esc(v.cost)}</b>
            <span class="d15-ip">visit ${v.n} · ${esc(v.time)}</span>
            ${v.decisive ? '<span class="d15-tag d15-tag--block">blocked here</span>' : ''}
            <ul class="d15-sig">${v.signals.slice(0, 5).map((s) => `<li class="sev-${s.sev}"><span>${esc(s.l)}</span><b>${esc(s.v)}</b></li>`).join('')}</ul>
            <span class="d15-sub">confidence ${v.confidence}%</span>
          </div>
        </article>`).join('')}
    </div>
  </div>
  <div class="d15-notes">
    ${CASE.visits.map((v) => `<div class="d15-note ${v.decisive ? 'is-decisive' : ''}"><b>${esc(v.cost)} — visit ${v.n}</b><p>${esc(v.note)}</p></div>`).join('')}
    <p class="d15-trailing">${esc(CASE.trailing)} Running total across the five shown: £${total.toFixed(2)}.</p>
  </div>`;
};
