import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ViewModeSwitch } from './ViewModeSwitch';
import { VisitorScanRow } from './VisitorScanRow';
import { TRAFFIC_CASES, TRAFFIC_RECORDS } from '../../../src/data/trafficRepository';
import { representativeBehaviour } from '../../../src/behaviour';
import { money, relative } from '../../../src/format';
import { supplementalEvidence } from '../../../src/supplementalEvidence';

const meta = { title: 'Components/Visitor views', parameters: { layout: 'padded' } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function SwitchDemo({ iconOnly = false }: { iconOnly?: boolean }) {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  return <ViewModeSwitch value={view} onChange={setView} iconOnly={iconOnly} />;
}
function ExpandableDemo() {
  const [open, setOpen] = useState(true);
  const latest = expandedVisitor.visits.at(-1)!;
  return <VisitorScanRow {...expandedRow} evidence={supplementalEvidence(expandedVisitor, TRAFFIC_RECORDS)} evidenceLayout={7} expanded={open} onToggle={() => setOpen(!open)} onOpen={() => {}}>
    <p>{latest.platform ?? latest.channel}, {latest.landingPage ?? 'Landing page not recorded'}, {latest.costGbp === undefined ? 'No paid click cost' : money(latest.costGbp)}</p>
  </VisitorScanRow>;
}
const base = { status: 'blocked' as const, ip: '192.0.2.52', location: 'Sao Paulo, Brazil', summary: 'Three paid clicks before the decision, no engagement on any.', confidence: '93%', paid: '10', spend: '£56.22', lastSeen: '46m ago', source: 'uk-brand-exact', replay: { scrollPct: 0, dwellSec: 2, clicks: 0, mouseMoves: 0 } };
const expandedVisitor = TRAFFIC_RECORDS.find((visitor) => visitor.ip === TRAFFIC_CASES.obviouslyMalicious)!;
const expandedLatest = expandedVisitor.visits.at(-1)!;
const expandedRow = {
  status: expandedVisitor.status,
  ip: expandedVisitor.ip,
  location: `${expandedVisitor.city}, ${expandedVisitor.country}`,
  summary: expandedVisitor.summary,
  confidence: `${Math.max(...expandedVisitor.confidence)}%`,
  paid: String(expandedVisitor.paidVisits),
  spend: money(expandedVisitor.spendGbp),
  lastSeen: relative(expandedVisitor.lastSeen),
  source: expandedLatest.campaign ?? expandedLatest.referrer,
  replay: representativeBehaviour(expandedVisitor),
};

/* ── The view switch ─────────────────────────────────────────────────────── */

export const GridListSwitch: Story = { render: () => <SwitchDemo /> };
export const ActiveGrid: Story = { render: () => <ViewModeSwitch value="grid" onChange={() => {}} /> };
export const ActiveList: Story = { render: () => <ViewModeSwitch value="list" onChange={() => {}} /> };
export const IconOnly: Story = { render: () => <SwitchDemo iconOnly /> };

/* ── The desktop list row, one story per state it can be in ─────────────── */

export const BlockedRow: Story = { render: () => <VisitorScanRow {...base} /> };
export const NotBlockedRow: Story = { render: () => <VisitorScanRow {...base} status="allowed" summary="No concerning behaviour in this visitor's journey." confidence="18%" /> };
export const JudgementCallRow: Story = { render: () => <VisitorScanRow {...base} status="ambiguous" summary="Converted once, but clicks arrive on a fixed cadence." /> };
export const MissingDataRow: Story = { render: () => <VisitorScanRow {...base} status="incomplete" summary="Tag stopped reporting during the latest arrival." confidence="Not captured" /> };
export const LongContentRow: Story = { render: () => <VisitorScanRow {...base} ip="2001:0db8:85a3:0000:0000:8a2e:0370:7334" location="Ho Chi Minh City, Vietnam, Southeast Asia" summary="Repeated paid arrivals from a long campaign name with no recorded engagement." /> };
export const ExpandableVisitorRow: Story = { render: () => <ExpandableDemo /> };

/* ── Threat monitoring on a phone ─────────────────────────────────────────
   The same VisitorScanRow the monitoring page renders. Below 768px it draws a
   compact row instead of the desktop columns, so these stories exercise the
   production component rather than a mobile-only copy of it. */

const mobile = { viewport: { defaultViewport: 'mobile' } };

const statuses = [
  { ...base, status: 'blocked' as const, ip: '192.0.2.51', location: 'Toronto, Canada' },
  { ...base, status: 'allowed' as const, ip: '203.0.113.4', location: 'Glasgow, United Kingdom' },
  { ...base, status: 'ambiguous' as const, ip: '203.0.113.6', location: 'Dublin, Ireland' },
  { ...base, status: 'incomplete' as const, ip: '198.51.100.7', location: 'Lisbon, Portugal' },
];

/** Mirrors the monitoring page: one visitor's evidence open at a time. */
function CompactListDemo({ rows = statuses }: { rows?: typeof statuses }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="visitor-list-view" style={{ display: 'grid', gap: 8 }}>
      {rows.map((row) => (
        <VisitorScanRow
          key={row.ip}
          {...row}
          evidence={supplementalEvidence(expandedVisitor, TRAFFIC_RECORDS)}
          evidenceLayout={7}
          expanded={open === row.ip}
          onToggle={() => setOpen(open === row.ip ? null : row.ip)}
          onOpen={() => {}}
        />
      ))}
    </div>
  );
}

