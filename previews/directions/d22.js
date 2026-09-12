/**
 * 22 — Replay. The evidence is shown as behaviour ON the page, not as numbers
 * about it: a wireframe of the landing page with scroll depth shaded, the
 * mouse path drawn (or conspicuously absent) and click points marked.
 */
import { CASE, STATUS_LABEL, SUMMARY, VISITORS } from '../data.js';
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const label = (s) => STATUS_LABEL[s] ?? s;
export const meta = { id: 'd22', name: 'Replay', tagline: 'Behaviour drawn on the page itself — scroll depth shaded, mouse path traced or conspicuously missing, clicks marked where they landed.', idea: 'Stops describing behaviour in numbers and shows it happening on a wireframe of the actual landing page.' };

const seed = (ip) => ip.split('.').reduce((a, b) => a + Number(b), 0);
/* Behaviour is derived from confidence, not from the status label, so the grid
   shows the real gradient rather than nine identical panels. */
const scrollOf = (v) => {
  if (v.status === 'incomplete') return 0;
  return Math.max(2, Math.round(86 - v.confidence * 0.8));
};
/** Below ~92% confidence there is still some mouse to draw; above it, none. */
const path = (v) => {
  if (v.status === 'incomplete' || v.confidence >= 92) return '';
  const s = seed(v.ip);
  const n = 4 + Math.round((100 - v.confidence) / 14);
  return Array.from({ length: n }, (_, i) => `${10 + ((s * (i + 3)) % 80)},${8 + i * (70 / n)}`).join(' ');
};

const frame = (v, big = false) => `
  <div class="d22-frame ${big ? 'is-big' : ''}">
    <div class="d22-page">
      <span class="d22-nav"></span><span class="d22-hero"></span><span class="d22-cta"></span>
      <span class="d22-b" style="top:46%"></span><span class="d22-b" style="top:56%;width:70%"></span>
      <span class="d22-b" style="top:70%"></span><span class="d22-b" style="top:80%;width:52%"></span>
      <span class="d22-seen" style="--s:${scrollOf(v)}%"></span>
      ${path(v) ? `<svg class="d22-path" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="${path(v)}" /></svg>` : `<span class="d22-nomouse">no mouse movement recorded</span>`}
      ${v.status === 'blocked' ? '<span class="d22-click" style="left:50%;top:6%"></span><span class="d22-click" style="left:50%;top:6%"></span>' : ''}
      ${v.status === 'incomplete' ? '<span class="d22-void">tag stopped reporting</span>' : ''}
    </div>
    <p class="d22-caption"><b>${scrollOf(v)}%</b> of the page seen</p>
  </div>`;

export const list = () => `
  <header class="d22-head"><h1>What they actually did</h1>
    <p>Each panel is the page they landed on, with their behaviour drawn on it. The shaded band is how far down they got. The line is the mouse. Where there is no line, there was no mouse.</p>
    <div class="d22-stats">${SUMMARY.map((s) => `<span><b>${esc(s.value)}</b>${esc(s.label)}</span>`).join('')}</div></header>
  <div class="d22-grid">
    ${VISITORS.map((v) => `
      <article class="d22-card d22-card--${v.status}">
        ${frame(v)}
        <div class="d22-meta">
          <b>${esc(v.ip)}</b><span class="d22-tag">${esc(label(v.status))}</span>
          <span class="d22-loc">${esc(v.city)}, ${esc(v.country)} · ${v.visits} visits · ${esc(v.spend)}</span>
          <p>${esc(v.why)}</p>
        </div>
      </article>`).join('')}
  </div>`;

export const detail = () => `
  <header class="d22-head d22-head--detail"><h1>${esc(CASE.ip)}</h1><p>${esc(CASE.city)}, ${esc(CASE.country)} · <span class="d22-tag">${esc(label(CASE.status))}</span></p></header>
  <div class="d22-hero-row">
    ${frame(CASE, true)}
    <div><p class="d22-verdict">${esc(CASE.verdict)}</p>
      <dl class="d22-facts">${CASE.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div>
  </div>
  <p class="d22-sub">Every arrival, replayed. Twenty-nine panels would look identical to these five — that is the finding.</p>
  <div class="d22-strip">
    ${CASE.visits.map((v) => `
      <section class="d22-rep ${v.decisive ? 'is-decisive' : ''}">
        ${frame({ ...CASE, status: 'blocked' })}
        <p class="d22-rep__h"><b>visit ${v.n}</b> ${esc(v.time)}<br><span>${esc(v.tag)} · ${esc(v.cost)}</span></p>
        <ul class="d22-sig">${v.signals.slice(0, 4).map((s) => `<li class="sev-${s.sev}"><span>${esc(s.l)}</span><b>${esc(s.v)}</b></li>`).join('')}</ul>
        ${v.decisive ? '<p class="d22-blocked">blocked here</p>' : ''}
      </section>`).join('')}
  </div>
  <div class="d22-notes">${CASE.visits.map((v) => `<p><b>visit ${v.n}</b> ${esc(v.note)}</p>`).join('')}<p class="d22-trailing">${esc(CASE.trailing)}</p></div>`;
