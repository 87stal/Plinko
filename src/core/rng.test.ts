import { describe, expect, it } from 'vitest';
import { createRng } from './rng';

function draw(seed: number, count: number): number[] {
  const rng = createRng(seed);
  return Array.from({ length: count }, () => rng());
}

describe('createRng', () => {
  it('returns values in [0, 1) over 10 000 draws', () => {
    for (const value of draw(42, 10_000)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('produces the same sequence for the same seed', () => {
    expect(draw(12345, 100)).toEqual(draw(12345, 100));
  });

  it('produces different sequences for different seeds', () => {
    expect(draw(12345, 100)).not.toEqual(draw(12346, 100));
  });

  // Reference values from the canonical mulberry32 by bryc
  // (github.com/bryc/code/blob/master/jshash/PRNGs.md). Each value is
  // an exact uint32 / 2^32, so strict equality is safe.
  it.each([
    [42, [0.6011037519201636, 0.44829055899754167, 0.8524657934904099]],
    [0, [0.26642920868471265, 0.0003297457005828619, 0.2232720274478197]],
  ])('matches reference values for seed %s', (seed, expected) => {
    expect(draw(seed, 3)).toEqual(expected);
  });

  it('accepts the largest 32-bit seed', () => {
    expect(() => createRng(0xffffffff)).not.toThrow();
  });

  it.each([-1, 2 ** 32, 1.5, NaN, Infinity])('throws RangeError for seed %s', (seed) => {
    expect(() => createRng(seed)).toThrow(RangeError);
  });
});
