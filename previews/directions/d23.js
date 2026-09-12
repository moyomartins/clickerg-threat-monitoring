/**
 * 23 — Seismograph. Behaviour as a continuous trace. You do not read a number;
 * you see that the line is too regular. Human browsing is irregular in
 * amplitude — a script draws a clean periodic wave or a flat line.
 */
import { CASE, STATUS_LABEL, SUMMARY, VISITORS } from '../data.js';
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const label = (s) => STATUS_LABEL[s] ?? s;
export const meta = { id: 'd23', name: 'Seismograph', tagline: 'One continuous trace per visitor — a person makes an irregular line, a script makes a clean periodic one, and you see the difference before you read anything.', idea: 'Automation is detected by the regularity of the waveform, so the evidence is a shape rather than a value.' };

const seed = (ip) => ip.split('.').reduce((a, b) => a + Number(b), 0);
/** Regular sine for automation, noisy for humans, flat for missing data. */
const trace = (v, w = 600, h = 46) => {
  const s = seed(v.ip); const pts = [];
  for (let x = 0; x <= w; x += 4) {
    let y;
    if (v.status === 'incomplete') y = h / 2;
    else if (v.confidence >= 80) y = h / 2 + Math.sin(x / 9) * (h / 2 - 4);
    else {
      const n = Math.sin(x / (5 + (s % 7))) * Math.cos(x / (11 + (s % 5))) * Math.sin(x / 3.3);
      y = h / 2 + n * (h / 2 - 4) * (0.35 + (v.confidence / 140));
    }
    pts.push(`${x},${y.toFixed(1)}`);
  }
  return pts.join(' ');
};

export const list = () => `
  <header class="d23-head"><h1>Traces</h1>
    <p>One line per visitor, drawn from the rhythm of its arrivals and its behaviour on the page. People are irregular. Scripts are not. A flat line means we recorded nothing.</p>
    <div class="d23-stats">${SUMMARY.map((s) => `<span><b>${esc(s.value)}</b>${esc(s.label)}</span>`).join('')}</div></header>
  <div class="d23-drum">
    ${VISITORS.map((v) => `
      <div class="d23-line d23-line--${v.status}">
        <div class="d23-line__id"><b>${esc(v.ip)}</b><span>${esc(v.city)} · ${v.visits} visits · ${esc(v.spend)}</span></div>
        <svg class="d23-trace" viewBox="0 0 600 46" preserveAspectRatio="none"><line class="base" x1="0" y1="23" x2="600" y2="23"/><polyline points="${trace(v)}" /></svg>
        <div class="d23-line__end"><span class="d23-st d23-st--${v.status}">${esc(label(v.status))}</span><em>${v.confidence}</em></div>
        <p class="d23-line__why">${esc(v.why)}</p>
      </div>`).join('')}
  </div>
  <p class="d23-key">Amplitude is engagement variance · period regularity is the automation tell · flat is not clean, it is unrecorded</p>`;

export const detail = () => `
  <header class="d23-head d23-head--detail"><h1>${esc(CASE.ip)}</h1><p>${esc(CASE.city)}, ${esc(CASE.country)} · <span class="d23-st d23-st--blocked">${esc(label(CASE.status))}</span></p></header>
  <div class="d23-big">
    <svg class="d23-trace d23-trace--big" viewBox="0 0 600 120" preserveAspectRatio="none">
      <line class="base" x1="0" y1="60" x2="600" y2="60"/>
      <polyline points="${Array.from({ length: 151 }, (_, i) => { const x = i * 4; return `${x},${(60 + Math.sin(x / 9) * 52).toFixed(1)}`; }).join(' ')}" />
      ${CASE.visits.map((v, i) => `<line class="mark ${v.decisive ? 'hot' : ''}" x1="${30 + i * 118}" y1="4" x2="${30 + i * 118}" y2="116" />`).join('')}
    </svg>
    <p class="d23-big__cap">Perfectly periodic across twenty-nine arrivals. Nothing human produces this line.</p>
  </div>
  <p class="d23-verdict">${esc(CASE.verdict)}</p>
  <dl class="d23-facts">${CASE.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
  <div class="d23-log">${CASE.visits.map((v) => `
    <section class="d23-ev ${v.decisive ? 'is-decisive' : ''}">
      <div class="d23-ev__h"><b>${String(v.n).padStart(2, '0')}</b><span>${esc(v.time)} · ${esc(v.tag)} · ${esc(v.cost)}</span><em>${v.confidence}%</em></div>
      <ul class="d23-sig">${v.signals.map((s) => `<li class="sev-${s.sev}"><span>${esc(s.l)}</span><b>${esc(s.v)}</b></li>`).join('')}</ul>
      <p>${esc(v.note)}</p></section>`).join('')}
    <p class="d23-trailing">${esc(CASE.trailing)}</p></div>`;
