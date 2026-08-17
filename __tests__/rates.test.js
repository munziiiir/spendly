import { RATES, convert } from '../src/constants/rates';

/**
 * Tests for the fixed exchange rates.
 *
 * The rufiyaa is pegged to the US dollar, so the dollar figures are exact and
 * worth asserting. The other pairs only need to round-trip.
 */

describe('convert', () => {
  it('returns the same amount when the currencies match', () => {
    expect(convert(10, 'USD', 'USD')).toBe(10);
  });

  it('converts dollars to rufiyaa at the pegged rate', () => {
    expect(convert(10, 'USD', 'MVR')).toBe(154.2);
  });

  it('converts rufiyaa back to dollars', () => {
    expect(convert(154.2, 'MVR', 'USD')).toBe(10);
  });

  it('rounds to two decimal places', () => {
    const value = convert(1, 'GBP', 'MVR');
    expect(Number(value.toFixed(2))).toBe(value);
  });

  it('leaves the amount alone for an unknown currency', () => {
    expect(convert(10, 'XYZ', 'MVR')).toBe(10);
    expect(convert(10, 'USD', 'XYZ')).toBe(10);
  });

  it('returns zero for an amount that is not a number', () => {
    expect(convert(undefined, 'USD', 'MVR')).toBe(0);
  });

  it('holds a rate for every currency the app offers', () => {
    ['GBP', 'USD', 'EUR', 'MVR'].forEach((code) => {
      expect(RATES[code]).toBeGreaterThan(0);
    });
  });
});
