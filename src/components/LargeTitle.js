import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/SettingsContext';
import { spacing } from '../theme';

/**
 * The large title at the top of a tab.
 *
 * It lives inside the scrolling content rather than in a bar above it, which
 * is how iOS behaves: the large title belongs to the page and travels up out
 * of the way as the user reads. `NavBar` then fades in to keep the title
 * available once this one has gone.
 *
 * The tab navigator draws no header of its own, so this and `NavBar` are the
 * only titles on a tab screen. That is deliberate — a navigation bar drawn by
 * iOS and a card drawn by the app never quite agree on their background, and
 * the seam between them is the thing that makes an app look unfinished.
 */
export default function LargeTitle({ title, subtitle, right }) {
  const theme = useTheme();

  return (
    <View style={styles.root}>
      <View style={styles.textBlock}>
        <Text
          style={[styles.title, { color: theme.text }]}
          // The title is the heading of the screen for a screen reader, so it
          // is announced before the content rather than as one more label.
          accessibilityRole="header"
          maxFontSizeMultiplier={1.6}
        >
          {title}
        </Text>
        {!!subtitle && (
          <Text style={[styles.subtitle, { color: theme.textMuted }]} maxFontSizeMultiplier={1.6}>
            {subtitle}
          </Text>
        )}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  textBlock: { flex: 1 },
  // 34pt bold is the iOS large title. The tight letter spacing matches the
  // optical tracking the system font applies at that size.
  title: { fontSize: 34, fontWeight: '700', letterSpacing: 0.37 },
  subtitle: { fontSize: 15, marginTop: 2 },
});
