import { getCurrencySymbol } from '../constants/categories';

/** Format a number as a currency string, e.g. 12.5 -> "£12.50". */
export function formatMoney(amount, currencyCode = 'GBP') {
  const value = Number.isFinite(amount) ? amount : 0;
  const symbol = getCurrencySymbol(currencyCode);
  // A symbol written in letters, such as "Rs", needs a space before the digits.
  // A drawn sign such as "£" or the rufiyaa sign does not.
  const gap = /[A-Za-z]$/.test(symbol) ? ' ' : '';
  return `${symbol}${gap}${value.toFixed(2)}`;
}

/** "2026-08-17" -> "17 Aug 2026" */
export function formatDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Friendly heading for a date: "Today", "Yesterday", or the full date. */
export function formatDateHeading(iso) {
  const today = toDateKey(new Date());
  const yesterday = toDateKey(new Date(Date.now() - 86400000));
  if (iso === today) return 'Today';
  if (iso === yesterday) return 'Yesterday';
  return formatDate(iso);
}

/** Date -> "YYYY-MM-DD" in local time (avoids the UTC shift of toISOString). */
export function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** "2026-08-17" -> "2026-08" */
export function toMonthKey(iso) {
  return String(iso).slice(0, 7);
}

/** "2026-08" -> "August 2026" */
export function formatMonth(monthKey) {
  const [year, month] = String(monthKey).split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  if (Number.isNaN(date.getTime())) return monthKey;
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

/** Step a "YYYY-MM" key forward or backward by n months. */
export function shiftMonth(monthKey, delta) {
  const [year, month] = String(monthKey).split('-').map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** Validate the amount typed into the expense form. */
export function parseAmount(input) {
  const raw = String(input);
  const cleaned = raw.replace(/[^0-9.]/g, '');
  const value = parseFloat(cleaned);
  if (!cleaned || Number.isNaN(value)) return { ok: false, error: 'Enter an amount' };
  // The clean-up above removes a minus sign, so "-4" would otherwise pass the
  // zero check as 4. Look at the original text instead.
  if (raw.includes('-') || value <= 0) {
    return { ok: false, error: 'Amount must be more than zero' };
  }
  if (value > 1000000) return { ok: false, error: 'That amount looks too large' };
  return { ok: true, value: Math.round(value * 100) / 100 };
}

/** Accepts YYYY-MM-DD and rejects impossible dates such as 2026-02-31. */
export function parseDate(input) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(input).trim());
  if (!match) return { ok: false, error: 'Use the format YYYY-MM-DD' };
  const [, y, m, d] = match.map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
    return { ok: false, error: 'That date does not exist' };
  }
  return { ok: true, value: input.trim() };
}
