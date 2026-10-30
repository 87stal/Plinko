import { describe, expect, it } from 'vitest';
import { generatePath } from './path';
import { createRng } from './rng';

/** Returns the given values in order and counts calls; throws if over-drawn. */
function stubRng(values: number[]): { rng: () => number; calls: () => number } {
  let i = 0;
  return {
    rng: () => {
      const value = values[i];
      if (value === undefined) throw new Error(`stub RNG exhausted after ${i} calls`);
      i++;
      return value;
    },
    calls: () => i,
  };
}

describe('generatePath', () => {
  it('maps < 0.5 to L and >= 0.5 to R, including the 0.5 boundary', () => {
    const { rng } = stubRng([0.49, 0.5, 0, 0.999, 0.5, 0.4999, 0.25, 0.75]);
    expect(generatePath(rng, 8)).toEqual({
      decisions: ['L', 'R', 'L', 'R', 'R', 'L', 'L', 'R'],
      slot: 4,
    });
  });

  it.each([1, 8, 16])('calls rng exactly rows times (rows = %s)', (rows) => {
    const { rng, calls } = stubRng(Array<number>(rows + 5).fill(0.3));
    generatePath(rng, rows);
    expect(calls()).toBe(rows);
  });

  it('gives slot 0 for all L and slot rows for all R', () => {
    expect(generatePath(stubRng(Array<number>(8).fill(0)).rng, 8).slot).toBe(0);
    expect(generatePath(stubRng(Array<number>(8).fill(0.99)).rng, 8).slot).toBe(8);
  });

  it('sets slot to the number of R decisions, always in 0..rows', () => {
    const rng = createRng(7);
    for (let n = 0; n < 1000; n++) {
      const { decisions, slot } = generatePath(rng, 8);
      expect(decisions).toHaveLength(8);
      expect(slot).toBe(decisions.filter((d) => d === 'R').length);
      expect(slot).toBeGreaterThanOrEqual(0);
      expect(slot).toBeLessThanOrEqual(8);
    }
  });

  it.each([0, -1, 2.5, NaN, Infinity])(
    'throws RangeError for rows = %s without calling rng',
    (rows) => {
      const { rng, calls } = stubRng([0.5]);
      expect(() => generatePath(rng, rows)).toThrow(RangeError);
      expect(calls()).toBe(0);
    },
  );
});
