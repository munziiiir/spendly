import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/SettingsContext';
import { radius, spacing } from '../theme';

/** Inline banner used to report storage or validation failures. */
export default function ErrorBanner({ message }) {
  const theme = useTheme();
  if (!message) return null;

  return (
    <View style={[styles.root, { backgroundColor: `${theme.danger}22`, borderColor: theme.danger }]}>
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
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  text: { flex: 1, fontSize: 13, fontWeight: '600' },
});
