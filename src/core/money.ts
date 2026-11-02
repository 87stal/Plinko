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
