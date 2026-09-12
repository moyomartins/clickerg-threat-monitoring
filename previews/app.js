import { CASE, DIRECTIONS, STATUS_LABEL, SUMMARY, VISITORS } from './data.js';
import { EXTRA_DIRECTIONS, EXTRA_RENDER } from './directions/index.js';

const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const label = (s) => STATUS_LABEL[s] ?? s;
const sevPct = (n) => `${n}%`;

/* ------------------------------------------------ 1 · Safelight Bay ------ */
/* Contact-sheet grid. Detail is full-bleed; the journey hangs on a drying line. */
const d1 = {
  list: () => `
    <header class="d1-head">
      <div class="d1-brand">ClickerG<span>Threat monitoring</span></div>
      <div class="d1-safelight">SAFELIGHT ON · BAY 2</div>
    </header>
    <h1 class="d1-title">Every click, developed.</h1>
    <p class="d1-lede">Fifty-three visitors came out of the bath this week. Thirteen are on your exclusion list. Open any print to see how the image formed.</p>
    <div class="d1-stats">${SUMMARY.map((s) => `<div><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join('')}</div>
    <div class="d1-sheet">
      ${VISITORS.map((v) => `
        <article class="d1-print d1-print--${v.status}">
          <div class="d1-print__frame">
            <div class="d1-print__exposure" style="--exp:${v.confidence}%"></div>
            <span class="d1-print__stat">${esc(label(v.status))}</span>
          </div>
          <div class="d1-print__caption">
            <b>${esc(v.ip)}</b>
            <span>${esc(v.city)}, ${esc(v.country)}</span>
            <p>${esc(v.why)}</p>
            <dl><dt>Visits</dt><dd>${v.visits}</dd><dt>Spend</dt><dd>${esc(v.spend)}</dd><dt>Last</dt><dd>${esc(v.seen)}</dd></dl>
            ${v.pinned ? `<em class="d1-pin">${esc(v.pinned)}</em>` : ''}
          </div>
        </article>`).join('')}
    </div>`,
  detail: () => `
    <header class="d1-head"><div class="d1-brand">ClickerG<span>Threat monitoring</span></div><div class="d1-safelight">PRINT 41.203.88.7</div></header>
    <div class="d1-detail">
      <div class="d1-detail__lead">
        <span class="d1-stat-big">Blocked</span>
        <h1 class="d1-title">${esc(CASE.ip)}</h1>
        <p class="d1-place">${esc(CASE.city)}, ${esc(CASE.country)}</p>
        <p class="d1-verdict">${esc(CASE.verdict)}</p>
      </div>
      <dl class="d1-facts">${CASE.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    </div>
    <div class="d1-line">
      <span class="d1-line__wire"></span>
      ${CASE.visits.map((v) => `
        <article class="d1-hang ${v.decisive ? 'is-decisive' : ''}">
          <span class="d1-peg"></span>
          <div class="d1-hang__body">
            <span class="d1-hang__n">EXP ${String(v.n).padStart(2, '0')}${v.decisive ? ' · FIXED' : ''}</span>
            <b>${esc(v.time)}</b>
            <span class="d1-hang__src">${esc(v.tag)} · ${esc(v.cost)}<br>${esc(v.source)}</span>
            <ul class="d1-sig">${v.signals.map((s) => `<li class="sev-${s.sev}"><span>${esc(s.l)}</span><b>${esc(s.v)}</b></li>`).join('')}</ul>
            <p class="d1-note">${esc(v.note)}</p>
            <div class="d1-dens"><span style="--exp:${v.confidence}%"></span><em>${sevPct(v.confidence)} density</em></div>
          </div>
        </article>`).join('')}
    </div>
    <p class="d1-trailing">${esc(CASE.trailing)}</p>`,
};

/* --------------------------------------------- 2 · Developer Console ----- */
/* Dense table, split-pane detail, syntax-derived accents, hairline seams.   */
const d2 = {
  list: () => `
    <div class="d2-chrome"><span class="d2-dot"></span>clickerg · threat-monitoring — 53 visitors</div>
    <div class="d2-body">
      <aside class="d2-rail">
        <div class="d2-rail__grp">VIEWS</div>
        <a class="is-on">all visitors<i>53</i></a><a>blocked<i>13</i></a><a>under review<i>10</i></a><a>judgement<i>1</i></a><a>incomplete<i>1</i></a>
        <div class="d2-rail__grp">SPEND</div>
        <a>behind blocks<i>£979</i></a><a>paid clicks<i>306</i></a>
      </aside>
      <main class="d2-main">
        <div class="d2-filters"><input value="ip:* status:*" spellcheck="false"><button>run</button></div>
        <table class="d2-table">
          <thead><tr><th></th><th>status</th><th>ip</th><th>location</th><th>visits</th><th>spend</th><th>conf</th><th>why</th></tr></thead>
          <tbody>
            ${VISITORS.map((v, i) => `
              <tr class="${v.ip === CASE.ip ? 'is-sel' : ''}">
                <td class="d2-ln">${String(i + 1).padStart(2, '0')}</td>
                <td><span class="d2-tag d2-tag--${v.status}">${esc(label(v.status))}</span></td>
                <td class="d2-ip">${esc(v.ip)}</td>
                <td>${esc(v.city)}<em>${esc(v.country)}</em></td>
                <td>${v.visits}<em>${v.paid}p·${v.free}f</em></td>
                <td class="d2-num">${esc(v.spend)}</td>
                <td class="d2-num d2-conf" data-hot="${v.confidence >= 80}">${v.confidence}</td>
                <td class="d2-why">${esc(v.why)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </main>
    </div>`,
  detail: () => `
    <div class="d2-chrome"><span class="d2-dot"></span>clickerg · 41.203.88.7 — blocked</div>
    <div class="d2-body d2-body--split">
      <main class="d2-main d2-main--narrow">
        <table class="d2-table d2-table--tight">
          <tbody>${VISITORS.map((v, i) => `<tr class="${v.ip === CASE.ip ? 'is-sel' : ''}"><td class="d2-ln">${String(i + 1).padStart(2, '0')}</td><td class="d2-ip">${esc(v.ip)}</td><td><span class="d2-tag d2-tag--${v.status}">${esc(label(v.status))}</span></td></tr>`).join('')}</tbody>
        </table>
      </main>
      <section class="d2-pane">
        <h1>${esc(CASE.ip)} <span class="d2-tag d2-tag--blocked">Blocked</span></h1>
        <p class="d2-place">${esc(CASE.city)}, ${esc(CASE.country)}</p>
        <pre class="d2-verdict">${esc(CASE.verdict)}</pre>
        <dl class="d2-facts">${CASE.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
        <div class="d2-log">
          ${CASE.visits.map((v) => `
            <details class="d2-entry ${v.decisive ? 'is-decisive' : ''}" ${v.decisive ? 'open' : 'open'}>
              <summary><i>${String(v.n).padStart(2, '0')}</i><b>${esc(v.time)}</b><span>${esc(v.tag)} ${esc(v.cost)}</span><em data-hot="${v.confidence >= 80}">${sevPct(v.confidence)}</em>${v.decisive ? '<mark>BLOCK</mark>' : ''}</summary>
              <div class="d2-entry__body">
                <p class="d2-src">${esc(v.source)}</p>
                <ul class="d2-sig">${v.signals.map((s) => `<li class="sev-${s.sev}"><span>${esc(s.l)}</span><b>${esc(s.v)}</b></li>`).join('')}</ul>
                <p class="d2-note">${esc(v.note)}</p>
              </div>
            </details>`).join('')}
          <p class="d2-trailing">${esc(CASE.trailing)}</p>
        </div>
      </section>
    </div>`,
};

/* ------------------------------------------------ 3 · Notation Score ----- */
/* Timeline-first: each visitor is a vertical staff, read upward.           */
const d3 = {
  list: () => `
    <header class="d3-head"><h1>Threat<br>Monitoring</h1><p>Fifty-three visitors, scored. Each column is one journey, read from the ground upward. Height is visit count; the filled bar is where confidence crossed the line.</p></header>
    <div class="d3-score">
      <div class="d3-gutter"><span>99</span><span>75</span><span>50</span><span>25</span><span>0</span></div>
      <div class="d3-staves">
        ${VISITORS.map((v) => `
          <div class="d3-stave d3-stave--${v.status}">
            <div class="d3-col">
              <span class="d3-bar" style="--h:${v.confidence}%"></span>
              ${v.confidence >= 80 ? '<span class="d3-cross"></span>' : ''}
              <span class="d3-ticks">${Array.from({ length: Math.min(v.visits, 14) }, () => '<i></i>').join('')}</span>
            </div>
            <div class="d3-foot">
              <b>${esc(v.ip)}</b>
              <span>${esc(v.city)}</span>
              <em class="d3-st">${esc(label(v.status))}</em>
              <span class="d3-num">${v.visits} vis · ${esc(v.spend)}</span>
            </div>
          </div>`).join('')}
      </div>
    </div>
    <p class="d3-key"><b>Key</b> — bar height is confidence · tick column is visits · a doubled rule marks the blocking threshold at 80</p>`,
  detail: () => `
    <header class="d3-head d3-head--detail"><h1>${esc(CASE.ip)}</h1><p class="d3-st d3-st--big">${esc(label(CASE.status))} · ${esc(CASE.city)}, ${esc(CASE.country)}</p></header>
    <p class="d3-verdict">${esc(CASE.verdict)}</p>
    <div class="d3-read">
      <div class="d3-staff">
        ${[...CASE.visits].reverse().map((v) => `
          <div class="d3-measure ${v.decisive ? 'is-decisive' : ''}">
            <span class="d3-measure__n">${String(v.n).padStart(2, '0')}</span>
            <span class="d3-measure__sym" style="--h:${v.confidence}%"></span>
            <div class="d3-measure__txt">
              <b>${esc(v.time)}</b>
              <span>${esc(v.tag)} · ${esc(v.cost)} · ${esc(v.source)}</span>
              <ul class="d3-sig">${v.signals.map((s) => `<li class="sev-${s.sev}">${esc(s.l)} <b>${esc(s.v)}</b></li>`).join('')}</ul>
              <p>${esc(v.note)}</p>
              <em>Confidence ${sevPct(v.confidence)}${v.decisive ? ' — threshold crossed, blocked here' : ''}</em>
            </div>
          </div>`).join('')}
      </div>
      <aside class="d3-facts">${CASE.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}<p>${esc(CASE.trailing)}</p></aside>
    </div>`,
};

/* ------------------------------------------------- 4 · Emission Rail ----- */
/* Everything registers to one off-centre rail; state is line weight, not hue. */
const d4 = {
  list: () => `
    <header class="d4-head"><span class="d4-kicker">CLICKERG / THREAT MONITORING</span><h1>53 visitors on the plate</h1><div class="d4-stats">${SUMMARY.map((s) => `<span><b>${esc(s.value)}</b>${esc(s.label)}</span>`).join('')}</div></header>
    <div class="d4-plate">
      <span class="d4-rail"></span>
      ${VISITORS.map((v) => `
        <div class="d4-row d4-row--${v.status}">
          <div class="d4-left"><b>${esc(v.ip)}</b><span>${esc(v.city)}, ${esc(v.country)}</span></div>
          <div class="d4-right">
            <div class="d4-spectrum">${v.signalsLine ?? Array.from({ length: 7 }, (_, i) => `<i style="--x:${(i * 13 + v.confidence) % 100}%;--w:${i === 3 ? 2 : 1}px"></i>`).join('')}</div>
            <div class="d4-meta"><em>${esc(label(v.status))}</em><span>${v.visits} visits · ${v.paid} paid</span><span>${esc(v.spend)}</span><span class="d4-conf">${v.confidence}</span></div>
            <p>${esc(v.why)}</p>
          </div>
        </div>`).join('')}
    </div>`,
  detail: () => `
    <header class="d4-head"><span class="d4-kicker">CLICKERG / SPECIMEN</span><h1>${esc(CASE.ip)}</h1></header>
    <div class="d4-plate d4-plate--dim">
      <span class="d4-rail"></span>
      ${VISITORS.slice(0, 6).map((v) => `<div class="d4-row d4-row--${v.status}"><div class="d4-left"><b>${esc(v.ip)}</b><span>${esc(v.city)}</span></div><div class="d4-right"><div class="d4-meta"><em>${esc(label(v.status))}</em><span class="d4-conf">${v.confidence}</span></div></div></div>`).join('')}
    </div>
    <aside class="d4-drawer">
      <div class="d4-drawer__head"><span class="d4-kicker">DRAWER / ${esc(CASE.ip)}</span><em>${esc(label(CASE.status))}</em></div>
      <p class="d4-verdict">${esc(CASE.verdict)}</p>
      <dl class="d4-facts">${CASE.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      ${CASE.visits.map((v) => `
        <section class="d4-entry ${v.decisive ? 'is-decisive' : ''}">
          <div class="d4-entry__head"><b>${String(v.n).padStart(2, '0')}</b><span>${esc(v.time)}</span><em>${sevPct(v.confidence)}</em></div>
          <div class="d4-spectrum d4-spectrum--wide">${v.signals.map((s, i) => `<i class="sev-${s.sev}" style="--x:${8 + i * 12}%"></i>`).join('')}</div>
          <ul class="d4-sig">${v.signals.map((s) => `<li class="sev-${s.sev}"><span>${esc(s.l)}</span><b>${esc(s.v)}</b></li>`).join('')}</ul>
          <p>${esc(v.note)}</p>
          ${v.decisive ? '<div class="d4-block">THRESHOLD CROSSED — ADDED TO EXCLUSION LIST</div>' : ''}
        </section>`).join('')}
      <p class="d4-trailing">${esc(CASE.trailing)}</p>
    </aside>`,
};

/* ---------------------------------------------- 5 · Orizuru Sequence ----- */
/* Washi sheets; the journey is a fold sequence, flat geometry becoming form. */
const d5 = {
  list: () => `
    <header class="d5-head"><span class="d5-mark">折</span><div><h1>Threat monitoring</h1><p>Fifty-three sheets. Each visitor begins flat and takes its shape one fold at a time; thirteen have finished folding.</p></div></header>
    <div class="d5-stats">${SUMMARY.map((s) => `<div><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join('')}</div>
    <div class="d5-grid">
      ${VISITORS.map((v) => `
        <article class="d5-sheet d5-sheet--${v.status}">
          <div class="d5-crease" style="--folds:${Math.min(v.visits, 12)}"></div>
          <b class="d5-ip">${esc(v.ip)}</b>
          <span class="d5-loc">${esc(v.city)}, ${esc(v.country)}</span>
          <span class="d5-state">${esc(label(v.status))}</span>
          <p>${esc(v.why)}</p>
          <div class="d5-foot"><span>${v.visits} folds</span><span>${esc(v.spend)}</span><span>${v.confidence}%</span></div>
          ${v.pinned ? `<em class="d5-pin">${esc(v.pinned)}</em>` : ''}
        </article>`).join('')}
    </div>`,
  detail: () => `
    <header class="d5-head d5-head--detail"><span class="d5-mark">折</span><div><h1>${esc(CASE.ip)}</h1><p>${esc(CASE.city)}, ${esc(CASE.country)} · <span class="d5-state">${esc(label(CASE.status))}</span></p></div></header>
    <p class="d5-verdict">${esc(CASE.verdict)}</p>
    <dl class="d5-facts">${CASE.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    <div class="d5-seq">
      ${CASE.visits.map((v) => `
        <section class="d5-fold ${v.decisive ? 'is-decisive' : ''}">
          <div class="d5-fold__num">${String(v.n).padStart(2, '0')}<span>fold</span></div>
          <div class="d5-fold__sheet" style="--turn:${v.confidence}">
            <b>${esc(v.time)}</b>
            <span class="d5-fold__src">${esc(v.tag)} · ${esc(v.cost)} · ${esc(v.source)}</span>
            <ul class="d5-sig">${v.signals.map((s) => `<li class="sev-${s.sev}"><span>${esc(s.l)}</span><b>${esc(s.v)}</b></li>`).join('')}</ul>
            <p>${esc(v.note)}</p>
            <div class="d5-turn"><span style="--t:${v.confidence}%"></span><em>${sevPct(v.confidence)}</em></div>
            ${v.decisive ? '<div class="d5-locked">The shape held here — blocked.</div>' : ''}
          </div>
        </section>`).join('')}
    </div>
    <p class="d5-trailing">${esc(CASE.trailing)}</p>`,
};

/* ----------------------------------------------- 6 · Iridescent Edge ----- */
/* Pale diffraction bands; severity is spectral position. Modal detail.      */
const d6 = {
  list: () => `
    <header class="d6-head"><h1>Threat monitoring</h1><p>Fifty-three visitors this week. Severity reads as position in the band — the further along the spectrum a row sits, the harder the evidence.</p>
    <div class="d6-stats">${SUMMARY.map((s) => `<div><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join('')}</div></header>
    <div class="d6-list">
      ${VISITORS.map((v) => `
        <article class="d6-band d6-band--${v.status}" style="--c:${v.confidence}">
          <div class="d6-band__edge"></div>
          <div class="d6-band__main">
            <div class="d6-band__id"><b>${esc(v.ip)}</b><span>${esc(v.city)}, ${esc(v.country)}</span></div>
            <span class="d6-state">${esc(label(v.status))}</span>
            <p>${esc(v.why)}</p>
          </div>
          <div class="d6-band__num"><span>${v.visits}<em>visits</em></span><span>${esc(v.spend)}<em>spend</em></span><span>${v.confidence}%<em>confidence</em></span></div>
        </article>`).join('')}
    </div>`,
  detail: () => `
    <div class="d6-behind">
      <header class="d6-head"><h1>Threat monitoring</h1></header>
      <div class="d6-list">${VISITORS.slice(0, 5).map((v) => `<article class="d6-band d6-band--${v.status}" style="--c:${v.confidence}"><div class="d6-band__edge"></div><div class="d6-band__main"><div class="d6-band__id"><b>${esc(v.ip)}</b><span>${esc(v.city)}</span></div><span class="d6-state">${esc(label(v.status))}</span></div></article>`).join('')}</div>
    </div>
    <div class="d6-scrim"></div>
    <div class="d6-modal" role="dialog" aria-label="Visitor detail">
      <div class="d6-modal__edge"></div>
      <div class="d6-modal__in">
        <div class="d6-modal__head"><div><b>${esc(CASE.ip)}</b><span>${esc(CASE.city)}, ${esc(CASE.country)}</span></div><span class="d6-state d6-state--blocked">${esc(label(CASE.status))}</span></div>
        <p class="d6-verdict">${esc(CASE.verdict)}</p>
        <dl class="d6-facts">${CASE.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
        <div class="d6-journey">
          ${CASE.visits.map((v) => `
            <section class="d6-visit ${v.decisive ? 'is-decisive' : ''}" style="--c:${v.confidence}">
              <div class="d6-visit__edge"></div>
              <div class="d6-visit__in">
                <div class="d6-visit__head"><b>${String(v.n).padStart(2, '0')} · ${esc(v.time)}</b><span>${esc(v.tag)} · ${esc(v.cost)}</span><em>${sevPct(v.confidence)}</em></div>
                <p class="d6-src">${esc(v.source)}</p>
                <ul class="d6-sig">${v.signals.map((s) => `<li class="sev-${s.sev}"><span>${esc(s.l)}</span><b>${esc(s.v)}</b></li>`).join('')}</ul>
                <p>${esc(v.note)}</p>
                ${v.decisive ? '<div class="d6-blocked">Blocked at this visit</div>' : ''}
              </div>
            </section>`).join('')}
          <p class="d6-trailing">${esc(CASE.trailing)}</p>
        </div>
      </div>
    </div>`,
};

const RENDER = { d1, d2, d3, d4, d5, d6, ...EXTRA_RENDER };
/** 1–6 ship from this file; 7–12 register themselves from ./directions/. */
const ALL = [...DIRECTIONS, ...EXTRA_DIRECTIONS];

/* -------------------------------------------------------- the switcher --- */

const stage = document.getElementById('stage');
const tabs = document.getElementById('tabs');
const meta = document.getElementById('meta');
const viewBtns = [...document.querySelectorAll('[data-view]')];

let current = 'd1';
let view = 'list';

function paint() {
  const dir = ALL.find((d) => d.id === current);
  stage.className = `stage ${current}`;
  stage.innerHTML = RENDER[current][view]();
  meta.innerHTML = `<b>${esc(dir.name)}</b><span>${esc(dir.tagline)}</span>`;
  [...tabs.children].forEach((b) => b.setAttribute('aria-selected', String(b.dataset.dir === current)));
  viewBtns.forEach((b) => b.setAttribute('aria-selected', String(b.dataset.view === view)));
  stage.scrollTop = 0;
}

tabs.innerHTML = ALL.map((d, i) => `<button role="tab" data-dir="${d.id}"><i>${i + 1}</i>${esc(d.name)}</button>`).join('');
tabs.addEventListener('click', (e) => {
  const b = e.target.closest('[data-dir]');
  if (b) { current = b.dataset.dir; paint(); }
});
viewBtns.forEach((b) => b.addEventListener('click', () => { view = b.dataset.view; paint(); }));
window.addEventListener('keydown', (e) => {
  const i = ALL.findIndex((d) => d.id === current);
  const n = ALL.length;
  if (e.key === 'ArrowRight') { current = ALL[(i + 1) % n].id; paint(); }
  if (e.key === 'ArrowLeft') { current = ALL[(i + n - 1) % n].id; paint(); }
});

paint();
