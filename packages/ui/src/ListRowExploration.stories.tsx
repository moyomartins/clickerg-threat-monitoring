import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { StatusPill, type VisitorStatus } from './StatusPill';
import { EyeIcon, EyeOffIcon } from './VisitorScanRow';
import './listRowExploration.css';

/**
 * Ten mobile List-row layouts, for review only.
 *
 * Nothing here is wired into the product: the rows are exploration-only markup
 * so that the open state can be shown without also rendering the evidence
 * panel, which is out of scope. Status pill, eye icons, tokens and data shape
 * are the production ones.
 *
 * Every option carries the same content contract , status, IP, location, eye ,
 * and the same control semantics. What varies is layout, hierarchy, density,
 * alignment, borders, grouping and row rhythm.
 */

const meta = {
  title: 'Explorations/Mobile list row',
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'desktop' },
    docs: { description: { component: 'Design exploration. Not production. Each option is shown at 320px and 390px against the same visitor set.' } },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

/* One dataset for every option, so the comparison is fair. It covers all four
   statuses plus the two content shapes that break narrow layouts. */
interface Row { status: VisitorStatus; ip: string; location: string }

const ROWS: Row[] = [
  { status: 'blocked', ip: '192.0.2.51', location: 'Toronto, Canada' },
  { status: 'allowed', ip: '203.0.113.4', location: 'Glasgow, United Kingdom' },
  { status: 'review', ip: '198.51.100.7', location: 'Lisbon, Portugal' },
  { status: 'ambiguous', ip: '203.0.113.6', location: 'Dublin, Ireland' },
  { status: 'blocked', ip: '2001:0db8:85a3:0000:0000:8a2e:0370:7334', location: 'Frankfurt, Germany' },
  { status: 'blocked', ip: '192.0.2.42', location: 'Ho Chi Minh City, Socialist Republic of Vietnam' },
];

/* The third row demonstrates the open control. The panel it would reveal is
   deliberately not rendered , the expanded evidence is out of scope here. */
const OPEN_INDEX = 2;

const UNSETTLED: VisitorStatus[] = ['review', 'ambiguous', 'incomplete'];
const VERDICT: Record<VisitorStatus, string> = {
  blocked: 'Blocked',
  allowed: 'Not blocked',
  review: 'Under review',
  ambiguous: 'Judgement call',
  incomplete: 'Incomplete data',
};

