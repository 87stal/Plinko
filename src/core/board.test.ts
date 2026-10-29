import { describe, expect, it } from 'vitest';
import { computeBoardLayout, type Peg } from './board';

function pegsInRow(pegs: Peg[], row: number): Peg[] {
  return pegs.filter((p) => p.row === row).sort((a, b) => a.index - b.index);
}

describe('computeBoardLayout', () => {
  it.each([0, -1, 2.5])('throws for invalid row count %s', (rows) => {
    expect(() => computeBoardLayout(rows)).toThrow();
  });

  it('builds 52 pegs for 8 rows, with r + 3 pegs in row r', () => {
    const { pegs } = computeBoardLayout(8);
    expect(pegs).toHaveLength(52);
    for (let r = 0; r < 8; r++) {
      expect(pegsInRow(pegs, r)).toHaveLength(r + 3);
    }
  });

  it('centers every row around x = 0', () => {
    const { pegs } = computeBoardLayout(8);
    for (let r = 0; r < 8; r++) {
      const row = pegsInRow(pegs, r);
      const first = row[0];
      const last = row[row.length - 1];
      expect(first && last && first.x + last.x).toBeCloseTo(0);
    }
  });

  it('spaces pegs 1 unit apart horizontally and puts row r at y = r', () => {
    const { pegs } = computeBoardLayout(8);
    for (let r = 0; r < 8; r++) {
      const row = pegsInRow(pegs, r);
      row.forEach((peg, i) => {
        expect(peg.y).toBe(r);
        const next = row[i + 1];
        if (next) expect(next.x - peg.x).toBeCloseTo(1);
      });
    }
  });

  it('reports bounds that contain every peg', () => {
    const { width, height, pegs } = computeBoardLayout(8);
    expect(width).toBe(9);
    expect(height).toBe(7);
    for (const peg of pegs) {
      expect(Math.abs(peg.x)).toBeLessThanOrEqual(width / 2);
      expect(peg.y).toBeGreaterThanOrEqual(0);
      expect(peg.y).toBeLessThanOrEqual(height);
    }
  });

  it('handles a single row', () => {
    const layout = computeBoardLayout(1);
    expect(layout.pegs.map((p) => p.x)).toEqual([-1, 0, 1]);
    expect(layout.width).toBe(2);
    expect(layout.height).toBe(0);
  });
});
