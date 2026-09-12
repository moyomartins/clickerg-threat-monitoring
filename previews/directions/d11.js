/**
 * 11 — Verdict & Doubt. Blocked and ambiguous are opposite registers, not variants:
 * certainty is stamped, heavy and hard-edged; doubt is thin, pale and unresolved.
 */
import { CASE, STATUS_LABEL, SUMMARY, VISITORS } from '../data.js';
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const label = (s) => STATUS_LABEL[s] ?? s;
const certain = (v) => v.status === 'blocked';

export const meta = {
  id: 'd11', name: 'Verdict & Doubt',
  tagline: 'Two registers, not one scale — certainty is stamped in heavy oxblood caps, doubt is set thin and pale in italic and never pretends to be resolved.',
};

export const list = () => {
  const sure = VISITORS.filter(certain);
  const unsure = VISITORS.filter((v) => !certain(v));
  return `
  <header class="d11-head"><h1>Threat monitoring</h1><p>Fifty-three visitors. Thirteen we are certain about. The rest are not a lesser shade of the same judgement — they are a different kind of answer, and they are set differently.</p></header>
  <section class="d11-side d11-side--sure">
    <div class="d11-rule"><h2>Certain</h2><span>${sure.length} accounts · ${esc(SUMMARY[2].value)} of spend</span></div>
    <div class="d11-sure-grid">
      ${sure.map((v) => `<article class="d11-card">
        <span class="d11-stamp">${esc(label(v.status))}</span>
        <b>${esc(v.ip)}</b>
        <span class="d11-loc">${esc(v.city)}, ${esc(v.country)}</span>
        <p>${esc(v.why)}</p>
        <div class="d11-nums"><span>${v.visits} visits</span><span>${esc(v.spend)}</span><span>${v.confidence}%</span></div>
      </article>`).join('')}
    </div>
  </section>
  <section class="d11-side d11-side--doubt">
    <div class="d11-rule d11-rule--thin"><h2>Unresolved</h2><span>${unsure.length} accounts we are not willing to call</span></div>
    ${unsure.map((v) => `<article class="d11-doubt">
      <span class="d11-mark">${esc(label(v.status))}</span>
      <b>${esc(v.ip)}</b>
      <span class="d11-loc">${esc(v.city)}, ${esc(v.country)} · ${v.visits} visits · ${esc(v.spend)} · confidence ${v.confidence}%</span>
      <p>${esc(v.why)}</p>
    </article>`).join('')}
  </section>`;
};

export const detail = () => `
  <header class="d11-head d11-head--detail">
    <span class="d11-stamp d11-stamp--big">${esc(label(CASE.status))}</span>
    <h1>${esc(CASE.ip)}</h1>
    <p class="d11-loc">${esc(CASE.city)}, ${esc(CASE.country)}</p>
  </header>
  <p class="d11-verdict">${esc(CASE.verdict)}</p>
  <dl class="d11-facts">${CASE.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
  <div class="d11-rule"><h2>The evidence, in order</h2></div>
  ${CASE.visits.map((v) => `
    <section class="d11-entry ${v.decisive ? 'is-decisive' : ''}">
      <div class="d11-entry__n">${String(v.n).padStart(2, '0')}</div>
      <div class="d11-entry__body">
        <b>${esc(v.time)}</b>
        <span class="d11-loc">${esc(v.tag)} · ${esc(v.cost)} · ${esc(v.source)}</span>
        <ul class="d11-sig">${v.signals.map((s) => `<li class="sev-${s.sev}"><span>${esc(s.l)}</span><b>${esc(s.v)}</b></li>`).join('')}</ul>
        <p>${esc(v.note)}</p>
        <span class="d11-conf">Confidence ${v.confidence}%</span>
        ${v.decisive ? '<div class="d11-stamped">CERTAIN — ADDED TO EXCLUSION LIST</div>' : ''}
      </div>
    </section>`).join('')}
  <p class="d11-trailing">${esc(CASE.trailing)}</p>`;
