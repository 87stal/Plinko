// No `u` flag, so \d is ASCII 0–9 only.
const AMOUNT_PATTERN = /^(\d+)(?:[.,](\d{0,2}))?$/;

/** Parses user-typed currency text into integer cents, or null if it isn't a valid amount. */
export function parseAmount(text: string): number | null {
  const match = AMOUNT_PATTERN.exec(text.trim());
  if (match === null) return null;

  const [, whole = '', fraction = ''] = match;
  // Integer maths only: "2,5" → 2 × 100 + 50, never 2.5 × 100.
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));

  return Number.isSafeInteger(cents) ? cents : null;
}

function assertNonNegativeInteger(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer, got ${value}`);
  }
}

/** Splits a value in hundredths into its whole part and a 2-digit fraction string. */
function splitHundredths(value: number): [whole: number, fraction: string] {
  const remainder = value % 100;
  return [(value - remainder) / 100, String(remainder).padStart(2, '0')];
}

/** 1234 → "12.34". Always 2 decimals, no thousands separator, so parseAmount reads it back. */
export function formatCents(cents: number): string {
  assertNonNegativeInteger('cents', cents);
  const [whole, fraction] = splitHundredths(cents);
  return `${whole}.${fraction}`;
}

/** 560 → "×5.6", 100 → "×1". Trailing zeros are dropped. */
export function formatMultiplier(hundredths: number): string {
  assertNonNegativeInteger('hundredths', hundredths);
  const [whole, fraction] = splitHundredths(hundredths);
  const trimmed = fraction.replace(/0+$/, '');
  return trimmed === '' ? `×${whole}` : `×${whole}.${trimmed}`;
}
