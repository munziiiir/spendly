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

export const CURRENCIES = [
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'MVR', symbol: 'Rf', label: 'Maldivian Rufiyaa' },
];

export function getCurrencySymbol(code) {
  const match = CURRENCIES.find((c) => c.code === code);
  return match ? match.symbol : '£';
}