/** Nothing the collapsed row deliberately omits may creep back in. */
async function assertNoDesktopFacts(row: HTMLElement) {
  for (const hidden of HIDDEN_ON_MOBILE) {
    await expect(row.textContent).not.toContain(hidden);
  }
}

const HIDDEN_ON_MOBILE = [
  base.summary, base.confidence, base.paid, base.spend, base.lastSeen,
  'Bot probability', 'Paid clicks', 'Spend', 'Last seen',
];

export const MobileCompactList: Story = {
  name: 'Mobile · compact list, several statuses',
  parameters: mobile,
  render: () => <CompactListDemo />,
  play: async ({ canvasElement }) => {
    const rows = [...canvasElement.querySelectorAll('.cg-visitor-row--compact')];
    await expect(rows).toHaveLength(4);
    await expect(canvasElement.querySelector('.cg-visitor-row__main')).toBeNull();
    // The text button belongs to the desktop row and must not appear here.
    await expect(canvasElement.querySelector('.cg-visitor-row__expand')).toBeNull();
    await expect(within(canvasElement).queryByText('Show evidence')).toBeNull();

    // Status, identity, location , and nothing else to slow the scan down.
    const first = rows[0] as HTMLElement;
    await expect(within(first).getByText('Blocked')).toBeVisible();
    await expect(within(first).getByText('192.0.2.51')).toBeVisible();
    await expect(within(first).getByText('Toronto, Canada')).toBeVisible();
    await assertNoDesktopFacts(first);

    // Every status still reads as text, never colour alone.
    for (const label of ['Blocked', 'Not blocked', 'Judgement call', 'Incomplete data']) {
      await expect(within(canvasElement).getByText(label)).toBeVisible();
    }
  },
};

