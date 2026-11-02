import { describe, expect, it } from 'vitest';
import { formatCents, formatMultiplier, parseAmount } from './money';

describe('parseAmount', () => {
  it.each([
    ['1', 100],
    ['2,5', 250],
    [' 0.01 ', 1],
    ['10.', 1000],
    ['10,', 1000],
    ['0', 0], // range checks belong to validateBet, not parsing
    ['007', 700],
    ['12.34', 1234],
    ['1,05', 105],
    ['100.00', 10_000],
    ['\t3\n', 300],
  ])('%j → %s', (text, expected) => {
    expect(parseAmount(text)).toBe(expected);
  });

  it.each([
    '',
    '   ',
    '-1',
    '+1',
    '1e2',
    '1.234',
    '1,2.3',
    '1.2.3',
    'abc',
    '.',
    ',',
    '.5', // a digit is required before the separator
    '1 000',
    '1_000',
    '0x10',
    'Infinity',
    'NaN',
    '١', // Arabic-Indic digit: only ASCII 0–9 count
    '99999999999999999999', // more cents than a safe integer can hold
  ])('%j → null', (text) => {
    expect(parseAmount(text)).toBeNull();
  });
});

describe('formatCents', () => {
  it.each([
    [100_000, '1000.00'], // no thousands separator
    [5, '0.05'],
    [0, '0.00'],
    [50, '0.50'],
    [100, '1.00'],
    [1234, '12.34'],
    [10_000, '100.00'],
    [123_456_789, '1234567.89'],
  ])('%s → %j', (cents, expected) => {
    expect(formatCents(cents)).toBe(expected);
  });

  it.each([1, 5, 99, 100, 250, 1234, 100_000])('round-trips through parseAmount (%s)', (cents) => {
    expect(parseAmount(formatCents(cents))).toBe(cents);
  });

  it.each([-1, 1.5, NaN, Infinity])('throws RangeError for %s', (cents) => {
    expect(() => formatCents(cents)).toThrow(RangeError);
  });
});

describe('formatMultiplier', () => {
  it.each([
    [560, '×5.6'],
    [100, '×1'],
    [50, '×0.5'],
    [210, '×2.1'],
    [110, '×1.1'],
    [105, '×1.05'],
    [5, '×0.05'],
    [0, '×0'],
    [1000, '×10'],
  ])('%s → %j', (hundredths, expected) => {
    expect(formatMultiplier(hundredths)).toBe(expected);
  });

  it.each([-1, 1.5, NaN, Infinity])('throws RangeError for %s', (hundredths) => {
    expect(() => formatMultiplier(hundredths)).toThrow(RangeError);
  });
});
