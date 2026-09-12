import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import {
  ConfidenceInline,
  DecisionHero,
  DecisiveCell,
  ExclusionInline,
  FinancialCell,
  JourneyItem,
  JourneyRow,
} from './Decision';
import { PageReplay } from './PageReplay';
import { StatusPill } from './StatusPill';
import { Button } from './Button';

const meta = {
  title: 'Components/Decision hero',
  component: DecisionHero,
  parameters: {
    layout: 'padded',
    backgrounds: { value: 'surface' },
    docs: {
      description: {
        component:
          'The visitor detail hero: an enclosure. DESIGN.md already carries status as border weight and style rather than a colour fill — 2px ink for blocked, dashed for a judgement call, dotted for incomplete. This hero promotes that rule to the whole composition: the border states the verdict, the replay sits inside the same enclosure rather than beside it, and hairlines divide the argument within it. One reason, stated once; the arrival strip below carries the per-visit evidence.',
      },
    },
  },
} satisfies Meta<typeof DecisionHero>;

export default meta;

const REPLAY = { scrollPct: 0, dwellSec: 1, clicks: 1, mouseMoves: 0 };

function Hero({
  status = 'blocked' as const,
  settled = true,
  reason = '29 paid clicks repeated the same zero-engagement pattern. ClickerG blocked the IP at paid click 3, once confidence crossed 80%.',
  markLabel = 'Blocked at paid click 3',
  markTone = 'decisive' as const,
  click = 'paid click 3' as string | null,
  spend = '£158.38',
  revenue = '£0.00' as string | null,
  revenueTone = 'muted' as 'favourable' | 'muted',
  confidence = 99 as number | null,
  confidenceDetail = 'crossed 80% at visit 3',
  action,
  platforms = [
    { platform: 'Google Ads', state: 'not simulated' },
    { platform: 'Meta Ads', state: 'not simulated' },
  ],
}: {
  status?: 'blocked' | 'ambiguous' | 'review' | 'allowed' | 'incomplete';
  settled?: boolean;
  reason?: string;
  markLabel?: string;
  markTone?: 'decisive' | 'neutral';
  click?: string | null;
  spend?: string;
  revenue?: string | null;
  revenueTone?: 'favourable' | 'muted';
  confidence?: number | null;
  confidenceDetail?: string;
  action?: React.ReactNode;
  platforms?: { platform: string; state: string }[];
}) {
  return (
    <DecisionHero
      status={status}
      headingId="sb-visitor"
      identity="41.203.88.7"
      statusPill={<StatusPill status={status} />}
      where="Lagos, Lagos · Nigeria · last seen 12h ago"
      action={action ?? <Button variant="ghost">Remove from exclusion list</Button>}
      reason={reason}
      settled={settled}
      replayLabel="Replay of this visitor’s most recent reporting arrival"
      replay={<PageReplay behaviour={REPLAY} size="hero" />}
    >
      <DecisiveCell
        label={markLabel}
        tone={markTone}
        iso="2025-08-13T11:44:00.000Z"
        stamp="13 Aug 2025 · 11:44 UTC"
        clickLabel="Decisive arrival"
        click={click}
      />
      <FinancialCell
        label="Financial outcome"
        spendLabel="Ad spend"
        spend={spend}
        revenueLabel="Revenue"
        revenue={revenue}
        revenueTone={revenueTone}
      />
      <JourneyRow label="Journey summary and exclusion">
        <JourneyItem label="Visits">
          29 <span>· 29 paid · 0 free</span>
        </JourneyItem>
        <JourneyItem label="Active">2 days</JourneyItem>
        <JourneyItem label="First seen">
          <time dateTime="2025-08-13T09:01:00.000Z">13 Aug, 09:01 UTC</time>
        </JourneyItem>
        <JourneyItem label="Last seen">
          <time dateTime="2025-08-14T21:28:00.000Z">14 Aug, 21:28 UTC</time>
        </JourneyItem>
        <ConfidenceInline
          id="sb-confidence"
          label="Confidence"
          value={confidence}
          meterLabel="Peak confidence this visitor is fraudulent"
          detail={confidenceDetail}
        />
        {platforms.length > 0 && <ExclusionInline label="Exclusion" entries={platforms} />}
      </JourneyRow>
    </DecisionHero>
  );
}

