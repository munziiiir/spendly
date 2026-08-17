/**
 * Fixed exchange rates, held against the US dollar.
 *
 * Spendly works offline, so it cannot ask a rate service. The rates below are
 * written into the app instead. Change this file to change them; nothing else
 * needs an edit.
 *
 * The Maldivian Rufiyaa is pegged to the US dollar by the Maldives Monetary
 * Authority, so 15.42 is stable. The pound and the euro float, so their figures
 * drift over time and the app shows an approximate amount for them.
 *
 * Rates taken on 17 August 2026.
 */
export const RATES_TAKEN_ON = '17 August 2026';

/** How many units of each currency one US dollar buys. */
export const RATES = {
  USD: 1,
  MVR: 15.42,
  GBP: 0.79,
  EUR: 0.92,
};

/**
 * Convert an amount between two currencies.
 *
 * An unknown currency returns the amount unchanged, so a damaged record shows
 * its figure rather than NaN.
 */
export function convert(amount, from, to) {
  if (!Number.isFinite(amount)) return 0;
  if (from === to) return amount;

  const fromRate = RATES[from];
  const toRate = RATES[to];
  if (!fromRate || !toRate) return amount;

  return Math.round(((amount / fromRate) * toRate + Number.EPSILON) * 100) / 100;
}
