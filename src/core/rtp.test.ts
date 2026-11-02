import { describe, expect, it } from 'vitest';
import { BOARD_ROWS, PAYTABLE } from '../config';
import { generatePath } from './path';
import { payoutCents } from './payout';
import { createRng } from './rng';
import { theoreticalRtp } from './rtp';

describe('PAYTABLE shape', () => {
  it('has BOARD_ROWS + 1 entries', () => {
    expect(PAYTABLE).toHaveLength(BOARD_ROWS + 1);
  });

  it('is symmetric', () => {
    expect([...PAYTABLE].reverse()).toEqual(PAYTABLE);
  });
});

describe('theoreticalRtp', () => {
  it('returns 253.4 / 256 for PAYTABLE', () => {
    expect(theoreticalRtp(PAYTABLE)).toBeCloseTo(253.4 / 256, 12);
  });

  it('returns 1 when every slot pays ×1', () => {
    expect(theoreticalRtp(Array<number>(9).fill(100))).toBeCloseTo(1, 12);
  });

  it('weights slots by C(n, k) / 2^n', () => {
    // n = 2: probabilities 1/4, 2/4, 1/4, so only the middle slot paying ×1 gives 0.5.
    expect(theoreticalRtp([0, 100, 0])).toBeCloseTo(0.5, 12);
    expect(theoreticalRtp([100, 0, 0])).toBeCloseTo(0.25, 12);
  });

  it('handles a single-slot paytable (n = 0)', () => {
    expect(theoreticalRtp([250])).toBeCloseTo(2.5, 12);
  });

  it('throws RangeError for an empty paytable', () => {
    expect(() => theoreticalRtp([])).toThrow(RangeError);
  });
});

describe('simulated RTP', () => {
  it('is within ±1% of theoretical over 100 000 seeded drops', () => {
    const drops = 100_000;
    const bet = 100; // 1.00 — every multiplier pays a whole number of cents, so no flooring bias.
    const rng = createRng(12345);

    let totalPayout = 0;
    for (let n = 0; n < drops; n++) {
      const { slot } = generatePath(rng, BOARD_ROWS);
      totalPayout += payoutCents(bet, PAYTABLE[slot]!);
    }

    const measured = totalPayout / (drops * bet);
    const expected = theoreticalRtp(PAYTABLE);
    expect(Math.abs(measured - expected)).toBeLessThanOrEqual(0.01 * expected);
  });
});
