import { NOW } from './data/mock';

export const money = (n: number) => `£${n.toFixed(2)}`;

export const dateTime = (ms: number) =>
  new Date(ms).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const date = (ms: number) =>
  new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/* An evidence record has to be unambiguous about when, so the detail hero states
   the zone rather than rendering in whatever zone the reader happens to sit in. */
export const dateUtc = (ms: number) =>
  new Date(ms).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  });

export const timeUtc = (ms: number) =>
  `${new Date(ms).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC',
  })} UTC`;

/** Hero-density date: no year, since the decisive stamp already carries it. */
export const dateUtcShort = (ms: number) =>
  new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

export const iso = (ms: number) => new Date(ms).toISOString();

/** First seen to last seen, in the coarsest unit that still reads true. */
export function span(fromMs: number, toMs: number) {
  const mins = Math.max(0, Math.round((toMs - fromMs) / 60_000));
  if (mins < 60) return `${Math.max(1, mins)} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr`;
  const days = Math.round(hours / 24);
  return days === 1 ? '1 day' : `${days} days`;
}

/** Relative to the fixed mock "now", so the copy stays stable between runs. */
export function relative(ms: number) {
  const diff = NOW - ms;
  const mins = Math.round(diff / 60_000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'yesterday' : `${days}d ago`;
}
