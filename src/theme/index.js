/**
 * Central colour palettes for the app.
 *
 * Keeping both palettes in one place means every screen reads its colours from
 * the same source, so adding a new themed screen never means hunting down
 * hard-coded hex values.
 *
 * The values are Apple's own system colours. The app draws its cards and
 * buttons next to controls that iOS draws itself — the navigation bar, the
 * sheet grabber, the date picker. A custom palette makes those native controls
 * look like a mistake, because the user sees two different apps on one screen.
 * Matching the system palette removes that clash.
 */

/** Colours that mean the same thing in both palettes. */
const shared = {
  brandLight: '#5AC8FA', // systemLightBlue, for chart accents only
};

export const lightTheme = {
  mode: 'light',
  ...shared,

  brand: '#007AFF', // systemBlue
  danger: '#FF3B30', // systemRed
  success: '#34C759', // systemGreen
  warning: '#FF9500', // systemOrange

  // iOS groups content into cards that float on a slightly darker page. The
  // page is `background`, a card is `card`.
  background: '#F2F2F7', // systemGroupedBackground
  card: '#FFFFFF', // secondarySystemGroupedBackground
  surface: '#E9E9EB', // secondarySystemFill — segmented tracks, input wells

  text: '#000000', // label
  textMuted: '#8A8A8E', // secondaryLabel, flattened to an opaque value

  // `border` draws a visible edge; `separator` draws the hairline between rows
  // of a grouped list. They are different weights of the same idea, so keeping
  // them apart stops a list looking like a stack of boxes.
  border: '#D8D8DC',
  separator: '#C6C6C8',

  // The raised thumb of a segmented control. It is lighter than its track and
  // carries a shadow, which is what makes the selected segment read as on top.
  segmentThumb: '#FFFFFF',

  onBrand: '#FFFFFF',
};

export const darkTheme = {
  mode: 'dark',
  ...shared,

  brand: '#0A84FF', // systemBlue, dark variant
  danger: '#FF453A',
  success: '#30D158',
  warning: '#FF9F0A',

  // True black rather than a dark grey. It is what iOS uses for a grouped
  // page in dark mode, and it is what an OLED phone shows best.
  background: '#000000',
  card: '#1C1C1E',
  surface: '#2C2C2E',

  text: '#FFFFFF',
  textMuted: '#8E8E93',

  border: '#38383A',
  separator: '#38383A',

  // In dark mode the thumb is lighter than the track, not white.
  segmentThumb: '#636366',

  onBrand: '#FFFFFF',
};

/** Shared spacing scale, used instead of magic numbers in styles. */
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

/**
 * Shared corner radii.
 *
 * The figures follow iOS: a grouped list card is 10, a prominent card is 16,
 * and a full-width button is 14.
 */
export const radius = { sm: 8, md: 10, lg: 16, button: 14, pill: 999 };

/**
 * Applied to anything with a corner radius.
 *
 * iOS corners are squircles, not circular arcs. `continuous` asks the platform
 * for the squircle. Android ignores the property, so it is safe to spread it
 * everywhere.
 */
export const continuous = { borderCurve: 'continuous' };

/**
 * The shadow under a raised surface: the Add button, and the thumb of a
 * segmented control.
 *
 * iOS shadows are wide and very faint. The heavy drop shadow that reads as
 * "elevated" on Android reads as cheap on iOS, so this is deliberately weak.
 */
export const shadow = {
  soft: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  thumb: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
};
