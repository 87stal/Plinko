import { describe, expect, it } from 'vitest';
import { PAYTABLE } from '../config';
import { payoutCents } from './payout';

describe('PAYTABLE', () => {
  it('holds the §3.2 multipliers in hundredths', () => {
    expect(PAYTABLE).toEqual([560, 210, 110, 100, 50, 100, 110, 210, 560]);
  });
});

describe('payoutCents', () => {
  it.each([
    [100, 560, 560],
    [101, 50, 50], // 50.5 floors to 50
    [333, 110, 366], // 366.3 floors to 366
    [0, 560, 0],
    [10_000, 560, 56_000], // max bet on the top slot
  ])('%s × %s → %s', (bet, multiplier, expected) => {
    expect(payoutCents(bet, multiplier)).toBe(expected);
  });

  it.each([
    [-1, 100],
    [1.5, 100],
    [NaN, 100],
    [Infinity, 100],
    [100, -1],
    [100, 1.5],
    [100, NaN],
  ])('throws RangeError for bet %s, multiplier %s', (bet, multiplier) => {
    expect(() => payoutCents(bet, multiplier)).toThrow(RangeError);
  });
});
