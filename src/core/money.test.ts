import { describe, expect, it } from 'vitest';
import { parseAmount } from './money';

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
