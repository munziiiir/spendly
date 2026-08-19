/**
 * The fixed set of spending categories.
 *
 * Each category carries its own colour and Ionicons glyph so that the list,
 * the picker and the statistics chart all render a category identically.
 *
 * The colours are Apple's system colours. They sit beside the system blue the
 * rest of the app uses, and they are the hues an iOS user already reads as
 * "a category tint" in Calendar, Reminders and Health.
 */
export const CATEGORIES = [
  { id: 'food', label: 'Food & Drink', icon: 'fast-food', color: '#FF9500' },
  { id: 'transport', label: 'Transport', icon: 'bus', color: '#30B0C7' },
  { id: 'shopping', label: 'Shopping', icon: 'bag-handle', color: '#FF2D55' },
  { id: 'bills', label: 'Bills', icon: 'receipt', color: '#5856D6' },
  { id: 'fun', label: 'Entertainment', icon: 'game-controller', color: '#34C759' },
  { id: 'health', label: 'Health', icon: 'fitness', color: '#FF3B30' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal', color: '#8E8E93' },
];

/** Look up a category by id, falling back to "Other" for unknown ids. */
export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

/**
 * The `symbol` of a currency is its text form. It goes into screen reader
 * labels and into any plain string.
 *
 * The rufiyaa has no sign in Unicode, so its text form is the code "MVR".
 * On screen the app draws the official sign instead: see RufiyaaSign and the
 * Money component.
 */
export const CURRENCIES = [
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'MVR', symbol: 'MVR', label: 'Maldivian Rufiyaa' },
];

export function getCurrencySymbol(code) {
  const match = CURRENCIES.find((c) => c.code === code);
  return match ? match.symbol : '£';
}
