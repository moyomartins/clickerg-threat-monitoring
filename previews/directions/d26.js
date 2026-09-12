/**
 * 26 — Verdict Withheld. The answer comes last, deliberately. The list shows
 * no status at all — only what was observed — and the determination is
 * disclosed at the bottom of the drill-down, after the evidence has been read.
 * The strongest possible reading of "the explanation is the product".
 */
import { CASE, STATUS_LABEL, SUMMARY, VISITORS } from '../data.js';
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const label = (s) => STATUS_LABEL[s] ?? s;
export const meta = { id: 'd26', name: 'Verdict Withheld', tagline: 'The answer comes last. The register shows only what was observed — no status column — and the determination is disclosed at the foot of the evidence, after you have read it.', idea: 'Inverts the pacing of every other direction: you cannot see the verdict without passing through the evidence that produced it.' };

export const list = () => `
  <header class="d26-head">
    <p class="d26-kick">Observations · 8–14 August 2025</p>
    <h1>What we saw</h1>
    <p class="d26-lede">This page does not tell you who was blocked. It tells you what each visitor did. The determinations are at the foot of each record, where they belong — after the evidence, not instead of it.</p>
    <div class="d26-stats">${SUMMARY.slice(0, 1).concat(SUMMARY.slice(2)).map((s) => `<span><b>${esc(s.value)}</b>${esc(s.label)}</span>`).join('')}</div>
  </header>
  <ol class="d26-list">
    ${VISITORS.map((v) => `
      <li class="d26-obs">
        <p class="d26-obs__ip">${esc(v.ip)}</p>
        <p class="d26-obs__body">${esc(v.why)}.</p>
        <p class="d26-obs__meta">${esc(v.city)}, ${esc(v.country)} · ${v.visits} arrivals, ${v.paid} paid · ${esc(v.spend)} · last seen ${esc(v.seen)}</p>
        <details class="d26-reveal"><summary>Show what we decided</summary>
          <p class="d26-verdict-small">${esc(label(v.status))} — confidence ${v.confidence}%.</p></details>
      </li>`).join('')}
  </ol>`;

export const detail = () => `
  <header class="d26-head d26-head--detail">
    <p class="d26-kick">Record · ${esc(CASE.ip)} · ${esc(CASE.city)}, ${esc(CASE.country)}</p>
    <h1>Twenty-nine arrivals</h1>
    <p class="d26-lede">Read them in order. We have deliberately not put our conclusion at the top of this page.</p>
    <dl class="d26-facts">${CASE.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
  </header>
  <div class="d26-body">
    ${CASE.visits.map((v) => `
      <section class="d26-ev">
        <p class="d26-ev__n">${String(v.n).padStart(2, '0')}</p>
        <div>
          <p class="d26-ev__h">${esc(v.time)}<span>${esc(v.tag)} · ${esc(v.cost)} · ${esc(v.source)}</span></p>
          <ul class="d26-sig">${v.signals.map((s) => `<li class="sev-${s.sev}"><span>${esc(s.l)}</span><b>${esc(s.v)}</b></li>`).join('')}</ul>
          <p class="d26-note">${esc(v.note)}</p>
        </div>
      </section>`).join('')}
    <p class="d26-trailing">${esc(CASE.trailing)}</p>
  </div>
  <div class="d26-rule"><span>you have now read the evidence</span></div>
  <div class="d26-finding">
    <p class="d26-kick">The determination</p>
    <p class="d26-final-status">${esc(label(CASE.status))}</p>
    <p class="d26-verdict">${esc(CASE.verdict)}</p>
  </div>`;
