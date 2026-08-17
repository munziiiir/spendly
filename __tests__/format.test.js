import {
  formatMoney,
  parseAmount,
  parseDate,
  shiftMonth,
  toDateKey,
  toMonthKey,
} from '../src/utils/format';

/**
 * Tests for the formatting and validation helpers.
 *
 * parseAmount and parseDate guard every write into the expense list, so their
 * rejection cases matter more than the happy path.
 */

describe('formatMoney', () => {
  it('uses the symbol of the given currency and always shows two decimals', () => {
    expect(formatMoney(12.5, 'GBP')).toBe('£12.50');
    expect(formatMoney(12.5, 'USD')).toBe('$12.50');
    expect(formatMoney(12.5, 'EUR')).toBe('€12.50');
  });

  it('puts a space after a word symbol such as the Maldivian Rufiyaa', () => {
    expect(formatMoney(110.5, 'MVR')).toBe('Rf 110.50');
  });

  it('falls back to zero for a value that is not a number', () => {
    expect(formatMoney(undefined, 'GBP')).toBe('£0.00');
  });

  it('falls back to the pound symbol for an unknown currency', () => {
    expect(formatMoney(5, 'XYZ')).toBe('£5.00');
  });
});

describe('parseAmount', () => {
  it('accepts a plain decimal and rounds to two places', () => {
    expect(parseAmount('12.345')).toEqual({ ok: true, value: 12.35 });
  });

  it('strips currency symbols and spaces', () => {
    expect(parseAmount('£ 5.00')).toEqual({ ok: true, value: 5 });
  });

  it('rejects an empty amount', () => {
    expect(parseAmount('').ok).toBe(false);
  });

  it('rejects text', () => {
    expect(parseAmount('abc').ok).toBe(false);
  });

  it('rejects zero and negative amounts', () => {
    expect(parseAmount('0').ok).toBe(false);
    expect(parseAmount('-4').ok).toBe(false);
  });

  it('rejects an amount above the one million limit', () => {
    expect(parseAmount('1000001').ok).toBe(false);
  });
});

describe('parseDate', () => {
  it('accepts a real date in YYYY-MM-DD form', () => {
    expect(parseDate('2026-08-17')).toEqual({ ok: true, value: '2026-08-17' });
  });

  it('rejects a date that does not exist', () => {
    expect(parseDate('2026-02-31').ok).toBe(false);
  });

  it('rejects the wrong format', () => {
    expect(parseDate('17/08/2026').ok).toBe(false);
    expect(parseDate('').ok).toBe(false);
  });

  it('accepts 29 February in a leap year and rejects it otherwise', () => {
    expect(parseDate('2024-02-29').ok).toBe(true);
    expect(parseDate('2026-02-29').ok).toBe(false);
  });
});

describe('date keys', () => {
  it('formats a Date in local time, not UTC', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('takes the month key from a date string', () => {
    expect(toMonthKey('2026-08-17')).toBe('2026-08');
  });

  it('steps a month key forward and backward across a year boundary', () => {
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
  });
});
