import { describe, expect, it } from 'vitest';
import { buildTrafficRecords as buildVisitors, TRAFFIC_CASES as NOTABLE, TRAFFIC_RECORDS as VISITORS, assemble } from './trafficRepository';
import { NOW } from './clock';
import { scoreJourney, reasonsFor } from './scoring';
import { applyManualDecision } from './manual';
import { arrivalExplanationFor } from '../arrival';
import { reasonFor } from '../decision';
import { heroFacts } from '../heroFacts';
import { matchesFilters } from '../filters';
const base = { query: '', status: 'all', country: 'all', window: 'all', paidOnly: false, minBot: 0 };
const byId = (id: string) => VISITORS.find((v) => v.ip === id)!;
describe('realistic canonical traffic', () => {
  it('is deterministic and covers the required scenarios and length bands', () => {
    expect(buildVisitors()).toEqual(VISITORS);
    expect(VISITORS.length).toBeGreaterThanOrEqual(60);
    expect(new Set(VISITORS.map(v => v.ip)).size).toBe(VISITORS.length);
    for (const id of Object.values(NOTABLE)) expect(byId(id)).toBeDefined();
    for (const [min,max] of [[1,1],[2,4],[5,10],[11,25],[26,100]]) expect(VISITORS.some(v=>v.visits.length>=min&&v.visits.length<=max)).toBe(true);

  });
  it('reconciles chronology, observations, money and confidence', () => {
    for (const v of VISITORS) {
      expect(v.confidence).toEqual(scoreJourney(v.visits));
      expect(v.firstSeen).toBe(v.visits[0].at); expect(v.lastSeen).toBe(v.visits.at(-1)!.at);
      expect(v.paidVisits).toBe(v.visits.filter(x=>x.channel==='paid').length);
      expect(Math.round(v.spendGbp*100)).toBe(v.visits.reduce((s,x)=>s+Math.round((x.costGbp??0)*100),0));
      expect(Math.round(v.revenueGbp*100)).toBe(v.visits.reduce((s,x)=>s+Math.round((x.conversionValueGbp??0)*100),0));
      v.visits.forEach((x,i)=>{
        expect(x.at).toBeLessThanOrEqual(NOW); if(i) expect(x.at).toBeGreaterThan(v.visits[i-1].at);
        if(x.channel!=='paid'){expect(x.costGbp).toBeUndefined();expect(x.campaign).toBeUndefined();expect(x.keyword).toBeUndefined();}
        if(x.keyword) {expect(x.platform).toBe('Google Ads');expect(x.campaign).not.toBe('retargeting-display');}
        expect(x.converted).toBe(x.conversionValueGbp!==undefined);
        if(x.formFill!=='none'&&x.formFill!=='unknown') expect(x.formSubmitted).toBe(true);
        if(x.clickCadenceSec!==null) expect(x.engagement!.clicks).toBeGreaterThan(1);
        expect(x.fingerprintReuse).toBeLessThanOrEqual(i+1);
      });
    }
  });
  it('uses only decision-time evidence and separates confirmation from requests',()=>{
    for(const v of VISITORS.filter(v=>v.decisiveIndex>=0)){
      const prefix=v.visits.slice(0,v.decisiveIndex+1);
      expect(prefix.filter(x=>x.channel==='paid').length).toBeGreaterThanOrEqual(3);
      const snapshot=assemble(v.ip,[v.city,v.region,v.country,v.countryCode] as never,prefix);
      expect(snapshot.summary).toBe(v.summary);
      for(const x of v.visits.slice(v.decisiveIndex+1).filter(x=>x.channel==='paid')) expect(x.postDecisionReason).toContain('pending');
      for(const e of v.exclusionEvents??[]) {
        expect(e.requestedAt).toBe(v.visits[v.decisiveIndex].at);
        if(e.confirmedAt) expect(v.visits.some(x=>x.platform===e.platform&&x.at>=e.confirmedAt!)).toBe(false);
      }
    }
  });
  it('preserves conflicting evidence, missing values and manual history',()=>{
    expect(byId(NOTABLE.conversionConflict).status).toBe('ambiguous');
    expect(byId(NOTABLE.repeatShopper).status).toBe('allowed');
    expect(byId(NOTABLE.sharedNetwork).status).toBe('allowed');
    expect(byId(NOTABLE.manualOverride).automatedStatus).toBe('allowed');
    expect(byId(NOTABLE.manualOverride).manualHistory).toHaveLength(1);
    const missing=byId(NOTABLE.trackingStopped).visits.at(-1)!;
    expect(missing.engagement).toBeNull();expect(missing.formFill).toBe('unknown');
    expect(reasonsFor(missing).some(r=>r.signal==='Bot probability')).toBe(false);
    expect(VISITORS.flatMap(v=>v.visits).some(v=>v.engagement?.mouseMoves===0)).toBe(true);
  });
  it('only shows platform exclusions for blocked visitors', () => {
    for (const visitor of VISITORS) {
      const platforms = heroFacts(visitor).platforms;
      expect(platforms.length > 0).toBe(visitor.status === 'blocked');
      for (const platform of platforms) expect(['Pending', 'Confirmed']).toContain(platform.state);
    }
  });
  it('does not let later evidence rewrite a block or confuse visit and paid-click identity', () => {
    const farm = byId(NOTABLE.obviouslyMalicious);
    const prefix = farm.visits.slice(0, farm.decisiveIndex + 1);
    const later = { ...prefix[0], id: 'later', at: NOW, converted: true, conversionValueGbp: 120, botProbability: 0.01 };
    const reassessed = assemble(farm.ip, ['Lagos','Lagos','Nigeria','NG'], [...prefix, later]);
    expect(reassessed.status).toBe('blocked'); expect(reassessed.decisiveIndex).toBe(farm.decisiveIndex);
    expect(reassessed.summary).toBe(farm.summary);
    expect(reasonFor(reassessed)).toBe(reasonFor(farm));
    const free = { ...prefix[0], id: 'free', at: prefix[0].at - 1000, channel: 'organic' as const, costGbp: undefined };
    const mixed = assemble('198.51.100.1', ['Lagos','Lagos','Nigeria','NG'], [free, ...prefix]);
    expect(mixed.decisiveIndex + 1).toBeGreaterThan(mixed.visits.slice(0,mixed.decisiveIndex+1).filter(v=>v.channel==='paid').length);
    for (const v of VISITORS) v.visits.forEach((_,i) => {
      const explanation = arrivalExplanationFor(v,i);
      expect(explanation.confidenceAfter).toBe(v.confidence[i]);
      expect(explanation.confidenceBefore).toBe(i ? v.confidence[i-1] : 0);
      expect(explanation.decisive).toBe(i===v.decisiveIndex);
    });
  });
  it('keeps the automated recommendation and complete manual override history', () => {
    const shopper = byId(NOTABLE.repeatShopper);
    const blocked = applyManualDecision(shopper,'blocked',NOW);
    const allowed = applyManualDecision(blocked,'allowed',NOW+1);
    expect(allowed.manualHistory).toHaveLength(2);
    expect(allowed.automatedStatus).toBe(shopper.status);
    expect(allowed.confidence).toEqual(shopper.confidence);
    expect(allowed.visits).toEqual(shopper.visits);
  });
  it('handles exact filter boundaries, unknowns, dates and combinations',()=>{
    const original=byId(NOTABLE.repeatShopper);
    for(const threshold of [25,50,75]){
      expect(VISITORS.some(v => Math.max(...v.visits.flatMap(x => x.botProbability === null ? [] : [x.botProbability])) === threshold / 100)).toBe(true);
      const v={...original,visits:original.visits.map(x=>({...x,botProbability:threshold/100}))};
      expect(matchesFilters(v,{...base,minBot:threshold},NOW)).toBe(true);
      expect(matchesFilters(v,{...base,minBot:threshold+1},NOW)).toBe(false);
    }
    const unknown=byId(NOTABLE.trackingStopped);
    expect(matchesFilters(unknown,base,NOW)).toBe(true);expect(matchesFilters(unknown,{...base,minBot:25},NOW)).toBe(false);
    for(const window of ['1','7','30']) expect(VISITORS.filter(v=>matchesFilters(v,{...base,window},NOW)).length).toBeGreaterThan(0);
    expect(VISITORS.some(v=>v.lastSeen<NOW-30*86400000)).toBe(true);
    const match=VISITORS.filter(v=>matchesFilters(v,{...base,status:'allowed',country:original.country,query:original.ip,paidOnly:true},NOW));
    expect(match).toContain(original);expect(match[0].visits.some(x=>x.channel!=='paid')).toBe(true);
  });
});
