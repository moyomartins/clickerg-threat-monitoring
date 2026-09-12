/** 9 — Quiet. Deliberately under-designed: system type, one hairline, no colour. */
import { CASE, STATUS_LABEL, SUMMARY, VISITORS } from '../data.js';
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const label = (s) => STATUS_LABEL[s] ?? s;

export const meta = {
  id: 'd9', name: 'Quiet',
  tagline: 'Deliberately under-designed — system type, one hairline, no colour at all. The writing does the work and the interface gets out of the way.',
};

export const list = () => `
  <div class="d9-wrap">
    <p class="d9-crumb">ClickerG — threat monitoring</p>
    <h1>53 visitors, 13 blocked</h1>
    <p class="d9-lede">Thirteen IP addresses are on your exclusion list this week, accounting for ${esc(SUMMARY[2].value)} of paid clicks. Everything below is sorted by how recently we saw it. Open any one to read the whole journey.</p>
    <dl class="d9-summary">${SUMMARY.map((s) => `<div><dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd></div>`).join('')}</dl>
    <ol class="d9-list">
      ${VISITORS.map((v) => `
        <li>
          <p class="d9-ip">${esc(v.ip)} <span class="d9-state">${esc(label(v.status))}</span></p>
          <p class="d9-why">${esc(v.why)}</p>
          <p class="d9-meta">${esc(v.city)}, ${esc(v.country)} · ${v.visits} visits (${v.paid} paid) · ${esc(v.spend)} · last seen ${esc(v.seen)} · confidence ${v.confidence}%</p>
        </li>`).join('')}
    </ol>
  </div>`;

export const detail = () => `
  <div class="d9-wrap">
    <p class="d9-crumb"><a>All visitors</a> / ${esc(CASE.ip)}</p>
    <h1>${esc(CASE.ip)}</h1>
    <p class="d9-lede">${esc(CASE.verdict)}</p>
    <dl class="d9-summary">${CASE.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    <h2>The journey</h2>
    ${CASE.visits.map((v) => `
      <section class="d9-visit${v.decisive ? ' is-decisive' : ''}">
        <h3>${v.n}. ${esc(v.time)}${v.decisive ? ' — blocked here' : ''}</h3>
        <p class="d9-meta">${esc(v.tag)} · ${esc(v.cost)} · ${esc(v.source)} · confidence after this visit ${v.confidence}%</p>
        <p class="d9-sig">${v.signals.map((s) => `${esc(s.l)}: ${esc(s.v)}`).join(' · ')}</p>
        <p>${esc(v.note)}</p>
      </section>`).join('')}
    <p class="d9-meta">${esc(CASE.trailing)}</p>
  </div>`;