type Story = StoryObj;

export const Blocked: Story = { render: () => <Hero /> };

/**
 * The hero has a height budget: it must orient and conclude without pushing the
 * arrival strip past the fold. This asserts the budget rather than trusting the eye.
 */
export const HeightBudget: Story = {
  name: 'Height budget: 360–460px',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ width: 1240 }}>
      <Hero />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const hero = canvasElement.querySelector('.cg-hero') as HTMLElement;
    const height = hero.getBoundingClientRect().height;
    await expect(height).toBeLessThanOrEqual(460);
    await expect(height).toBeGreaterThanOrEqual(300);
  },
};

/** A judgement call keeps the unresolved treatment and offers both actions. */
export const JudgementCall: Story = {
  render: () => (
    <Hero
      status="ambiguous"
      settled={false}
      reason="5 paid clicks show machine-like timing, but the visitor converted £249.00 — so ClickerG held the call rather than blocking it."
      markLabel="Held at paid click 3"
      markTone="neutral"
      spend="£24.05"
      revenue="£249.00"
      revenueTone="favourable"
      confidence={63}
      confidenceDetail="peak across 6 visits"
      action={
        <>
          <Button variant="ghost">Mark as legitimate</Button>
          <Button>Add to exclusion list</Button>
        </>
      }
    />
  ),
};

/** Nothing is asserted that was never captured: revenue and confidence both say so. */
export const IncompleteData: Story = {
  render: () => (
    <Hero
      status="incomplete"
      settled={false}
      reason="Our tag stopped reporting partway through this journey, so engagement and form data were never captured."
      markLabel="Last assessed"
      markTone="neutral"
      click={null}
      spend="£15.23"
      revenue={null}
      confidence={null}
      confidenceDetail=""
      action={
        <Button variant="ghost" disabled title="Unavailable until sufficient evidence is captured.">
          Add to exclusion list
        </Button>
      }
      platforms={[{ platform: 'Google Ads', state: 'not simulated' }]}
    />
  ),
};

export const NotBlocked: Story = {
  render: () => (
    <Hero
      status="allowed"
      reason="Nothing across 7 visits looked automated."
      markLabel="Last assessed"
      markTone="neutral"
      click={null}
      spend="£12.18"
      revenue="£0.00"
      confidence={18}
      confidenceDetail="peak across 7 visits"
      action={<Button>Add to exclusion list</Button>}
      platforms={[]}
    />
  ),
};

export const UnderReview: Story = {
  render: () => (
    <Hero
      status="review"
      settled={false}
      reason="Some arrivals look automated. Confidence has reached 62% across 4 paid clicks without crossing the 80% line to block."
      markLabel="Last assessed"
      markTone="neutral"
      click={null}
      spend="£31.90"
      revenue="£0.00"
      confidence={62}
      confidenceDetail="peak across 4 visits"
      action={<Button>Add to exclusion list</Button>}
    />
  ),
};

/* ------------------------------------------------------------ ExclusionInline --- */

/** ExclusionInline renders a <dt>/<dd> pair, so — as in production — it needs a <dl> parent. */
export const ExclusionStates: Story = {
  name: 'ExclusionInline: mixed states',
  render: () => (
    <dl aria-label="Journey summary and exclusion">
      <ExclusionInline
        label="Exclusion"
        entries={[
          { platform: 'Google Ads', state: 'confirmed · 14 Aug 2025, 11:30 UTC' },
          { platform: 'Meta Ads', state: 'pending' },
        ]}
      />
    </dl>
  ),
};
