import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
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

export const GridListSwitch: Story = { render: () => <SwitchDemo /> };
export const ActiveGrid: Story = { render: () => <ViewModeSwitch value="grid" onChange={() => {}} /> };
export const ActiveList: Story = { render: () => <ViewModeSwitch value="list" onChange={() => {}} /> };
export const IconOnly: Story = { render: () => <SwitchDemo iconOnly /> };
export const Labelled: Story = { render: () => <ViewModeSwitch value="list" onChange={() => {}} /> };
export const CompactVisitorRow: Story = { render: () => <VisitorScanRow {...base} /> };
export const ComfortableVisitorRow: Story = { render: () => <VisitorScanRow {...base} summary="Three paid clicks before the decision, scored 93% on our automation model." /> };
export const ExpandableVisitorRow: Story = { render: () => <ExpandableDemo /> };
export const GroupedEvidencePanel: Story = { render: () => <ExpandableDemo /> };
export const ReplayFirstRow: Story = { render: () => <VisitorScanRow {...base} expanded /> };
export const LongContentRow: Story = { render: () => <VisitorScanRow {...base} ip="2001:0db8:85a3:0000:0000:8a2e:0370:7334" location="Ho Chi Minh City, Vietnam, Southeast Asia" summary="Repeated paid arrivals from a long campaign name with no recorded engagement." /> };
export const BlockedRow: Story = { render: () => <VisitorScanRow {...base} /> };
export const NotBlockedRow: Story = { render: () => <VisitorScanRow {...base} status="allowed" summary="No concerning behaviour in this visitor's journey." confidence="18%" /> };
export const JudgementCallRow: Story = { render: () => <VisitorScanRow {...base} status="ambiguous" summary="Converted once, but clicks arrive on a fixed cadence." /> };
export const MissingDataRow: Story = { render: () => <VisitorScanRow {...base} status="incomplete" summary="Tag stopped reporting during the latest arrival." confidence="Not captured" /> };
export const MobileRow: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } }, render: () => <VisitorScanRow {...base} /> };
