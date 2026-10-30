export type Direction = 'L' | 'R';

export interface Path {
  decisions: Direction[];
  slot: number;
}

export function generatePath(rng: () => number, rows: number): Path {
  // Validate before drawing so a bad call never consumes values from the game stream.
  if (!Number.isInteger(rows) || rows <= 0) {
    throw new RangeError(`rows must be a positive integer, got ${rows}`);
  }

  const decisions: Direction[] = [];
  for (let r = 0; r < rows; r++) {
    decisions.push(rng() < 0.5 ? 'L' : 'R');
  }
  const slot = decisions.filter((d) => d === 'R').length;

  return { decisions, slot };
}
