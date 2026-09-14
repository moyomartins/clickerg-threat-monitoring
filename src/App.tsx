import { lazy, Suspense, useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Button, EmptyState, Wordmark, type VisitorStatus } from '@clickerg/ui';
import { VisitorList } from './VisitorList';
import { VisitorDetail } from './VisitorDetail';
import { fetchVisitors } from './data/mock';
import { applyManualDecision } from './data/manual';
import { NOW } from './data/clock';
import type { Visitor } from './data/types';

/* The comparison lab is a development-only chunk; it never ships with the monitoring product. */
const LayoutOptions = import.meta.env.DEV ? lazy(() => import('./LayoutOptions').then((module) => ({ default: module.LayoutOptions }))) : null;
const EvidenceLayoutOptions = import.meta.env.DEV ? lazy(() => import('./EvidenceLayoutOptions').then((module) => ({ default: module.EvidenceLayoutOptions }))) : null;

/* A hash route is enough for two screens, and it gives us real back/forward
   behaviour for free , no router dependency for one level of navigation. */
const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
};
const getHash = () => window.location.hash;

function useRoute() {
  const hash = useSyncExternalStore(subscribe, getHash, getHash);
  const match = /^#\/visitor\/(.+)$/.exec(hash);
  if (import.meta.env.DEV && hash === '#/layout-options') return { name: 'layout-options' as const };
  if (import.meta.env.DEV && hash === '#/evidence-layout-options') return { name: 'evidence-layout-options' as const };
  return match ? { name: 'detail' as const, ip: decodeURIComponent(match[1]) } : { name: 'list' as const };
}

type Phase = 'loading' | 'ready' | 'error';

export default function App() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [data, setData] = useState<Visitor[]>([]);
  const [error, setError] = useState('');
  const [overrides, setOverrides] = useState<Record<string, Visitor>>({});
  const route = useRoute();

  const load = useCallback(() => {
    setPhase('loading');
    const shouldFail = new URLSearchParams(window.location.search).has('fail');
    fetchVisitors(700, shouldFail)
      .then((visitors) => {
        setData(visitors);
        setPhase('ready');
      })
      .catch((e: Error) => {
        setError(e.message);
        setPhase('error');
      });
  }, []);

  const routeKey = route.name === 'detail' ? route.ip : route.name;
  useEffect(load, [load]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [routeKey]);

  /** Manual decisions sit on top of the model's own verdict , never silently replacing it. */
  const visitors = useMemo(
    () =>
      data.map((v) => overrides[v.ip] ?? v),
    [data, overrides],
  );

  const setStatus = (ip: string, status: VisitorStatus) =>
    setOverrides((prev) => {
      const visitor = prev[ip] ?? data.find((v) => v.ip === ip);
      return visitor ? { ...prev, [ip]: applyManualDecision(visitor, status, NOW) } : prev;
    });

  const navigate = (hash: string) => {
    window.location.hash = hash;
  };

  return (
    <div className="app cg-root">
      <header className="app__masthead">
        <div className="app__wordmark">
          <Wordmark />
          <span>· click-fraud protection</span>
        </div>
        {phase === 'ready' && (route.name === 'list' || route.name === 'layout-options' || route.name === 'evidence-layout-options') && (
          <Button variant="cream" size="sm" onClick={load}>
            Refresh
          </Button>
        )}
      </header>

      <main>
        {phase === 'error' ? (
          <EmptyState
            title="We could not load your visitors"
            body={`${error} Your protection is still running , this is a problem with the dashboard, not with blocking.`}
            action={<Button onClick={load}>Try again</Button>}
          />
        ) : route.name === 'detail' ? (
          <VisitorDetail
            visitor={visitors.find((v) => v.ip === route.ip || v.aliases?.includes(route.ip))}
            onBack={() => navigate('#/')}
            onStatusChange={setStatus}
          />
        ) : route.name === 'layout-options' && LayoutOptions ? (
          <Suspense fallback={<span>Loading layout options…</span>}><LayoutOptions visitors={visitors} loading={phase === 'loading'} onOpen={(ip) => navigate(`#/visitor/${encodeURIComponent(ip)}`)} /></Suspense>
        ) : route.name === 'evidence-layout-options' && EvidenceLayoutOptions ? (
          <Suspense fallback={<span>Loading evidence layouts…</span>}><EvidenceLayoutOptions visitors={visitors} onOpen={(ip) => navigate(`#/visitor/${encodeURIComponent(ip)}`)} /></Suspense>
        ) : (
          <VisitorList
            visitors={visitors}
            loading={phase === 'loading'}
            onOpen={(ip) => navigate(`#/visitor/${encodeURIComponent(ip)}`)}
          />
        )}
      </main>
    </div>
  );
}
