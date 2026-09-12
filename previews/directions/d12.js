/** 12 — Swimlane. The journey is the primary object: every visit plotted on one shared clock. */
import { CASE, STATUS_LABEL, SUMMARY, VISITORS } from '../data.js';
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const label = (s) => STATUS_LABEL[s] ?? s;

/** Deterministic mark placement across a 48-hour window — illustrative spacing. */
const marks = (v) => {
  const n = Math.min(v.visits, 20);
  const seed = v.ip.split('.').reduce((a, b) => a + Number(b), 0);
  return Array.from({ length: n }, (_, i) => ({
    x: ((seed * 7 + i * 97) % 1000) / 10,
    hot: (seed + i) % 3 === 0,
  })).sort((a, b) => a.x - b.x);
};

export const meta = {
  id: 'd12', name: 'Swimlane',
  tagline: 'Timeline-first — every visitor is a lane on one shared 48-hour clock, and the register is secondary to the shape of the traffic.',
};

export const list = () => `
  <header class="d12-head">
    <h1>48 hours of paid traffic</h1>
    <p>One lane per visitor, one mark per arrival, all on the same clock. Clustering is the tell: a lane that fires in an even rhythm through the night is not a person.</p>
    <div class="d12-stats">${SUMMARY.map((s) => `<span><b>${esc(s.value)}</b>${esc(s.label)}</span>`).join('')}</div>
  </header>
  <div class="d12-ruler"><span>−48h</span><span>−36h</span><span>−24h</span><span>−12h</span><span>now</span></div>
  <div class="d12-lanes">
    ${VISITORS.map((v) => `
      <div class="d12-lane d12-lane--${v.status}">
        <div class="d12-lane__id"><b>${esc(v.ip)}</b><span>${esc(v.city)} · ${v.visits} visits · ${esc(v.spend)}</span></div>
        <div class="d12-lane__track">
          <span class="d12-grid"></span>
          ${marks(v).map((m) => `<i class="${m.hot ? 'is-hot' : ''}" style="--x:${m.x}%"></i>`).join('')}
        </div>
        <div class="d12-lane__end"><span class="d12-st d12-st--${v.status}">${esc(label(v.status))}</span><em>${v.confidence}%</em></div>
      </div>`).join('')}
  </div>
  <table class="d12-register">
    <thead><tr><th>IP</th><th>Origin</th><th>Status</th><th>Why</th></tr></thead>
    <tbody>${VISITORS.map((v) => `<tr><td class="d12-ip">${esc(v.ip)}</td><td>${esc(v.city)}, ${esc(v.country)}</td><td><span class="d12-st d12-st--${v.status}">${esc(label(v.status))}</span></td><td class="d12-why">${esc(v.why)}</td></tr>`).join('')}</tbody>
  </table>`;

export const detail = () => `
  <header class="d12-head d12-head--detail">
    <h1>${esc(CASE.ip)}</h1>
    <p>${esc(CASE.city)}, ${esc(CASE.country)} · <span class="d12-st d12-st--blocked">${esc(label(CASE.status))}</span></p>
  </header>
  <div class="d12-ruler d12-ruler--detail"><span>10:01</span><span>11:26</span><span>12:44</span><span>13:59</span><span>15:17</span></div>
  <div class="d12-solo">
    <span class="d12-grid"></span>
    ${CASE.visits.map((v, i) => `<i class="d12-solo__m ${v.decisive ? 'is-block' : ''}" style="--x:${6 + i * 22}%" data-n="${v.n}"></i>`).join('')}
    <span class="d12-thresh"><em>blocking threshold crossed at visit 3</em></span>
  </div>
  <p class="d12-verdict">${esc(CASE.verdict)}</p>
  <dl class="d12-facts">${CASE.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
  <div class="d12-steps">
    ${CASE.visits.map((v) => `
      <section class="d12-step ${v.decisive ? 'is-decisive' : ''}">
        <div class="d12-step__head"><b>${String(v.n).padStart(2, '0')}</b><span>${esc(v.time)}</span><span>${esc(v.tag)} · ${esc(v.cost)}</span><em>${v.confidence}%</em></div>
        <p class="d12-src">${esc(v.source)}</p>
        <ul class="d12-sig">${v.signals.map((s) => `<li class="sev-${s.sev}"><span>${esc(s.l)}</span><b>${esc(s.v)}</b></li>`).join('')}</ul>
        <p>${esc(v.note)}</p>
      </section>`).join('')}
    <p class="d12-trailing">${esc(CASE.trailing)}</p>
  </div>`;
