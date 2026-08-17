/**
 * The fixed set of spending categories.
 *
 * Each category carries its own colour and Ionicons glyph so that the list,
 * the picker and the statistics chart all render a category identically.
 */
export const CATEGORIES = [
  { id: 'food', label: 'Food & Drink', icon: 'fast-food', color: '#F97316' },
  { id: 'transport', label: 'Transport', icon: 'bus', color: '#0EA5E9' },
  { id: 'shopping', label: 'Shopping', icon: 'bag-handle', color: '#EC4899' },
  { id: 'bills', label: 'Bills', icon: 'receipt', color: '#8B5CF6' },
  { id: 'fun', label: 'Entertainment', icon: 'game-controller', color: '#22C55E' },
  { id: 'health', label: 'Health', icon: 'fitness', color: '#EF4444' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal', color: '#64748B' },
];

/** Look up a category by id, falling back to "Other" for unknown ids. */
export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

/**
 * The rufiyaa sign has no code point of its own in Unicode. The Maldives
 * Monetary Authority draws it as the Thaana letter Raa with a line through it,
 * so it is built here from Raa (U+0783) and a combining long stroke overlay
 * (U+0336).
 *
 * Raa is a right-to-left letter. On its own it turns the whole line
 * right-to-left and the sign lands after the digits. A left-to-right mark
 * (U+200E) on each side isolates it: the first mark keeps the line
 * left-to-right, and the second closes the right-to-left run before the digits.
 */
const RUFIYAA_SIGN = '‎ރ̶‎';

export const CURRENCIES = [
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'MVR', symbol: RUFIYAA_SIGN, label: 'Maldivian Rufiyaa' },
];

export function getCurrencySymbol(code) {
  const match = CURRENCIES.find((c) => c.code === code);
  return match ? match.symbol : '£';
}
