/**
 * 25 — Punch Card. Cyclical rather than sequential time: a 7×24 day-by-hour
 * grid per visitor. A person scatters across waking hours; a script punches a
 * vertical stripe at 3am. The rhythm is the evidence.
 */
import { CASE, STATUS_LABEL, SUMMARY, VISITORS } from '../data.js';
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const label = (s) => STATUS_LABEL[s] ?? s;
export const meta = { id: 'd25', name: 'Punch Card', tagline: 'Time folded into a 7×24 grid — a person scatters across waking hours, a script punches the same column every night. The rhythm is the evidence.', idea: 'Cyclical time instead of a sequence: the shape of when, not the order of what.' };

const seed = (ip) => ip.split('.').reduce((a, b) => a + Number(b), 0);
const cells = (v, cols = 24, rows = 7) => {
  const s = seed(v.ip); const out = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    let on = false;
    if (v.status === 'incomplete') on = false;
    else if (v.confidence >= 80) on = (c === (s % 4) + 2 || c === (s % 4) + 3) && r < Math.min(rows, Math.ceil(v.visits / 3));
    else on = ((s * (r + 2) + c * 7) % 23) < 3 && c > 7 && c < 22;
    if (on) out.push({ r, c });
  }
  return out;
};

const card = (v, cls = '') => `
  <div class="d25-card ${cls}">
    <div class="d25-grid" style="--cols:24;--rows:7">
      ${Array.from({ length: 24 * 7 }, () => '<i></i>').join('')}
      ${cells(v).map(({ r, c }) => `<span class="d25-punch" style="--c:${c};--r:${r}"></span>`).join('')}
      ${v.status === 'incomplete' ? '<span class="d25-none">nothing recorded</span>' : ''}
    </div>
    <div class="d25-axis"><span>00</span><span>06</span><span>12</span><span>18</span><span>23</span></div>
  </div>`;

export const list = () => `
  <header class="d25-head"><h1>When they came</h1>
    <p>Each card is one visitor: twenty-four columns for the hour, seven rows for the day. Real people smear across the afternoon. A column punched at the same hour every night is a schedule, not a customer.</p>
    <div class="d25-stats">${SUMMARY.map((s) => `<span><b>${esc(s.value)}</b>${esc(s.label)}</span>`).join('')}</div></header>
  <div class="d25-deck">
    ${VISITORS.map((v) => `
      <article class="d25-item d25-item--${v.status}">
        ${card(v)}
        <b class="d25-ip">${esc(v.ip)}</b>
        <span class="d25-loc">${esc(v.city)} · ${v.visits} visits · ${esc(v.spend)}</span>
        <span class="d25-st">${esc(label(v.status))}</span>
        <p>${esc(v.why)}</p>
      </article>`).join('')}
  </div>`;

export const detail = () => `
  <header class="d25-head d25-head--detail"><h1>${esc(CASE.ip)}</h1><p>${esc(CASE.city)}, ${esc(CASE.country)} · <span class="d25-st">${esc(label(CASE.status))}</span></p></header>
  <div class="d25-hero">
    ${card({ ...CASE, confidence: 99, visits: 29 }, 'd25-card--big')}
    <div><p class="d25-verdict">${esc(CASE.verdict)}</p>
      <p class="d25-read">Read the card: two columns, punched every night, across every day of the journey. Nine of the twenty-nine arrivals fell inside the same two-hour window.</p>
      <dl class="d25-facts">${CASE.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div>
  </div>
  <div class="d25-log">${CASE.visits.map((v) => `
    <section class="d25-ev ${v.decisive ? 'is-decisive' : ''}">
      <div class="d25-ev__h"><b>${String(v.n).padStart(2, '0')}</b><span>${esc(v.time)}</span><span>${esc(v.tag)} · ${esc(v.cost)}</span><em>${v.confidence}%</em></div>
      <ul class="d25-sig">${v.signals.map((s) => `<li class="sev-${s.sev}"><span>${esc(s.l)}</span><b>${esc(s.v)}</b></li>`).join('')}</ul>
      <p>${esc(v.note)}</p></section>`).join('')}
    <p class="d25-trailing">${esc(CASE.trailing)}</p></div>`;
