/**
 * 13 — Deposition.
 * Structural idea: there is no list and no detail. The whole product is ONE
 * continuous sworn document with numbered lines; "drilling down" is reading
 * further. The index at the top is a byproduct of the document, not a screen.
 */
import { CASE, STATUS_LABEL, VISITORS } from '../data.js';
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const label = (s) => STATUS_LABEL[s] ?? s;

export const meta = {
  id: 'd13', name: 'Deposition',
  tagline: 'One continuous sworn document — numbered lines, an index of parties, evidence entered as exhibits. No list, no detail view, only further down the page.',
  idea: 'Abolishes the list/detail split entirely. The product is a single scrolling transcript; navigation is reading.',
};

let L = 0;
const line = (html, cls = '') => `<p class="d13-l ${cls}"><span class="d13-n">${String(++L).padStart(2, '0')}</span><span class="d13-t">${html}</span></p>`;
const blank = () => `<p class="d13-l"><span class="d13-n">${String(++L).padStart(2, '0')}</span><span class="d13-t"></span></p>`;

const caption = () => `
  <div class="d13-caption">
    <div class="d13-caption__box">
      <p>IN THE MATTER OF PAID SEARCH TRAFFIC</p>
      <p>ACCOUNT: <b>ClickerG / advertiser</b></p>
      <p>PERIOD: 8 – 14 AUGUST 2025</p>
    </div>
    <div class="d13-caption__box d13-caption__box--right">
      <p>TRANSCRIPT OF DETERMINATIONS</p>
      <p>53 visitors examined</p>
      <p>13 excluded</p>
    </div>
  </div>
  <h1 class="d13-title">Deposition of the<br>detection service</h1>`;

export const list = () => {
  L = 0;
  return `${caption()}
  <div class="d13-doc">
    ${line('<b>APPEARANCES.</b> The following parties were examined during the period. Page references follow.')}
    ${blank()}
    ${VISITORS.map((v, i) => line(
      `<span class="d13-party">${esc(v.ip)}</span> &nbsp;of ${esc(v.city)}, ${esc(v.country)} &nbsp;—&nbsp; <span class="d13-ruling d13-ruling--${v.status}">${esc(label(v.status))}</span> &nbsp;<span class="d13-pg">p. ${String(4 + i * 3).padStart(3, '0')}</span>`
    )).join('')}
    ${blank()}
    ${line('<b>EXAMINATION.</b> Each party below was scored against behavioural signals across the whole of its journey, not upon any single arrival.')}
    ${blank()}
    ${VISITORS.slice(0, 6).map((v) => `
      ${line(`<b>AS TO ${esc(v.ip)}.</b>`)}
      ${line(`Q.&nbsp;&nbsp;What did you observe of this party?`)}
      ${line(`A.&nbsp;&nbsp;${esc(v.why)}.`)}
      ${line(`Q.&nbsp;&nbsp;And what determination did you reach?`)}
      ${line(`A.&nbsp;&nbsp;<span class="d13-ruling d13-ruling--${v.status}">${esc(label(v.status))}</span>. ${v.visits} arrivals, ${v.paid} of them paid, ${esc(v.spend)} in spend, confidence ${v.confidence} per cent.`)}
      ${blank()}
    `).join('')}
    ${line('<i>…the examination continues at page 034.</i>', 'd13-l--quiet')}
  </div>`;
};

export const detail = () => {
  L = 120;
  return `${caption()}
  <div class="d13-doc">
    ${line(`<b>AS TO ${esc(CASE.ip)}, of ${esc(CASE.city)}, ${esc(CASE.country)}.</b>`)}
    ${blank()}
    ${line('Q.&nbsp;&nbsp;State your determination as to this party.')}
    ${line(`A.&nbsp;&nbsp;<span class="d13-ruling d13-ruling--blocked">${esc(label(CASE.status))}</span>.`)}
    ${line('Q.&nbsp;&nbsp;On what basis?')}
    ${CASE.verdict.split('. ').filter(Boolean).map((s, i) => line(`${i === 0 ? 'A.&nbsp;&nbsp;' : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'}${esc(s.trim())}${s.trim().endsWith('.') ? '' : '.'}`)).join('')}
    ${blank()}
    ${line('Q.&nbsp;&nbsp;Let the record reflect the arrivals in order.')}
    ${line('A.&nbsp;&nbsp;So entered, as Exhibits A through E.')}
    ${blank()}
  </div>
  <div class="d13-exhibits">
    ${CASE.visits.map((v, i) => `
      <section class="d13-ex ${v.decisive ? 'is-decisive' : ''}">
        <div class="d13-ex__stamp">EXHIBIT ${String.fromCharCode(65 + i)}${v.decisive ? '<em>ruling</em>' : ''}</div>
        <div class="d13-ex__body">
          <p class="d13-ex__head"><b>${esc(v.time)}</b> — ${esc(v.tag)}, ${esc(v.cost)}<br><span>${esc(v.source)}</span></p>
          <table class="d13-ex__tbl"><tbody>
            ${v.signals.map((s) => `<tr class="sev-${s.sev}"><td>${esc(s.l)}</td><td>${esc(s.v)}</td></tr>`).join('')}
          </tbody></table>
          <p class="d13-ex__note">${esc(v.note)}</p>
          <p class="d13-ex__conf">Confidence upon this arrival: <b>${v.confidence}%</b>${v.decisive ? ' — <b>the line was crossed here.</b>' : ''}</p>
        </div>
      </section>`).join('')}
  </div>
  <div class="d13-doc">
    ${line(`Q.&nbsp;&nbsp;Were there further arrivals?`)}
    ${line(`A.&nbsp;&nbsp;${esc(CASE.trailing)}`)}
    ${blank()}
    ${line('<b>CERTIFICATION.</b> The foregoing is a true record of the signals observed and of the determination reached upon them.', 'd13-l--cert')}
  </div>`;
};
