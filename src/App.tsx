import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Button, EmptyState, type VisitorStatus } from '@clickerg/ui';
import { VisitorList } from './VisitorList';
import { VisitorDetail } from './VisitorDetail';
import { fetchVisitors } from './data/mock';
import type { Visitor } from './data/types';

/* A hash route is enough for two screens, and it gives us real back/forward
   behaviour for free — no router dependency for one level of navigation. */
const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
};
const getHash = () => window.location.hash;

function useRoute() {
  const hash = useSyncExternalStore(subscribe, getHash, getHash);
  const match = /^#\/visitor\/(.+)$/.exec(hash);
  return match ? { name: 'detail' as const, ip: decodeURIComponent(match[1]) } : { name: 'list' as const };
}

type Phase = 'loading' | 'ready' | 'error';

export default function App() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [data, setData] = useState<Visitor[]>([]);
  const [error, setError] = useState('');
  const [overrides, setOverrides] = useState<Record<string, VisitorStatus>>({});
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

  const routeKey = route.name === 'detail' ? route.ip : 'list';
  useEffect(load, [load]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [routeKey]);

  /** Manual decisions sit on top of the model's own verdict — never silently replacing it. */
  const visitors = useMemo(
    () =>
      data.map((v) => {
        const override = overrides[v.ip];
        if (!override || override === v.status) return v;
        const peak = Math.max(...v.confidence);
        return {
          ...v,
          status: override,
          summary: override === 'blocked' ? 'Blocked by you' : 'Marked legitimate by you',
          verdict:
            override === 'blocked'
              ? `You added this IP to the exclusion list yourself. Our own confidence peaked at ${peak}%, which was ${
                  v.status === 'blocked' ? 'already over' : 'under'
                } our blocking line — the journey below is what we had seen when you made the call.`
              : `You marked this visitor as legitimate, so it stays off the exclusion list. Our own read is below, unchanged: ${v.verdict}`,
        };
      }),
    [data, overrides],
  );

  const setStatus = (ip: string, status: VisitorStatus) =>
    setOverrides((prev) => ({ ...prev, [ip]: status }));

  const navigate = (hash: string) => {
    window.location.hash = hash;
  };

  return (
    <div className="app cg-root">
      <header className="app__masthead">
        <div className="app__wordmark">
          ClickerG <span>· click-fraud protection</span>
        </div>
        {phase === 'ready' && route.name === 'list' && (
          <Button variant="cream" size="sm" onClick={load}>
            Refresh
          </Button>
        )}
      </header>

      {phase === 'error' ? (
        <EmptyState
          title="We could not load your visitors"
          body={`${error} Your protection is still running — this is a problem with the dashboard, not with blocking.`}
          action={<Button onClick={load}>Try again</Button>}
        />
      ) : route.name === 'detail' ? (
        <VisitorDetail
          visitor={visitors.find((v) => v.ip === route.ip)}
          onBack={() => navigate('#/')}
          onStatusChange={setStatus}
        />
      ) : (
        <VisitorList
          visitors={visitors}
          loading={phase === 'loading'}
          onOpen={(ip) => navigate(`#/visitor/${encodeURIComponent(ip)}`)}
        />
      )}
    </div>
  );
}
