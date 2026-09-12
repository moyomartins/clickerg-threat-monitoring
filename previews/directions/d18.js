/**
 * 18 — Tape. An append-only teleprinter roll. There is no separate verdict
 * screen and no verdict moment: the determination prints inline, in sequence,
 * the instant it is reached. Weight accumulates down the roll.
 */
import { CASE, STATUS_LABEL, VISITORS } from '../data.js';
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const label = (s) => (STATUS_LABEL[s] ?? s).toUpperCase();
export const meta = { id: 'd18', name: 'Tape', tagline: 'An append-only teleprinter roll — arrivals print as they happen and the determination prints inline the moment it is reached, never as a separate screen.', idea: 'Removes the verdict moment. Nothing is summarised; weight simply accumulates down the roll.' };

const t = (s) => `<span class="d18-ts">${esc(s)}</span>`;
const row = (time, body, cls = '') => `<p class="d18-r ${cls}">${t(time)}<span>${body}</span></p>`;

export const list = () => `
  <div class="d18-roll">
    <div class="d18-perf"></div>
    <div class="d18-body">
      ${row('--:--:--', '<b>CLICKERG DETECTION TAPE</b> · account: advertiser · roll begins 08 AUG 2025', 'd18-r--hdr')}
      ${row('--:--:--', '53 VISITORS EXAMINED &middot; 13 EXCLUDED &middot; £979.39 BEHIND EXCLUSIONS')}
      ${row('--:--:--', '&nbsp;')}
      ${VISITORS.map((v, i) => `
        ${row(`${String(8 + i).padStart(2, '0')}:14:0${i % 10}`, `ARRIVAL &nbsp;<b>${esc(v.ip)}</b>&nbsp; ${esc(v.city).toUpperCase()}, ${esc(v.country).toUpperCase()}`)}
        ${row('', `&nbsp;&nbsp;&nbsp;&nbsp;${v.visits} ARRIVALS / ${v.paid} PAID / ${esc(v.spend)} / CONFIDENCE ${v.confidence}`)}
        ${row('', `&nbsp;&nbsp;&nbsp;&nbsp;${esc(v.why).toUpperCase()}`)}
        ${row('', `<span class="d18-det d18-det--${v.status}">&gt;&gt; ${label(v.status)}</span>`, v.status === 'blocked' ? 'd18-r--hot' : '')}
        ${row('', '&nbsp;')}
      `).join('')}
      ${row('--:--:--', '<i>…roll continues…</i>', 'd18-r--dim')}
    </div>
  </div>`;

export const detail = () => `
  <div class="d18-roll">
    <div class="d18-perf"></div>
    <div class="d18-body">
      ${row('--:--:--', `<b>SUBJECT ${esc(CASE.ip)}</b> · ${esc(CASE.city).toUpperCase()}, ${esc(CASE.country).toUpperCase()}`, 'd18-r--hdr')}
      ${row('', '&nbsp;')}
      ${CASE.visits.map((v) => `
        ${row(esc(v.time.split(', ')[1]) + ':00', `ARRIVAL ${String(v.n).padStart(2, '0')} &nbsp; ${esc(v.tag).toUpperCase()} &nbsp; ${esc(v.cost)}`)}
        ${row('', `&nbsp;&nbsp;&nbsp;&nbsp;${esc(v.source).toUpperCase()}`)}
        ${v.signals.map((s) => row('', `&nbsp;&nbsp;&nbsp;&nbsp;<span class="d18-sig sev-${s.sev}">${esc(s.l).toUpperCase().padEnd(22, '.').replace(/ /g, '&nbsp;')} ${esc(s.v).toUpperCase()}</span>`)).join('')}
        ${row('', `&nbsp;&nbsp;&nbsp;&nbsp;<span class="d18-note">${esc(v.note)}</span>`)}
        ${row('', `&nbsp;&nbsp;&nbsp;&nbsp;CONFIDENCE ${v.confidence}`)}
        ${v.decisive ? row('', `<span class="d18-det d18-det--blocked">&gt;&gt; THRESHOLD CROSSED. ADDED TO EXCLUSION LIST.</span>`, 'd18-r--hot') : ''}
        ${row('', '&nbsp;')}
      `).join('')}
      ${row('--:--:--', `${esc(CASE.trailing).toUpperCase()}`)}
      ${row('', '&nbsp;')}
      ${row('--:--:--', `<span class="d18-final">${esc(CASE.verdict)}</span>`, 'd18-r--final')}
    </div>
  </div>`;
