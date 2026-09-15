import {
  Button,
  ConfidenceInline,
  DecisionHero,
  DecisiveCell,
  EmptyState,
  ExclusionInline,
  FinancialCell,
  Journey,
  JourneySection,
  JourneyItem,
  JourneyRow,
  PageReplay,
  StatusPill,
  VisitEntry,
  type VisitorStatus,
} from '@clickerg/ui';
import { behaviourOf, representativeBehaviour } from './behaviour';
import { arrivalExplanationFor, signalsFor, sourceFor } from './arrival';
import type { Visitor } from './data/types';
import { BLOCK_THRESHOLD } from './data/scoring';
import { arrivalTimestamp, money } from './format';
import { heroFacts } from './heroFacts';
import { journeySummaryFor } from './journeySummary';

interface Props {
  visitor: Visitor | undefined;
  onBack: () => void;
  onStatusChange: (ip: string, status: VisitorStatus) => void;
}

export function VisitorDetail({ visitor, onBack, onStatusChange }: Props) {
  if (!visitor) {
    return (
      <>
        <div className="detail__back">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back to all visitors
          </Button>
        </div>
        <EmptyState
          title="We have no record of that visitor"
          body="The link may be stale, or this IP may have dropped out of your retention window."
          action={<Button onClick={onBack}>Back to all visitors</Button>}
        />
      </>
    );
  }

  const facts = heroFacts(visitor);
  const journey = journeySummaryFor(visitor);
  /* An incomplete journey has no evidence to act on, so the control says so
     rather than offering a block it cannot justify. */
  const insufficient = visitor.status === 'incomplete';

  const action =
    visitor.status === 'blocked' ? (
      <Button variant="ghost" onClick={() => onStatusChange(visitor.ip, 'allowed')}>
        Remove from exclusion list
      </Button>
    ) : insufficient ? (
      <Button variant="ghost" disabled title="Unavailable until sufficient evidence is captured.">
        Add to exclusion list
      </Button>
    ) : (
      <>
        {visitor.status === 'ambiguous' && (
          <Button variant="ghost" onClick={() => onStatusChange(visitor.ip, 'allowed')}>
            Mark as legitimate
          </Button>
        )}
        <Button onClick={() => onStatusChange(visitor.ip, 'blocked')}>Add to exclusion list</Button>
      </>
    );

  return (
    <>
      <div className="detail__back">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back to all visitors
        </Button>
      </div>

      {visitor.dataGap && <p className="gap-note">{visitor.dataGap}</p>}


      <DecisionHero
        status={visitor.status}
        headingId="visitor-heading"
        identity={visitor.ip}
        statusPill={<StatusPill status={visitor.status} />}
        where={
          <>
            {visitor.city}
            {visitor.region ? `, ${visitor.region}` : ''} · {visitor.country} · last seen {facts.lastSeen.relative}
          </>
        }
        action={action}
        reason={facts.reason}
        settled={facts.settled}
        replayLabel="Replay of this visitor’s most recent reporting arrival"
        replay={<PageReplay behaviour={representativeBehaviour(visitor)} size="hero" />}
      >
        <DecisiveCell
          label={facts.decisive.label}
          tone={facts.decisive.tone}
          iso={facts.decisive.iso}
          stamp={`${facts.decisive.date} · ${facts.decisive.time}`}
          clickLabel="Decisive arrival"
          click={facts.decisiveClick ? `paid click ${facts.decisiveClick}` : null}
        />

        <FinancialCell
          label="Financial outcome"
          spendLabel="Ad spend"
          spend={facts.spend}
          revenueLabel="Revenue"
          revenue={facts.revenue}
          revenueTone={facts.converted ? 'favourable' : 'muted'}
        />

        <JourneyRow label="Journey summary and exclusion">
          <JourneyItem label="Visits">
            {facts.visits} <span>· {facts.paid} paid · {facts.free} free</span>
          </JourneyItem>
          <JourneyItem label="Active">{facts.active}</JourneyItem>
          <JourneyItem label="First seen">
            <time dateTime={facts.firstSeen.iso}>
              {facts.firstSeen.short}, {facts.firstSeen.time}
            </time>
          </JourneyItem>
          <JourneyItem label="Last seen">
            <time dateTime={facts.lastSeen.iso}>
              {facts.lastSeen.short}, {facts.lastSeen.time}
            </time>
          </JourneyItem>
          <ConfidenceInline
            id="visitor-confidence"
            label="Confidence"
            value={facts.peak}
            meterLabel="Peak confidence this visitor is fraudulent"
            detail={facts.crossed ? `crossed ${facts.threshold}% at visit ${facts.crossed.visit}` : undefined}
          />
          {facts.platforms.length > 0 && <ExclusionInline label="Exclusion" entries={facts.platforms} />}
        </JourneyRow>
      </DecisionHero>

      <JourneySection id="journey-replay-heading" count={journey.countLabel} insight={journey.insight}>
      {journey.arrivalCount > 0 && <Journey
        labelledBy="journey-replay-heading"
        decisiveArrival={visitor.decisiveIndex >= 0 ? visitor.decisiveIndex + 1 : undefined}
      >
        {visitor.visits.map((visit, i) => {
          const explanation = arrivalExplanationFor(visitor, i);
          const arrivalTime = arrivalTimestamp(visit.at);
          return (
            <VisitEntry
              key={visit.id}
              index={i + 1}
              timestamp={arrivalTime.display}
              timestampIso={arrivalTime.iso}
              timestampLabel={arrivalTime.accessible}
              channel={visit.channel}
              source={sourceFor(visit)}
              cost={visit.costGbp !== undefined ? money(visit.costGbp) : undefined}
              signals={signalsFor(visit).slice(0, 5)}
              replay={behaviourOf(visit)}
              confidence={visitor.confidence[i]}
              decisive={i === visitor.decisiveIndex}
              verdict={i === visitor.decisiveIndex ? 'blocked here' : undefined}
              explanation={{
                title: explanation.title,
                content: (
                  <>
                    <p className="cg-arrival-pop__body">{explanation.body}</p>
                    <dl className="cg-arrival-pop__facts">
                      <div>
                        <dt>Confidence</dt>
                        <dd className="cg-mono">
                          {explanation.confidenceBefore}% → {explanation.confidenceAfter}%
                        </dd>
                      </div>
                      {explanation.cost && (
                        <div>
                          <dt>Cost</dt>
                          <dd className="cg-mono">{explanation.cost}</dd>
                        </div>
                      )}
                      {explanation.source && (
                        <div>
                          <dt>Source</dt>
                          <dd>{explanation.source}</dd>
                        </div>
                      )}
                    </dl>
                    {explanation.crossedThreshold && (
                      <p className="cg-arrival-pop__flag">
                        Confidence crossed the {BLOCK_THRESHOLD}% blocking threshold here.
                      </p>
                    )}
                  </>
                ),
              }}
            />
          );
        })}
      </Journey>}
      </JourneySection>
    </>
  );
}
