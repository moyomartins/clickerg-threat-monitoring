/** 7 — Ledger Book. Wasted spend as a double-entry register on green bar paper. */
import { CASE, STATUS_LABEL, SUMMARY, VISITORS } from '../data.js';
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const label = (s) => STATUS_LABEL[s] ?? s;

export const meta = {
  id: 'd7', name: 'Ledger Book',
  tagline: 'Double-entry register on green bar paper — every blocked click posted as a debit, with a running total of spend recovered.',
};

let running = 0;
export const list = () => {
  running = 0;
  return `
  <header class="d7-head">
    <div><h1>Threat Monitoring Register</h1><p>Period ending 14 August 2025 · account ClickerG / paid search</p></div>
    <div class="d7-totals">${SUMMARY.map((s) => `<div><span>${esc(s.label)}</span><b>${esc(s.value)}</b></div>`).join('')}</div>
  </header>
  <table class="d7-book">
    <thead><tr><th class="d7-c">Entry</th><th>Account (IP)</th><th>Origin</th><th class="d7-n">Clicks</th><th class="d7-n">Debit</th><th class="d7-n">Balance</th><th>Determination</th><th>Memorandum</th></tr></thead>
    <tbody>
      ${VISITORS.map((v, i) => {
        const debit = Number(v.spend.replace(/[£,]/g, ''));
        if (v.status === 'blocked') running += debit;
        return `<tr class="d7-r d7-r--${v.status}">
          <td class="d7-c">${String(i + 1).padStart(4, '0')}</td>
          <td class="d7-acct">${esc(v.ip)}</td>
          <td>${esc(v.city)}, ${esc(v.country)}</td>
          <td class="d7-n">${v.visits} <em>(${v.paid} pd)</em></td>
          <td class="d7-n d7-debit">${esc(v.spend)}</td>
          <td class="d7-n d7-bal">${v.status === 'blocked' ? '£' + running.toFixed(2) : '—'}</td>
          <td><span class="d7-det d7-det--${v.status}">${esc(label(v.status))}</span></td>
          <td class="d7-memo">${esc(v.why)}</td>
        </tr>`;
      }).join('')}
      <tr class="d7-sum"><td colspan="4">Total recovered — spend behind blocked accounts</td><td class="d7-n"></td><td class="d7-n d7-bal">£${running.toFixed(2)}</td><td colspan="2"></td></tr>
    </tbody>
  </table>`;
};

export const detail = () => `
  <header class="d7-head d7-head--detail">
    <div><h1>Account Statement</h1><p>${esc(CASE.ip)} · ${esc(CASE.city)}, ${esc(CASE.country)} · <span class="d7-det d7-det--blocked">${esc(label(CASE.status))}</span></p></div>
  </header>
  <p class="d7-verdict">${esc(CASE.verdict)}</p>
  <dl class="d7-facts">${CASE.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
  <table class="d7-book d7-book--stmt">
    <thead><tr><th class="d7-c">Item</th><th>Date</th><th>Particulars</th><th class="d7-n">Debit</th><th class="d7-n">Running</th></tr></thead>
    <tbody>
      ${(() => { let r = 0; return CASE.visits.map((v) => { r += Number(v.cost.replace('£', ''));
        return `<tr class="${v.decisive ? 'd7-posted' : ''}">
          <td class="d7-c">${String(v.n).padStart(4, '0')}</td>
          <td>${esc(v.time)}</td>
          <td class="d7-part">
            <b>${esc(v.tag)}</b> — ${esc(v.source)}
            <ul class="d7-sig">${v.signals.map((s) => `<li class="sev-${s.sev}">${esc(s.l)}: <b>${esc(s.v)}</b></li>`).join('')}</ul>
            <p>${esc(v.note)}</p>
            <span class="d7-conf">Confidence carried forward: ${v.confidence}%${v.decisive ? ' — account closed, posted to exclusion list' : ''}</span>
          </td>
          <td class="d7-n d7-debit">${esc(v.cost)}</td>
          <td class="d7-n d7-bal">£${r.toFixed(2)}</td>
        </tr>`; }).join(''); })()}
      <tr class="d7-sum"><td colspan="3">${esc(CASE.trailing)}</td><td class="d7-n"></td><td class="d7-n d7-bal">£158.38</td></tr>
    </tbody>
  </table>`;
