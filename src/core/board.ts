export interface Peg {
  row: number;
  index: number;
  x: number;
  y: number;
}

/** Peg positions in board units: spacing = 1, origin at the top-center of the board. */
export interface BoardLayout {
  rows: number;
  pegs: Peg[];
  width: number;
  height: number;
}

export function computeBoardLayout(rows: number): BoardLayout {
  if (!Number.isInteger(rows) || rows < 1) {
    throw new RangeError(`rows must be a positive integer, got ${rows}`);
  }

  const pegs: Peg[] = [];
  for (let row = 0; row < rows; row++) {
    // Row r has r + 3 pegs, so the bottom row leaves rows + 1 gaps for the slots.
    const count = row + 3;
    for (let index = 0; index < count; index++) {
      pegs.push({ row, index, x: index - (count - 1) / 2, y: row });
    }
  }

  return { rows, pegs, width: rows + 1, height: rows - 1 };
}
