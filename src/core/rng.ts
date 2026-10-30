const UINT32_RANGE = 2 ** 32;

/**
 * mulberry32 PRNG. Returns a function producing values in [0, 1).
 * The magic constants are part of the algorithm, not tunables.
 */
export function createRng(seed: number): () => number {
  if (!Number.isInteger(seed) || seed < 0 || seed >= UINT32_RANGE) {
    throw new RangeError(`seed must be an integer in [0, 2^32), got ${seed}`);
  }

  // Kept as a signed 32-bit int; `| 0` wraps the addition like C's uint32 overflow.
  let state = seed | 0;

  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / UINT32_RANGE;
  };
}
