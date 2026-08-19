import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/SettingsContext';
import { continuous, radius, spacing } from '../theme';

/** Inline banner used to report storage or validation failures. */
export default function ErrorBanner({ message }) {
  const theme = useTheme();
  if (!message) return null;

  return (
    <View style={[styles.root, continuous, { backgroundColor: `${theme.danger}1A` }]}>
      <Ionicons name="alert-circle" size={18} color={theme.danger} />
      <Text style={[styles.text, { color: theme.danger }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  // A tinted fill with no outline. iOS marks a warning with colour, not with a
  // frame, and a frame here competes with the cards the banner sits above.
  text: { flex: 1, fontSize: 14, fontWeight: '500' },
});
