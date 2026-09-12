/** 10 — Operations Wall. Maximalist: every surface visible at once, alert-forward. */
import { CASE, STATUS_LABEL, SUMMARY, VISITORS } from '../data.js';
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const label = (s) => STATUS_LABEL[s] ?? s;

export const meta = {
  id: 'd10', name: 'Operations Wall',
  tagline: 'Maximalist wall board — tiles, spark bars, a live arrival feed and the register all on screen at once, alert-forward in lime and red.',
};

const spark = (n, seed) => Array.from({ length: n }, (_, i) => `<i style="--h:${20 + ((i * 37 + seed) % 80)}%"></i>`).join('');

export const list = () => `
  <div class="d10-grid">
    <header class="d10-top">
      <b>CLICKERG // THREAT OPS</b><span class="d10-live">● LIVE</span>
      <span class="d10-clock">14 AUG 2025 · 22:41 UTC</span>
    </header>
    ${SUMMARY.map((s, i) => `<div class="d10-tile ${i === 1 ? 'is-alert' : ''}"><span>${esc(s.label)}</span><b>${esc(s.value)}</b><div class="d10-spark">${spark(16, i * 11)}</div></div>`).join('')}
    <section class="d10-panel d10-panel--feed">
      <h2>Arrival feed</h2>
      <ul>${VISITORS.slice(0, 7).map((v) => `<li class="d10-f d10-f--${v.status}"><em>${esc(v.seen)}</em><b>${esc(v.ip)}</b><span>${esc(v.city)}</span><i>${esc(label(v.status))}</i></li>`).join('')}</ul>
    </section>
    <section class="d10-panel d10-panel--dist">
      <h2>Confidence distribution</h2>
      <div class="d10-bars">${VISITORS.map((v) => `<span class="d10-bar d10-bar--${v.status}" style="--h:${v.confidence}%" title="${esc(v.ip)}"></span>`).join('')}</div>
      <p class="d10-axis"><span>0</span><span>threshold 80</span><span>99</span></p>
    </section>
    <section class="d10-panel d10-panel--table">
      <h2>Register — 53 visitors</h2>
      <table class="d10-table">
        <thead><tr><th>Status</th><th>IP</th><th>Origin</th><th>Clicks</th><th>Spend</th><th>Conf</th><th>Why</th></tr></thead>
        <tbody>${VISITORS.map((v) => `<tr>
          <td><span class="d10-st d10-st--${v.status}">${esc(label(v.status))}</span></td>
          <td class="d10-ip">${esc(v.ip)}</td><td>${esc(v.city)}</td>
          <td class="d10-n">${v.visits}/${v.paid}</td><td class="d10-n">${esc(v.spend)}</td>
          <td class="d10-n d10-conf" data-hot="${v.confidence >= 80}">${v.confidence}</td>
          <td class="d10-why">${esc(v.why)}</td></tr>`).join('')}</tbody>
      </table>
    </section>
  </div>`;

export const detail = () => `
  <div class="d10-grid d10-grid--detail">
    <header class="d10-top"><b>CLICKERG // INSPECTOR</b><span class="d10-live is-red">● BLOCKED</span><span class="d10-clock">${esc(CASE.ip)}</span></header>
    <section class="d10-panel d10-panel--hero">
      <h2>Determination</h2>
      <p class="d10-verdict">${esc(CASE.verdict)}</p>
      <dl class="d10-facts">${CASE.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    </section>
    <section class="d10-panel d10-panel--climb">
      <h2>Confidence climb</h2>
      <div class="d10-bars">${CASE.visits.map((v) => `<span class="d10-bar ${v.decisive ? 'd10-bar--blocked' : ''}" style="--h:${v.confidence}%"></span>`).join('')}</div>
      <p class="d10-axis"><span>visit 1</span><span>blocked at 3</span><span>visit 5</span></p>
    </section>
    <section class="d10-panel d10-panel--log">
      <h2>Per-visit evidence</h2>
      ${CASE.visits.map((v) => `
        <article class="d10-entry ${v.decisive ? 'is-decisive' : ''}">
          <div class="d10-entry__head"><b>${String(v.n).padStart(2, '0')}</b><span>${esc(v.time)}</span><span>${esc(v.tag)} ${esc(v.cost)}</span><em data-hot="${v.confidence >= 80}">${v.confidence}%</em>${v.decisive ? '<mark>BLOCK</mark>' : ''}</div>
          <p class="d10-src">${esc(v.source)}</p>
          <ul class="d10-sig">${v.signals.map((s) => `<li class="sev-${s.sev}"><span>${esc(s.l)}</span><b>${esc(s.v)}</b></li>`).join('')}</ul>
          <p>${esc(v.note)}</p>
        </article>`).join('')}
      <p class="d10-trailing">${esc(CASE.trailing)}</p>
    </section>
  </div>`;
