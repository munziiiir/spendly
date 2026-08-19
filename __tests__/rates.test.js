import { RATES, convert, convertExact } from '../src/constants/rates';

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

describe('convertExact', () => {
  // A budget of 18000 rufiyaa came back as 18000.07, because the app rounded
  // the dollar figure before it saved it. The store must keep the exact figure.
  it('survives a round trip through the base currency', () => {
    [18000, 21000, 500].forEach((amount) => {
      const stored = convertExact(amount, 'MVR', 'USD');
      expect(convert(stored, 'USD', 'MVR')).toBe(amount);
    });
  });

  it('does not round the result', () => {
    expect(convertExact(18000, 'MVR', 'USD')).toBeCloseTo(18000 / RATES.MVR, 10);
  });

  it('returns zero for an amount that is not a number', () => {
    expect(convertExact(undefined, 'USD', 'MVR')).toBe(0);
  });

  it('leaves the amount alone for an unknown currency', () => {
    expect(convertExact(10, 'XYZ', 'MVR')).toBe(10);
  });
});
