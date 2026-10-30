function assertNonNegativeInteger(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer, got ${value}`);
  }
}

/** floor(bet × multiplier / 100), in cents. */
export function payoutCents(betCents: number, multiplierHundredths: number): number {
  assertNonNegativeInteger('betCents', betCents);
  assertNonNegativeInteger('multiplierHundredths', multiplierHundredths);

  // Subtracting the remainder first keeps every step an exact integer, no float floor needed.
  const product = betCents * multiplierHundredths;
  return (product - (product % 100)) / 100;
}
