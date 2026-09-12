/**
 * 20 — Broadsheet. The system exercises editorial judgement: it decides what
 * leads. Verdict-first pacing — the headline states the finding, everything
 * below it is the justification.
 */
import { CASE, STATUS_LABEL, SUMMARY, VISITORS } from '../data.js';
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const label = (s) => STATUS_LABEL[s] ?? s;
export const meta = { id: 'd20', name: 'Broadsheet', tagline: 'The system decides what leads — a front page with one lead story, a standfirst, and the rest of the register set as briefs in columns.', idea: 'Editorial judgement made explicit, and verdict-first pacing: the headline states the finding, everything after it is justification.' };

export const list = () => {
  const lead = VISITORS[0];
  const rest = VISITORS.slice(1);
  return `
  <div class="d20-masthead"><b>The Exclusion</b><span>Paid traffic, examined · Thursday 14 August 2025 · 53 visitors</span></div>
  <div class="d20-front">
    <article class="d20-lead">
      <p class="d20-rubric">Lead finding</p>
      <h1>One address took £158.38 and never read a word</h1>
      <p class="d20-stand">${esc(lead.why)}. Twenty-nine paid clicks over two days from a single datacenter address, none of them with a moment of engagement behind them.</p>
      <div class="d20-cols">
        <p><span class="d20-drop">T</span>he address at <b>${esc(lead.ip)}</b>, reaching the site from ${esc(lead.city)}, arrived twenty-nine times between the thirteenth and fourteenth of August. Every arrival was a paid click. None scrolled.</p>
        <p>Confidence in the determination reached ${lead.confidence} per cent. The address was added to the exclusion list at the third paid click, and the twenty-six arrivals that followed were recorded but not paid for.</p>
        <p>The pattern is not subtle: identical session behaviour, a fingerprint reappearing as new visitors, and form submissions to addresses that do not exist.</p>
      </div>
    </article>
    <aside class="d20-rail">
      <p class="d20-rubric">Also examined</p>
      ${rest.map((v) => `<article class="d20-brief d20-brief--${v.status}">
        <h2>${esc(v.ip)}</h2>
        <p class="d20-brief__meta">${esc(v.city)}, ${esc(v.country)} · <span class="d20-tag">${esc(label(v.status))}</span></p>
        <p>${esc(v.why)}.</p>
        <p class="d20-brief__num">${v.visits} arrivals · ${esc(v.spend)} · confidence ${v.confidence}%</p>
      </article>`).join('')}
    </aside>
  </div>
  <div class="d20-strip">${SUMMARY.map((s) => `<span><b>${esc(s.value)}</b>${esc(s.label)}</span>`).join('')}</div>`;
};

export const detail = () => `
  <div class="d20-masthead"><b>The Exclusion</b><span>Full report · ${esc(CASE.ip)}</span></div>
  <article class="d20-article">
    <p class="d20-rubric">Determination</p>
    <h1>Blocked at the third paid click</h1>
    <p class="d20-stand">${esc(CASE.verdict)}</p>
    <p class="d20-byline">${esc(CASE.city)}, ${esc(CASE.country)} · 29 arrivals examined · ${esc(CASE.facts[3][1])} incurred</p>
    <div class="d20-body">
      ${CASE.visits.map((v) => `
        <section class="d20-visit ${v.decisive ? 'is-decisive' : ''}">
          <h3>${esc(v.time)}<span>${esc(v.tag)} · ${esc(v.cost)} · ${esc(v.source)}</span></h3>
          ${v.decisive ? '<p class="d20-pull">This is the arrival at which the line was crossed.</p>' : ''}
          <p>${esc(v.note)}</p>
          <ul class="d20-sig">${v.signals.map((s) => `<li class="sev-${s.sev}"><span>${esc(s.l)}</span> <b>${esc(s.v)}</b></li>`).join('')}</ul>
          <p class="d20-conf">Confidence after this arrival: ${v.confidence}%</p>
        </section>`).join('')}
      <p class="d20-end">${esc(CASE.trailing)}</p>
    </div>
  </article>`;