function Eye({ row, open }: { row: Row; open: boolean }) {
  const [expanded, setExpanded] = useState(open);
  const panelId = `cgx-evidence-${row.ip.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
  return (
    <button
      type="button"
      className="cgx-eye cg-focusable"
      aria-expanded={expanded}
      aria-controls={panelId}
      aria-label={`${expanded ? 'Hide' : 'Show'} evidence for ${row.ip}`}
      onClick={(event) => {
        event.stopPropagation();
        setExpanded((v) => !v);
      }}
    >
      {expanded ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  );
}

/* `aria-controls` must resolve to a real element once `aria-expanded` is true ,
   axe allows a missing target only while collapsed. The expanded evidence is
   out of scope for this exploration, so the open row gets an empty, hidden
   target: the reference stays valid and nothing is drawn or redesigned. */
function EvidenceTarget({ ip }: { ip: string }) {
  return <div id={`cgx-evidence-${ip.replace(/[^a-zA-Z0-9_-]/g, '-')}`} hidden />;
}

/** The ten layouts. Only the inner composition differs; the contract does not. */
function OptionRow({ option, row, open }: { option: number; row: Row; open: boolean }) {
  const pill = <StatusPill status={row.status} />;
  const ip = <b className="cgx-ip">{row.ip}</b>;
  const loc = <small className="cgx-loc">{row.location}</small>;
  const main = (children: React.ReactNode) => (
    <button type="button" className="cgx-main cg-focusable" aria-label={`Open ${row.ip}`}>{children}</button>
  );

  let body: React.ReactNode;
  switch (option) {
    case 1:
      body = main(<><span className="cgx-status">{pill}</span><span className="cgx-id">{ip}{loc}</span></>);
      break;
    case 2:
      body = main(<><span className="cgx-line">{ip}<span className="cgx-status">{pill}</span></span>{loc}</>);
      break;
    case 3:
      body = main(<><span className="cgx-status">{pill}</span><span className="cgx-id">{ip}{loc}</span></>);
      break;
    case 4:
      body = main(<>{ip}<span className="cgx-status">{pill}</span>{loc}</>);
      break;
    case 5:
      body = main(<><span className="cgx-line">{pill}{ip}</span>{loc}</>);
      break;
    case 6:
      body = main(<><span className="cgx-status">{pill}</span>{ip}{loc}</>);
      break;
    case 7:
      body = main(<><span className="cgx-status">{pill}</span><span className="cgx-id">{ip}{loc}</span></>);
      break;
    case 8:
      body = main(<><span className="cgx-line">{pill}{ip}</span>{loc}</>);
      break;
    case 9:
      body = main(
        <>
          <span className={`cgx-verdict ${UNSETTLED.includes(row.status) ? 'cgx-verdict--unsettled' : `cgx-verdict--${row.status}`}`}>
            {VERDICT[row.status]}
          </span>
          {ip}
          {loc}
        </>,
      );
      break;
    default:
      body = main(<>{pill}{ip}{loc}</>);
  }

  return (
    <article className={`cgx-row cgx-row--${option} cgx-row--${row.status}`}>
      {body}
      <Eye row={row} open={open} />
      <EvidenceTarget ip={row.ip} />
    </article>
  );
}

function Frame({ width, option }: { width: number; option: number }) {
  return (
    <div className="cgx-frame">
      <span className="cgx-frame__label">{width}px</span>
      <div className="cgx-frame__viewport" style={{ width }}>
        <div className={`cgx-list cgx-list--${option}`}>
          {ROWS.map((row, i) => (
            <OptionRow key={row.ip} option={option} row={row} open={i === OPEN_INDEX} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Option({ n, name, note }: { n: number; name: string; note: React.ReactNode }) {
  return (
    <section className="cgx-option" data-option={n}>
      <div className="cgx-option__head">
        <h3 className="cgx-option__name">{n}. {name}</h3>
        <p className="cgx-option__note">{note}</p>
      </div>
      <div className="cgx-frames">
        <Frame width={320} option={n} />
        <Frame width={390} option={n} />
      </div>
    </section>
  );
}

const OPTIONS: { n: number; name: string; note: React.ReactNode }[] = [
  { n: 1, name: 'Stacked, ruled control column', note: <><b>Hierarchy:</b> verdict, then identity, then place, each on its own line, with the control separated by a full-height rule. <b>Tradeoff:</b> the tallest of the compact options , the rule buys an unmistakable tap zone but costs a row of density.</> },
  { n: 2, name: 'Identity line, status trailing', note: <><b>Hierarchy:</b> the address leads and the verdict trails it on the same line, so one column of addresses reads straight down. <b>Tradeoff:</b> a long IPv6 address pushes the pill onto its own line, so the verdict's position is not perfectly stable.</> },
  { n: 3, name: 'Leading status column', note: <><b>Hierarchy:</b> three fixed zones , what it is, who it is, what you can do , aligned on one baseline. <b>Tradeoff:</b> the pill's variable width makes the identity column start in a different place on every row.</> },
  { n: 4, name: 'Identity first, verdict top-right', note: <><b>Hierarchy:</b> the address is the headline and the verdict sits where the eye lands after reading it. <b>Tradeoff:</b> status is the last thing scanned, which inverts the job when the reader is hunting for blocked visitors.</> },
  { n: 5, name: 'Two-line compressed', note: <><b>Hierarchy:</b> verdict and address share the first line, place sits under it; the tightest padding in the set. <b>Tradeoff:</b> highest density, least breathing room , a long IP and a pill compete for the same line.</> },
  { n: 6, name: 'Three-line, long-location first', note: <><b>Hierarchy:</b> every field gets its own line and wraps on word boundaries rather than mid-word. <b>Tradeoff:</b> the most resilient to long place names and the least dense; the only option where a two-line location changes nothing else.</> },
  { n: 7, name: 'Divider-led, no card', note: <><b>Hierarchy:</b> the list is a continuous run of hairlines rather than a stack of cards; blocked rows take the strong rule weight. <b>Tradeoff:</b> removes 2px of frame per row and reads fast, but the row's tap boundary is implied rather than drawn.</> },
  { n: 8, name: 'Grouped, toned control', note: <><b>Hierarchy:</b> as option 5, but the control takes the frame tone and a rule so it groups to the row instead of floating in it. <b>Tradeoff:</b> the strongest affordance for the eye toggle; the tone adds a second surface value per row.</> },
  { n: 9, name: 'Editorial scale, no chips', note: <><b>Hierarchy:</b> typography ranks the row , tracked label, mono-lead address, quiet caption , with no pill and no inner container. Unsettled calls stay italic and grey, the way this system already keeps a judgement call honest. <b>Tradeoff:</b> loses the pill's shape recognition, so status is read rather than spotted.</> },
  { n: 10, name: 'Dense operational', note: <><b>Hierarchy:</b> one fixed-height line per visitor, verdict then address then place, location truncated to the right. <b>Tradeoff:</b> by far the most rows per screen, and the only option that deliberately loses text , long place names are cut, and a long IPv6 address ellipsises.</> },
];

export const AllTenOptions: Story = {
  name: 'All ten options',
  render: () => (
    <div className="cg-root" style={{ padding: 'var(--cg-space-3)', background: 'var(--cg-surface)' }}>
      {OPTIONS.map((o) => <Option key={o.n} {...o} />)}
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Ten distinct layouts, each with the full comparison set.
    await expect(canvasElement.querySelectorAll('[data-option]')).toHaveLength(10);

    for (const section of canvasElement.querySelectorAll<HTMLElement>('[data-option]')) {
      const n = section.dataset.option;
      // Both review widths, six rows each.
      await expect(section.querySelectorAll('.cgx-frame')).toHaveLength(2);
      await expect(section.querySelectorAll('.cgx-row')).toHaveLength(12);

      // Exactly one row per width demonstrates the open control.
      await expect(section.querySelectorAll('[aria-expanded="true"]')).toHaveLength(2);

      for (const frame of section.querySelectorAll<HTMLElement>('.cgx-frame__viewport')) {
        const limit = Math.ceil(frame.getBoundingClientRect().right);
        // Nothing reaches past its own viewport, at 320px or 390px.
        await expect(frame.scrollWidth).toBeLessThanOrEqual(frame.clientWidth + 1);
        const offenders: string[] = [];
        for (const el of frame.querySelectorAll<HTMLElement>('*')) {
          const box = el.getBoundingClientRect();
          if (box.width === 0) continue;
          if (box.right > limit + 1) {
            offenders.push(`opt${n}@${frame.clientWidth} ${el.tagName}.${el.className} r=${Math.round(box.right)}/${limit}`);
          }
        }
        await expect(offenders.join(' | ')).toBe('');
      }

      for (const eye of section.querySelectorAll<HTMLElement>('.cgx-eye')) {
        const box = eye.getBoundingClientRect();
        // The control stays a full target however long the text beside it grows.
        await expect(box.width).toBeGreaterThanOrEqual(44);
        await expect(box.height).toBeGreaterThanOrEqual(44);
        await expect(eye).toHaveAttribute('aria-controls');
        await expect(eye.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
      }

      // The content contract holds: no desktop fact has crept back in.
      const text = section.textContent ?? '';
      for (const banned of ['Bot probability', 'Paid clicks', 'Spend', 'Last seen', '%', '£', 'ago']) {
        await expect(text.includes(banned), `option ${n} leaked "${banned}"`).toBe(false);
      }
    }

    // All four statuses are represented, so recognition can be compared.
    for (const label of ['Blocked', 'Not blocked', 'Under review', 'Judgement call']) {
      await expect(within(canvasElement).getAllByText(label).length).toBeGreaterThan(0);
    }
  },
};

/* Each option also stands alone in the sidebar, so a single direction can be
   reviewed without the other nine in peripheral vision. */
function single(n: number): Story {
  const option = OPTIONS.find((o) => o.n === n)!;
  return {
    name: `${n}. ${option.name}`,
    render: () => (
      <div className="cg-root" style={{ padding: 'var(--cg-space-3)', background: 'var(--cg-surface)' }}>
        <Option {...option} />
      </div>
    ),
    play: async ({ canvasElement }) => {
      const section = canvasElement.querySelector('[data-option]') as HTMLElement;
      await expect(section.dataset.option).toBe(String(n));
      await expect(section.querySelectorAll('.cgx-row')).toHaveLength(12);
      for (const frame of section.querySelectorAll<HTMLElement>('.cgx-frame__viewport')) {
        await expect(frame.scrollWidth).toBeLessThanOrEqual(frame.clientWidth + 1);
      }
    },
  };
}

export const Option01: Story = single(1);
export const Option02: Story = single(2);
export const Option03: Story = single(3);
export const Option04: Story = single(4);
export const Option05: Story = single(5);
export const Option06: Story = single(6);
export const Option07: Story = single(7);
export const Option08: Story = single(8);
export const Option09: Story = single(9);
export const Option10: Story = single(10);
