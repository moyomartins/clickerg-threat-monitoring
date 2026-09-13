import { describe, expect, it } from 'vitest';
import { SETTLED_STATUSES, isSettled } from '../packages/ui/src/decisionSemantics';
import type { VisitorStatus } from '../packages/ui/src/StatusPill';

describe('decision semantics', () => {
  it.each([
    ['blocked', true], ['allowed', true], ['review', false], ['ambiguous', false], ['incomplete', false],
  ] as const)('maps %s to settled=%s', (status, expected) => {
    expect(isSettled(status)).toBe(expected);
  });

  it('does not treat an unknown status as settled', () => {
    expect(isSettled('unknown' as VisitorStatus)).toBe(false);
    expect(SETTLED_STATUSES).toEqual(['blocked', 'allowed']);
  });
});
