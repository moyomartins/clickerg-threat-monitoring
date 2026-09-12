/** 8 — Field Chart. Location leads: origins plotted on a graticule before any table. */
import { CASE, STATUS_LABEL, SUMMARY, VISITORS } from '../data.js';
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const label = (s) => STATUS_LABEL[s] ?? s;

/** Rough plot positions, percent of the chart box. Illustrative, not geodetic. */
const PLOT = {
  Lagos: [50, 62], Leeds: [47.5, 27], Toronto: [24, 33], Warsaw: [53, 26],
  Singapore: [75, 60], Amsterdam: [49, 27.5], Dublin: [45, 27], Glasgow: [46, 24],
  Unknown: [88, 82],
};
const at = (city) => PLOT[city] ?? [60, 50];

export const meta = {
  id: 'd8', name: 'Field Chart',
  tagline: 'Geography first — origins plotted on a navigation graticule, the register reading as a chart index beneath it.',
};

export const list = () => `
  <header class="d8-head"><span class="d8-kicker">CHART 01 · ORIGIN OF PAID TRAFFIC · 14 AUG 2025</span>
    <h1>Where the clicks came from</h1>
    <div class="d8-stats">${SUMMARY.map((s) => `<span><b>${esc(s.value)}</b>${esc(s.label)}</span>`).join('')}</div>
  </header>
  <div class="d8-chart">
    <div class="d8-grat">${Array.from({ length: 11 }, (_, i) => `<i style="--x:${i * 10}%"></i>`).join('')}${Array.from({ length: 7 }, (_, i) => `<u style="--y:${i * 16.6}%"></u>`).join('')}</div>
    ${VISITORS.map((v) => { const [x, y] = at(v.city); return `
      <span class="d8-pin d8-pin--${v.status}" style="--x:${x}%;--y:${y}%" title="${esc(v.ip)}">
        <i></i><b>${esc(v.city)}</b><em>${esc(v.spend)}</em>
      </span>`; }).join('')}
    <span class="d8-legend"><b>Legend</b> filled = blocked · ring = judgement call · dashed = incomplete fix</span>
  </div>
  <table class="d8-index">
    <thead><tr><th>Origin</th><th>Bearing / IP</th><th>Status</th><th>Clicks</th><th>Spend</th><th>Remark</th></tr></thead>
    <tbody>${VISITORS.map((v) => `<tr>
      <td class="d8-place"><b>${esc(v.city)}</b><span>${esc(v.country)}</span></td>
      <td class="d8-ip">${esc(v.ip)}</td>
      <td><span class="d8-st d8-st--${v.status}">${esc(label(v.status))}</span></td>
      <td class="d8-n">${v.visits} / ${v.paid} pd</td>
      <td class="d8-n">${esc(v.spend)}</td>
      <td class="d8-rem">${esc(v.why)}</td></tr>`).join('')}</tbody>
  </table>`;

export const detail = () => `
  <header class="d8-head"><span class="d8-kicker">CHART 02 · SINGLE ORIGIN · ${esc(CASE.ip)}</span><h1>${esc(CASE.city)}, ${esc(CASE.country)}</h1></header>
  <div class="d8-split">
    <div class="d8-chart d8-chart--small">
      <div class="d8-grat">${Array.from({ length: 9 }, (_, i) => `<i style="--x:${i * 12.5}%"></i>`).join('')}${Array.from({ length: 5 }, (_, i) => `<u style="--y:${i * 25}%"></u>`).join('')}</div>
      <span class="d8-pin d8-pin--blocked d8-pin--big" style="--x:50%;--y:55%"><i></i><b>${esc(CASE.ip)}</b><em>29 clicks · £158.38</em></span>
      <span class="d8-legend">Single datacenter origin · all 29 arrivals within one bearing</span>
    </div>
    <div class="d8-brief">
      <span class="d8-st d8-st--blocked">${esc(label(CASE.status))}</span>
      <p class="d8-verdict">${esc(CASE.verdict)}</p>
      <dl class="d8-facts">${CASE.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    </div>
  </div>
  <div class="d8-log">
    <span class="d8-kicker">ARRIVAL LOG</span>
    ${CASE.visits.map((v) => `
      <section class="d8-fix ${v.decisive ? 'is-fixed' : ''}">
        <div class="d8-fix__head"><b>FIX ${String(v.n).padStart(2, '0')}</b><span>${esc(v.time)}</span><span>${esc(v.tag)} · ${esc(v.cost)}</span><em>${v.confidence}%</em></div>
        <p class="d8-fix__src">${esc(v.source)}</p>
        <ul class="d8-sig">${v.signals.map((s) => `<li class="sev-${s.sev}"><span>${esc(s.l)}</span><b>${esc(s.v)}</b></li>`).join('')}</ul>
        <p>${esc(v.note)}</p>
        ${v.decisive ? '<div class="d8-mark">POSITION FIXED — ADDED TO EXCLUSION LIST</div>' : ''}
      </section>`).join('')}
    <p class="d8-trailing">${esc(CASE.trailing)}</p>
  </div>`;