export const MobileDenseRow: Story = {
  name: 'Mobile · dense operational row',
  parameters: mobile,
  render: () => (
    <CompactListDemo
      rows={[
        ...statuses,
        { ...base, status: 'blocked' as const, ip: '192.0.2.42', location: 'Ho Chi Minh City, Socialist Republic of Vietnam' },
        { ...base, status: 'blocked' as const, ip: '2001:0db8:85a3:0000:0000:8a2e:0370:7334', location: 'Frankfurt, Germany' },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const rows = [...canvasElement.querySelectorAll<HTMLElement>('.cg-visitor-row--compact')];
    await expect(rows).toHaveLength(6);

    /* The row's height is the whole point of this direction: one line per
       visitor, the same height whatever the content does. */
    const heights = new Set(rows.map((r) => Math.round(r.getBoundingClientRect().height)));
    await expect(heights.size).toBe(1);
    await expect([...heights][0]).toBeLessThanOrEqual(48);

    for (const row of rows) {
      const ip = row.querySelector('.cg-visitor-row__compact-ip') as HTMLElement;
      const loc = row.querySelector('.cg-visitor-row__compact-loc') as HTMLElement;
      // Truncation, never wrapping , a second line would cost the density.
      for (const el of [ip, loc]) {
        await expect(getComputedStyle(el).whiteSpace).toBe('nowrap');
        await expect(getComputedStyle(el).textOverflow).toBe('ellipsis');
      }
      // The place gives way before the address does: the address identifies
      // the visitor, so it is the last thing allowed to lose characters.
      if (ip.scrollWidth > ip.clientWidth + 1) {
        await expect(loc.clientWidth).toBeLessThanOrEqual(1);
      }
    }

    /* Whatever the ellipsis takes visually, the full value still reaches a
       screen reader through the trigger's name. */
    const first = rows[0].querySelector('.cg-visitor-row__compact-main') as HTMLElement;
    await expect(first).toHaveAccessibleName('Open 192.0.2.51, Toronto, Canada, Blocked');

    await assertNoDesktopFacts(rows[0] as HTMLElement);
  },
};

export const MobileEvidenceClosed: Story = {
  name: 'Mobile · evidence closed',
  parameters: mobile,
  render: () => <CompactListDemo />,
  play: async ({ canvasElement }) => {
    const eye = canvasElement.querySelector('.cg-visitor-row__eye') as HTMLButtonElement;
    await expect(eye.type).toBe('button');
    await expect(eye).toHaveAttribute('aria-expanded', 'false');
    await expect(eye).toHaveAccessibleName('Show evidence for 192.0.2.51');
    // The glyph itself says nothing to assistive technology.
    await expect(eye.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    // Touch target, not a pinpoint.
    const box = eye.getBoundingClientRect();
    await expect(box.width).toBeGreaterThanOrEqual(44);
    await expect(box.height).toBeGreaterThanOrEqual(44);
    await expect(canvasElement.querySelector('.cg-visitor-row__detail')).toBeNull();
  },
};

export const MobileEvidenceOpen: Story = {
  name: 'Mobile · evidence open',
  parameters: mobile,
  render: () => <CompactListDemo />,
  play: async ({ canvasElement }) => {
    const eyes = [...canvasElement.querySelectorAll<HTMLButtonElement>('.cg-visitor-row__eye')];
    await userEvent.click(eyes[0]);

    await expect(eyes[0]).toHaveAttribute('aria-expanded', 'true');
    await expect(eyes[0]).toHaveAccessibleName('Hide evidence for 192.0.2.51');
    // aria-controls resolves to the panel that actually opened.
    const panel = canvasElement.querySelector(`#${CSS.escape(eyes[0].getAttribute('aria-controls')!)}`);
    await expect(panel).not.toBeNull();
    await expect(panel!.classList.contains('cg-visitor-row__detail')).toBe(true);
    // The open state is a different glyph, not just a different colour.
    await expect(eyes[0].querySelectorAll('svg path').length).toBeGreaterThan(1);

    // Opening one visitor leaves the others alone.
    for (const other of eyes.slice(1)) await expect(other).toHaveAttribute('aria-expanded', 'false');
    await expect(canvasElement.querySelectorAll('.cg-visitor-row__detail')).toHaveLength(1);

    // Evidence content survives intact, including the journey action.
    await expect(within(panel as HTMLElement).getByRole('button', { name: /Open full journey/ })).toBeVisible();
    await expect(panel!.querySelector('.cg-replay')).not.toBeNull();
    await expect(panel!.querySelector('.cg-visitor-row__telemetry')).not.toBeNull();

    // And the same control closes it again.
    await userEvent.click(eyes[0]);
    await expect(eyes[0]).toHaveAttribute('aria-expanded', 'false');
    await expect(canvasElement.querySelector('.cg-visitor-row__detail')).toBeNull();
  },
};

export const MobileEvidenceIsNotNavigation: Story = {
  name: 'Mobile · the eye never navigates',
  parameters: mobile,
  render: function Render() {
    const [opened, setOpened] = useState<string[]>([]);
    const [open, setOpen] = useState<string | null>(null);
    return (
      <>
        <p data-testid="opened">{opened.join(',') || 'none'}</p>
        <VisitorScanRow
          {...statuses[0]}
          evidence={supplementalEvidence(expandedVisitor, TRAFFIC_RECORDS)}
          evidenceLayout={7}
          expanded={open === statuses[0].ip}
          onToggle={() => setOpen(open ? null : statuses[0].ip)}
          onOpen={() => setOpened((prev) => [...prev, statuses[0].ip])}
        />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const eye = canvasElement.querySelector('.cg-visitor-row__eye') as HTMLElement;
    await userEvent.click(eye);
    // Revealing evidence is not the same gesture as opening the journey.
    await expect(canvasElement.querySelector('[data-testid="opened"]')!.textContent).toBe('none');
    await expect(eye).toHaveAttribute('aria-expanded', 'true');

    // The journey action inside the panel still works.
    await userEvent.click(within(canvasElement).getByRole('button', { name: /Open full journey/ }));
    await expect(canvasElement.querySelector('[data-testid="opened"]')!.textContent).toBe('192.0.2.51');
  },
};

export const MobileKeyboardFocus: Story = {
  name: 'Mobile · keyboard operation and focus',
  parameters: mobile,
  render: () => <CompactListDemo rows={statuses.slice(0, 2)} />,
  play: async ({ canvasElement }) => {
    const eye = canvasElement.querySelector('.cg-visitor-row__eye') as HTMLElement;
    eye.focus();
    await expect(eye).toHaveFocus();
    // A visible focus state, not an outline the theme has removed.
    await expect(eye.classList.contains('cg-focusable')).toBe(true);

    await userEvent.keyboard('{Enter}');
    await expect(eye).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard(' ');
    await expect(eye).toHaveAttribute('aria-expanded', 'false');
    // Focus stays where the reader put it.
    await expect(eye).toHaveFocus();
  },
};

export const MobileLongIpAddress: Story = {
  name: 'Mobile · long IP address',
  parameters: mobile,
  render: () => <CompactListDemo rows={[{ ...statuses[0], ip: '2001:0db8:85a3:0000:0000:8a2e:0370:7334' }]} />,
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector('.cg-visitor-row--compact') as HTMLElement;
    const eye = row.querySelector('.cg-visitor-row__eye') as HTMLElement;
    // The address wraps; it never pushes the control out of the row.
    await expect(eye.getBoundingClientRect().right).toBeLessThanOrEqual(Math.ceil(row.getBoundingClientRect().right));
    await expect(eye.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
    await expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth + 1);
  },
};

export const MobileLongLocation: Story = {
  name: 'Mobile · long location',
  parameters: mobile,
  render: () => <CompactListDemo rows={[{ ...statuses[0], location: 'Ho Chi Minh City, Socialist Republic of Vietnam, Southeast Asia' }]} />,
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector('.cg-visitor-row--compact') as HTMLElement;
    const eye = row.querySelector('.cg-visitor-row__eye') as HTMLElement;
    await expect(eye.getBoundingClientRect().right).toBeLessThanOrEqual(Math.ceil(row.getBoundingClientRect().right));
    await expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth + 1);
  },
};

export const MobileNarrowViewport: Story = {
  name: 'Mobile · 320px',
  parameters: { viewport: { defaultViewport: 'mobile320' } },
  render: () => <CompactListDemo />,
  play: async ({ canvasElement }) => {
    const eye = canvasElement.querySelector('.cg-visitor-row__eye') as HTMLElement;
    await userEvent.click(eye);
    const panel = canvasElement.querySelector('.cg-visitor-row__detail') as HTMLElement;
    const limit = Math.ceil((canvasElement.querySelector('.cg-visitor-row') as HTMLElement).getBoundingClientRect().right);
    // Nothing in the row or its evidence reaches past the row itself.
    for (const el of canvasElement.querySelectorAll<HTMLElement>('.cg-visitor-row *')) {
      const box = el.getBoundingClientRect();
      if (box.width === 0) continue;
      await expect(box.right).toBeLessThanOrEqual(limit + 1);
    }
    await expect(panel.querySelector('.cg-replay')).not.toBeNull();
  },
};

export const DesktopListRegression: Story = {
  name: 'Desktop · list row unchanged',
  parameters: { viewport: { defaultViewport: 'desktop' } },
  render: () => <CompactListDemo />,
  play: async ({ canvasElement }) => {
    // The desktop row, with every column it has always carried.
    await expect(canvasElement.querySelector('.cg-visitor-row--compact')).toBeNull();
    await expect(canvasElement.querySelector('.cg-visitor-row__eye')).toBeNull();
    const main = canvasElement.querySelector('.cg-visitor-row__main') as HTMLElement;
    await expect(getComputedStyle(main).gridTemplateColumns.split(' ')).toHaveLength(7);
    for (const label of ['Bot probability', 'Paid clicks', 'Spend', 'Last seen']) {
      await expect(within(canvasElement).getAllByText(label).length).toBeGreaterThan(0);
    }
    // And the text disclosure it has always used.
    await expect(within(canvasElement).getAllByText('Show evidence').length).toBeGreaterThan(0);
  },
};
