/**
 * 17 — Constellation. The unit of evidence is the CLUSTER, not the visitor:
 * IPs sharing a fingerprint, campaign or subnet are drawn linked. A lone node
 * is innocent by shape; a dense knot is a farm before you read a word.
 */
import { CASE, STATUS_LABEL, SUMMARY, VISITORS } from '../data.js';
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const label = (s) => STATUS_LABEL[s] ?? s;
export const meta = { id: 'd17', name: 'Constellation', tagline: 'The cluster is the unit of evidence — IPs that share a fingerprint or a campaign are drawn linked, and a dense knot reads as a farm before you read a word.', idea: 'Replaces the visitor with the relationship. A lone node is innocent by its shape.' };

const seed = (ip) => ip.split('.').reduce((a, b) => a + Number(b), 0);
const pos = (v, i) => ({ x: 12 + ((seed(v.ip) * 13 + i * 29) % 76), y: 14 + ((seed(v.ip) * 7 + i * 43) % 68) });

export const list = () => {
  const nodes = VISITORS.map((v, i) => ({ v, ...pos(v, i) }));
  const edges = [];
  nodes.forEach((a, i) => nodes.slice(i + 1).forEach((b) => {
    if (a.v.status === 'blocked' && b.v.status === 'blocked' && Math.abs(a.v.confidence - b.v.confidence) < 5) edges.push([a, b]);
  }));
  return `
  <header class="d17-head"><h1>Related by evidence</h1>
    <p>Lines join visitors that share a device fingerprint, a campaign or a subnet. Fraud is rarely one address — it is a shape.</p>
    <div class="d17-stats">${SUMMARY.map((s) => `<span><b>${esc(s.value)}</b>${esc(s.label)}</span>`).join('')}</div></header>
  <div class="d17-field">
    <svg class="d17-edges" viewBox="0 0 100 100" preserveAspectRatio="none">
      ${edges.map(([a, b]) => `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" />`).join('')}
    </svg>
    ${nodes.map(({ v, x, y }) => `
      <span class="d17-node d17-node--${v.status}" style="--x:${x}%;--y:${y}%;--r:${18 + v.visits}px">
        <i></i><b>${esc(v.ip)}</b><em>${esc(v.city)} · ${v.visits} visits</em>
      </span>`).join('')}
    <span class="d17-key">node size = visits · line = shared fingerprint or campaign</span>
  </div>
  <table class="d17-tbl"><thead><tr><th>Node</th><th>Cluster</th><th>Status</th><th>Why</th></tr></thead><tbody>
    ${VISITORS.map((v) => `<tr><td class="d17-ip">${esc(v.ip)}</td><td>${v.status === 'blocked' ? 'datacenter knot' : v.status === 'ambiguous' ? 'isolated' : 'isolated'}</td><td><span class="d17-st d17-st--${v.status}">${esc(label(v.status))}</span></td><td class="d17-why">${esc(v.why)}</td></tr>`).join('')}
  </tbody></table>`;
};

export const detail = () => `
  <header class="d17-head d17-head--detail"><h1>${esc(CASE.ip)}</h1><p>${esc(CASE.city)}, ${esc(CASE.country)} · <span class="d17-st d17-st--blocked">${esc(label(CASE.status))}</span></p></header>
  <div class="d17-field d17-field--solo">
    <svg class="d17-edges" viewBox="0 0 100 100" preserveAspectRatio="none">
      ${CASE.visits.map((_, i) => `<line x1="50" y1="50" x2="${24 + i * 13}" y2="${20 + (i % 2) * 58}" class="hot" />`).join('')}
    </svg>
    <span class="d17-node d17-node--blocked d17-node--hub" style="--x:50%;--y:50%;--r:64px"><i></i><b>${esc(CASE.ip)}</b><em>29 arrivals</em></span>
    ${CASE.visits.map((v, i) => `<span class="d17-node d17-node--visit ${v.decisive ? 'is-decisive' : ''}" style="--x:${24 + i * 13}%;--y:${20 + (i % 2) * 58}%;--r:26px"><i></i><b>visit ${v.n}</b><em>${v.confidence}%</em></span>`).join('')}
    <span class="d17-key">edges = the same browser fingerprint, reappearing as a “new” session</span>
  </div>
  <p class="d17-verdict">${esc(CASE.verdict)}</p>
  <dl class="d17-facts">${CASE.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
  <div class="d17-log">${CASE.visits.map((v) => `
    <section class="d17-ev ${v.decisive ? 'is-decisive' : ''}">
      <div class="d17-ev__h"><b>visit ${v.n}</b><span>${esc(v.time)} · ${esc(v.tag)} · ${esc(v.cost)}</span><em>${v.confidence}%</em></div>
      <ul class="d17-sig">${v.signals.map((s) => `<li class="sev-${s.sev}"><span>${esc(s.l)}</span><b>${esc(s.v)}</b></li>`).join('')}</ul>
      <p>${esc(v.note)}</p></section>`).join('')}
    <p class="d17-trailing">${esc(CASE.trailing)}</p></div>`;
