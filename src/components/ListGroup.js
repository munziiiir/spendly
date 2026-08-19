import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/SettingsContext';
import { continuous, radius, spacing } from '../theme';

/**
 * One card of an iOS inset grouped list: an optional header above it, the
 * rows, and an optional footer of explanatory text below.
 *
 * The card has no border. A grouped list is read as a lighter shape floating
 * on a darker page, and the contrast between the two is the edge — an outline
 * drawn on top of that makes the card look like a box someone drew rather than
 * a surface. The hairlines between rows are the only rules in the whole thing,
 * and `ListRow` draws those.
 */
export default function ListGroup({ title, footer, children, style }) {
  const theme = useTheme();

  return (
    <View style={styles.root}>
      {!!title && (
        <Text style={[styles.title, { color: theme.textMuted }]} accessibilityRole="header">
          {title}
        </Text>
      )}

      <View style={[styles.card, continuous, { backgroundColor: theme.card }, style]}>
        {children}
      </View>

      {!!footer && <Text style={[styles.footer, { color: theme.textMuted }]}>{footer}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { marginBottom: spacing.xl },
  // iOS sets a grouped header in upper case at 13pt, indented to the same
  // margin the rows use inside the card.
  title: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.lg,
  },
  card: { borderRadius: radius.md + 2, overflow: 'hidden' },
  footer: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.sm,
    marginHorizontal: spacing.lg,
  },
});
