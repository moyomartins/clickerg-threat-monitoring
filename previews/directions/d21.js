/**
 * 21 — Approach Control. Traffic in motion being cleared or refused. A polar
 * scope with range rings, plus a strip bay of paper flight strips — the real
 * ATC artefact — standing in for the list.
 */
import { CASE, STATUS_LABEL, SUMMARY, VISITORS } from '../data.js';
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const label = (s) => (STATUS_LABEL[s] ?? s).toUpperCase();
export const meta = { id: 'd21', name: 'Approach Control', tagline: 'A radar scope with range rings and a bay of paper strips — traffic inbound, each track cleared or refused, the strip pulled when it is.', idea: 'Treats visitors as live inbound traffic rather than records. The list is a strip bay; the plot is the room.' };

const seed = (ip) => ip.split('.').reduce((a, b) => a + Number(b), 0);

export const list = () => `
  <header class="d21-head"><span class="d21-kick">APP CONTROL · SECTOR 1 · SQUAWK ACTIVE</span>
    <h1>INBOUND 53 · REFUSED 13</h1>
    <div class="d21-stats">${SUMMARY.map((s) => `<span><b>${esc(s.value)}</b>${esc(s.label)}</span>`).join('')}</div></header>
  <div class="d21-room">
    <div class="d21-scope">
      ${[1, 2, 3, 4].map((r) => `<span class="d21-ring" style="--r:${r * 25}%"></span>`).join('')}
      <span class="d21-cross d21-cross--h"></span><span class="d21-cross d21-cross--v"></span>
      <span class="d21-sweep"></span>
      ${VISITORS.map((v, i) => {
        const a = (seed(v.ip) * 37 + i * 29) % 360;
        const d = 12 + (100 - v.confidence) * 0.34;
        return `<span class="d21-track d21-track--${v.status}" style="--a:${a}deg;--d:${d}%">
          <i></i><b>${esc(v.ip)}</b><em>FL${String(v.confidence).padStart(3, '0')}</em></span>`;
      }).join('')}
      <span class="d21-legend">range = distance from the threshold · FL = confidence</span>
    </div>
    <div class="d21-bay">
      <p class="d21-bayhead">STRIP BAY</p>
      ${VISITORS.map((v) => `
        <div class="d21-strip d21-strip--${v.status}">
          <div class="d21-strip__l"><b>${esc(v.ip)}</b><span>${esc(v.city).toUpperCase()}</span></div>
          <div class="d21-strip__m"><span>${v.visits}/${v.paid}</span><span>${esc(v.spend)}</span></div>
          <div class="d21-strip__r"><b>${label(v.status)}</b><span>FL${String(v.confidence).padStart(3, '0')}</span></div>
          <p class="d21-strip__why">${esc(v.why)}</p>
        </div>`).join('')}
    </div>
  </div>`;

export const detail = () => `
  <header class="d21-head"><span class="d21-kick">TRACK FILE · ${esc(CASE.ip)}</span><h1>REFUSED · FL099</h1></header>
  <div class="d21-room d21-room--detail">
    <div class="d21-scope d21-scope--solo">
      ${[1, 2, 3, 4].map((r) => `<span class="d21-ring" style="--r:${r * 25}%"></span>`).join('')}
      <span class="d21-cross d21-cross--h"></span><span class="d21-cross d21-cross--v"></span>
      ${CASE.visits.map((v, i) => `<span class="d21-track d21-track--blocked ${v.decisive ? 'is-decisive' : ''}" style="--a:${40 + i * 16}deg;--d:${46 - i * 9}%"><i></i><b>${v.n}</b><em>FL${String(v.confidence).padStart(3, '0')}</em></span>`).join('')}
      <span class="d21-legend">the track closing on the threshold across five arrivals</span>
    </div>
    <div class="d21-bay">
      <p class="d21-bayhead">CLEARANCE</p>
      <p class="d21-verdict">${esc(CASE.verdict)}</p>
      <dl class="d21-facts">${CASE.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    </div>
  </div>
  <div class="d21-log">
    ${CASE.visits.map((v) => `
      <section class="d21-ev ${v.decisive ? 'is-decisive' : ''}">
        <div class="d21-ev__h"><b>ARR ${String(v.n).padStart(2, '0')}</b><span>${esc(v.time)}</span><span>${esc(v.tag).toUpperCase()} ${esc(v.cost)}</span><em>FL${String(v.confidence).padStart(3, '0')}</em></div>
        <ul class="d21-sig">${v.signals.map((s) => `<li class="sev-${s.sev}"><span>${esc(s.l).toUpperCase()}</span><b>${esc(s.v)}</b></li>`).join('')}</ul>
        <p>${esc(v.note)}</p>
        ${v.decisive ? '<p class="d21-ref">▸ CLEARANCE WITHDRAWN — STRIP PULLED</p>' : ''}
      </section>`).join('')}
    <p class="d21-trailing">${esc(CASE.trailing)}</p>
  </div>`;
