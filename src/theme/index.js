/**
 * Central colour palettes for the app.
 *
 * Keeping both palettes in one place means every screen reads its colours from
 * the same source, so adding a new themed screen never means hunting down
 * hard-coded hex values.
 */

const palette = {
  brand: '#4F46E5',
  brandLight: '#818CF8',
  danger: '#DC2626',
  success: '#059669',
  warning: '#D97706',
};

export const lightTheme = {
  mode: 'light',
  ...palette,
  background: '#F5F6FA',
  card: '#FFFFFF',
  surface: '#EEF0F6',
  text: '#11131A',
  textMuted: '#6B7280',
  border: '#E2E5EC',
  onBrand: '#FFFFFF',
};

export const darkTheme = {
  mode: 'dark',
  ...palette,
  brand: '#818CF8',
  background: '#0E1015',
  card: '#181B23',
  surface: '#22262F',
  text: '#F3F4F6',
  textMuted: '#9CA3AF',
  border: '#2C313B',
  onBrand: '#11131A',
};

/** Shared spacing scale, used instead of magic numbers in styles. */
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

/** Shared corner radii. */
export const radius = { sm: 8, md: 12, lg: 16, pill: 999 };
