import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/SettingsContext';
import { spacing } from '../theme';

/** Friendly placeholder shown wherever a list has nothing in it yet. */
export default function EmptyState({ icon = 'wallet-outline', title, message }) {
  const theme = useTheme();
  return (
    <View style={styles.root}>
      <View style={[styles.iconWrap, { backgroundColor: theme.surface }]}>
        <Ionicons name={icon} size={40} color={theme.textMuted} />
      </View>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {!!message && (
        <Text style={[styles.message, { color: theme.textMuted }]}>{message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  message: { fontSize: 14, textAlign: 'center', lineHeight: 20, maxWidth: 280 },
});
