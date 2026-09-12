/**
 * 24 — Passport. The journey is recorded ON the visitor's own document. Each
 * arrival is an entry stamp; the pages fill up; a refusal is struck across the
 * whole spread. Nothing is summarised — the history accumulates as marks.
 */
import { CASE, STATUS_LABEL, SUMMARY, VISITORS } from '../data.js';
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const label = (s) => (STATUS_LABEL[s] ?? s).toUpperCase();
export const meta = { id: 'd24', name: 'Passport', tagline: 'The journey recorded on the visitor’s own document — every arrival an entry stamp, the pages filling up, a refusal struck across the whole spread.', idea: 'History accumulates as physical marks on one object rather than as rows in a log. Volume becomes visible as clutter.' };

const seed = (ip) => ip.split('.').reduce((a, b) => a + Number(b), 0);
const stamps = (v, max = 9) => Array.from({ length: Math.min(v.visits, max) }, (_, i) => {
  const s = seed(v.ip) + i * 31;
  return `<span class="d24-stamp ${v.paid > i ? 'is-paid' : ''}" style="--r:${(s % 17) - 8}deg;--x:${(s % 34)}%;--y:${((s * 3) % 52)}%">
    <i>${esc(v.city).slice(0, 3).toUpperCase()}</i><em>${String((s % 28) + 1).padStart(2, '0')} AUG</em></span>`;
}).join('');

export const list = () => `
  <header class="d24-head"><h1>Documents presented</h1>
    <p>Every visitor carries its own document, and every arrival leaves a stamp on it. A page that is crowded did not get that way honestly.</p>
    <div class="d24-stats">${SUMMARY.map((s) => `<span><b>${esc(s.value)}</b>${esc(s.label)}</span>`).join('')}</div></header>
  <div class="d24-grid">
    ${VISITORS.map((v) => `
      <article class="d24-doc d24-doc--${v.status}">
        <div class="d24-doc__head"><span>PAID TRAFFIC / ENTRY RECORD</span><b>${esc(v.ip)}</b></div>
        <div class="d24-page">
          ${stamps(v)}
          ${v.status === 'blocked' ? '<span class="d24-refused">REFUSED</span>' : ''}
          ${v.status === 'incomplete' ? '<span class="d24-void">RECORD INCOMPLETE</span>' : ''}
        </div>
        <div class="d24-doc__foot">
          <span>${esc(v.city).toUpperCase()}, ${esc(v.country).toUpperCase()}</span>
          <span class="d24-mrz">${esc(v.ip).replace(/\./g, '&lt;')}&lt;&lt;${String(v.visits).padStart(2, '0')}&lt;${String(v.confidence).padStart(2, '0')}</span>
          <p>${esc(v.why)}</p>
        </div>
      </article>`).join('')}
  </div>`;

export const detail = () => `
  <header class="d24-head d24-head--detail"><h1>${esc(CASE.ip)}</h1><p>${esc(CASE.city).toUpperCase()}, ${esc(CASE.country).toUpperCase()} — ${label(CASE.status)}</p></header>
  <div class="d24-spread">
    <div class="d24-page d24-page--big">
      ${stamps({ ...CASE, visits: 29, paid: 29, ip: CASE.ip, city: CASE.city }, 18)}
      <span class="d24-refused d24-refused--big">REFUSED</span>
    </div>
    <div class="d24-endorse">
      <p class="d24-endorse__t">ENDORSEMENT</p>
      <p class="d24-verdict">${esc(CASE.verdict)}</p>
      <dl class="d24-facts">${CASE.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    </div>
  </div>
  <div class="d24-log">
    <p class="d24-logt">ENTRIES, IN ORDER</p>
    ${CASE.visits.map((v) => `
      <section class="d24-entry ${v.decisive ? 'is-decisive' : ''}">
        <span class="d24-stamp d24-stamp--inline is-paid" style="--r:-4deg"><i>LOS</i><em>${esc(v.time.split(',')[0]).toUpperCase()}</em></span>
        <div>
          <p class="d24-entry__h"><b>ENTRY ${String(v.n).padStart(2, '0')}</b> · ${esc(v.tag).toUpperCase()} · ${esc(v.cost)}<br><span>${esc(v.source)}</span></p>
          <ul class="d24-sig">${v.signals.map((s) => `<li class="sev-${s.sev}"><span>${esc(s.l)}</span><b>${esc(s.v)}</b></li>`).join('')}</ul>
          <p>${esc(v.note)}</p>
          <p class="d24-conf">CONFIDENCE ${v.confidence}%${v.decisive ? ' — ENTRY REFUSED FROM THIS POINT' : ''}</p>
        </div>
      </section>`).join('')}
    <p class="d24-trailing">${esc(CASE.trailing)}</p>
  </div>`;
