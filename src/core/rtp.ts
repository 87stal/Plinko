/**
 * Expected return per unit bet when every row is a fair 50/50 decision:
 * Σ C(n, k) / 2^n × multiplier_k, with n = paytable.length − 1.
 */
export function theoreticalRtp(paytable: readonly number[]): number {
  if (paytable.length === 0) {
    throw new RangeError('paytable must have at least one slot');
  }

  const n = paytable.length - 1;
  let weightedSum = 0;
  let binomial = 1; // C(n, 0)
  for (let k = 0; k <= n; k++) {
    weightedSum += binomial * paytable[k]!;
    // Multiply before dividing so each C(n, k) stays an exact integer.
    binomial = (binomial * (n - k)) / (k + 1);
  }

  return weightedSum / (100 * 2 ** n);
}
