/**
 * 16 — Balance.
 * Structural idea: every visitor is a two-pan scale, not a row. Evidence
 * against loads the left pan, evidence in their favour loads the right, and
 * the beam tilts. A judgement call is a beam that will not settle — ambiguity
 * becomes a physical state rather than a label.
 */
import { CASE, STATUS_LABEL, SUMMARY, VISITORS } from '../data.js';
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const label = (s) => STATUS_LABEL[s] ?? s;

export const meta = {
  id: 'd16', name: 'Balance',
  tagline: 'Every visitor is a two-pan scale — evidence against on one side, evidence for on the other, and the beam tilts by exactly as much as the case is settled.',
  idea: 'Ambiguity stops being a status word and becomes a physical state: a beam that sits level. Certainty is a beam on the floor.',
};

/**
 * Beam angle. CSS rotate() is clockwise, which drops the RIGHT pan — and the
 * right pan holds the evidence in their favour. So heavy evidence *against*
 * (high confidence) must rotate negative to drop the LEFT pan.
 * +14° = clean (right pan down) · 0° = genuinely unsettled · −14° = certain.
 */
const tilt = (c) => (-((c - 50) / 50) * 14).toFixed(1);
const weigh = (v) => {
  const against = v.signals.filter((s) => s.sev === 'high' || s.sev === 'medium');
  const forThem = v.signals.filter((s) => s.sev === 'low');
  return { against, forThem };
};

const scale = (conf, against, forThem, extra = '') => `
  <div class="d16-scale" style="--t:${tilt(conf)}deg">
    <span class="d16-post"></span>
    <div class="d16-beam">
      <span class="d16-pan d16-pan--l"><i>${against}</i><em>against</em></span>
      <span class="d16-fulcrum"></span>
      <span class="d16-pan d16-pan--r"><i>${forThem}</i><em>for</em></span>
    </div>
    ${extra}
  </div>`;

export const list = () => `
  <header class="d16-head">
    <h1>What the evidence weighs</h1>
    <p>Fifty-three visitors, each one weighed. A beam on the floor is a case we are certain of. A beam that sits level is a case we are not willing to call — and we would rather show you that than pretend otherwise.</p>
    <div class="d16-stats">${SUMMARY.map((s) => `<span><b>${esc(s.value)}</b>${esc(s.label)}</span>`).join('')}</div>
  </header>
  <div class="d16-grid">
    ${VISITORS.map((v) => {
      const against = Math.max(1, Math.round(v.confidence / 14));
      const forThem = Math.max(0, Math.round((100 - v.confidence) / 26));
      return `<article class="d16-item d16-item--${v.status}">
        ${scale(v.confidence, against, forThem)}
        <b class="d16-ip">${esc(v.ip)}</b>
        <span class="d16-loc">${esc(v.city)}, ${esc(v.country)}</span>
        <span class="d16-state">${esc(label(v.status))}</span>
        <p>${esc(v.why)}</p>
        <span class="d16-sub">${v.visits} visits · ${esc(v.spend)} · confidence ${v.confidence}%</span>
      </article>`;
    }).join('')}
  </div>`;

export const detail = () => `
  <header class="d16-head d16-head--detail">
    <h1>${esc(CASE.ip)}</h1>
    <p class="d16-loc">${esc(CASE.city)}, ${esc(CASE.country)} · <span class="d16-state">${esc(label(CASE.status))}</span></p>
  </header>
  <div class="d16-final">
    ${scale(99, 7, 0, '<span class="d16-floor">the beam is on the floor</span>')}
    <p class="d16-verdict">${esc(CASE.verdict)}</p>
  </div>
  <dl class="d16-facts">${CASE.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
  <h2 class="d16-h2">How it tipped</h2>
  <div class="d16-seq">
    ${CASE.visits.map((v) => {
      const { against, forThem } = weigh(v);
      return `<section class="d16-step ${v.decisive ? 'is-decisive' : ''}">
        ${scale(v.confidence, against.length, forThem.length)}
        <div class="d16-step__body">
          <p class="d16-step__head"><b>Visit ${v.n}</b> · ${esc(v.time)} · ${esc(v.tag)} · ${esc(v.cost)}<br><span>${esc(v.source)}</span></p>
          <div class="d16-pans">
            <div class="d16-side d16-side--against"><h3>Against them</h3><ul>${against.map((s) => `<li class="sev-${s.sev}"><span>${esc(s.l)}</span><b>${esc(s.v)}</b></li>`).join('')}</ul></div>
            <div class="d16-side d16-side--for"><h3>In their favour</h3>${forThem.length ? `<ul>${forThem.map((s) => `<li><span>${esc(s.l)}</span><b>${esc(s.v)}</b></li>`).join('')}</ul>` : '<p class="d16-empty">Nothing on this side.</p>'}</div>
          </div>
          <p class="d16-note">${esc(v.note)}</p>
          <p class="d16-conf">Beam at ${v.confidence}%${v.decisive ? ' — it stopped moving here, and we blocked.' : ''}</p>
        </div>
      </section>`;
    }).join('')}
    <p class="d16-trailing">${esc(CASE.trailing)}</p>
  </div>`;
