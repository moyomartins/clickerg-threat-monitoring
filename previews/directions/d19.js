/**
 * 19 — Actuary. Fraud repriced as insurable risk: every visitor carries an
 * exposure, an expected loss and a reserve, and blocking is an underwriting
 * decision rather than a verdict. Cost is the dominant signal throughout.
 */
import { CASE, STATUS_LABEL, VISITORS } from '../data.js';
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const label = (s) => STATUS_LABEL[s] ?? s;
const num = (s) => Number(String(s).replace(/[£,]/g, ''));
export const meta = { id: 'd19', name: 'Actuary', tagline: 'Fraud repriced as insurable risk — exposure, expected loss and reserve per visitor, with blocking treated as an underwriting decision rather than a verdict.', idea: 'Reframes the whole product forward-looking: not what happened, but what each address is expected to cost if left running.' };

const el = (v) => (num(v.spend) / v.visits) * (v.confidence / 100) * 30; // 30-day projection

export const list = () => {
  const total = VISITORS.reduce((s, v) => s + el(v), 0);
  return `
  <header class="d19-head">
    <div><p class="d19-kick">SCHEDULE A — EXPOSURE BY ADDRESS</p><h1>Underwriting schedule</h1>
    <p class="d19-lede">Each address is rated on its observed behaviour and priced forward. Expected loss is the spend we project over the next 30 days if the address is left running.</p></div>
    <div class="d19-reserve"><span>Total reserve released by exclusions</span><b>£${total.toFixed(2)}</b><em>30-day projection</em></div>
  </header>
  <table class="d19-tbl">
    <thead><tr><th>Address</th><th>Territory</th><th class="n">Exposure</th><th class="n">Freq.</th><th class="n">Severity</th><th class="n">Expected loss</th><th>Decision</th><th>Basis of rating</th></tr></thead>
    <tbody>${VISITORS.map((v) => `
      <tr class="d19-row--${v.status}">
        <td class="d19-acc">${esc(v.ip)}</td>
        <td>${esc(v.city)}, ${esc(v.country)}</td>
        <td class="n">${esc(v.spend)}</td>
        <td class="n">${v.paid}/${v.visits}</td>
        <td class="n">${(v.confidence / 100).toFixed(2)}</td>
        <td class="n d19-el">£${el(v).toFixed(2)}</td>
        <td><span class="d19-dec d19-dec--${v.status}">${esc(label(v.status))}</span></td>
        <td class="d19-basis">${esc(v.why)}</td>
      </tr>`).join('')}
    </tbody>
    <tfoot><tr><td colspan="5">Aggregate</td><td class="n d19-el">£${total.toFixed(2)}</td><td colspan="2"></td></tr></tfoot>
  </table>
  <div class="d19-tri">
    <p class="d19-kick">SCHEDULE B — DEVELOPMENT OF CONFIDENCE BY ARRIVAL</p>
    <table class="d19-triangle"><tbody>
      ${VISITORS.slice(0, 6).map((v) => `<tr><th>${esc(v.ip)}</th>${Array.from({ length: 6 }, (_, i) => {
        const c = Math.min(v.confidence, Math.round(v.confidence * ((i + 1) / 5)));
        return i < 5 ? `<td class="${c >= 80 ? 'is-over' : ''}">${c}</td>` : '<td class="pad"></td>';
      }).join('')}</tr>`).join('')}
    </tbody></table>
    <p class="d19-foot">Cells at or above 80 are past the retention limit; the address is excluded at that development point.</p>
  </div>`;
};

export const detail = () => `
  <header class="d19-head">
    <div><p class="d19-kick">RISK FILE — ${esc(CASE.ip)}</p><h1>£158.38 <small>incurred</small></h1>
    <p class="d19-lede">${esc(CASE.verdict)}</p></div>
    <div class="d19-reserve"><span>Reserve released</span><b>£47.51</b><em>30-day projection at exclusion</em></div>
  </header>
  <dl class="d19-facts">${CASE.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
  <p class="d19-kick">SCHEDULE C — RATING BY ARRIVAL</p>
  <table class="d19-tbl d19-tbl--detail">
    <thead><tr><th class="n">No.</th><th>Date of loss</th><th>Particulars</th><th class="n">Incurred</th><th class="n">Rated at</th></tr></thead>
    <tbody>${CASE.visits.map((v) => `
      <tr class="${v.decisive ? 'is-decisive' : ''}">
        <td class="n">${String(v.n).padStart(2, '0')}</td>
        <td>${esc(v.time)}</td>
        <td class="d19-part">
          <b>${esc(v.tag)}</b> — ${esc(v.source)}
          <ul class="d19-sig">${v.signals.map((s) => `<li class="sev-${s.sev}"><span>${esc(s.l)}</span><b>${esc(s.v)}</b></li>`).join('')}</ul>
          <p>${esc(v.note)}</p>
          ${v.decisive ? '<p class="d19-bind">Retention limit breached — address excluded at this development point.</p>' : ''}
        </td>
        <td class="n">${esc(v.cost)}</td>
        <td class="n d19-el">${v.confidence}</td>
      </tr>`).join('')}
    </tbody>
    <tfoot><tr><td colspan="2"></td><td>${esc(CASE.trailing)}</td><td class="n">£158.38</td><td class="n d19-el">99</td></tr></tfoot>
  </table>`;
