import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '../context/SettingsContext';
import { radius, spacing } from '../theme';

/**
 * The main call to action of the app: record an expense.
 *
 * It floats over the bottom of the expense list rather than sitting in the tab
 * bar, because adding an expense is an action and the tabs are places. The
 * list keeps a bottom padding wide enough that the button never covers the
 * last row.
 */
export default function AddExpenseButton() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push('/expense/new')}
      accessibilityRole="button"
      accessibilityLabel="Add an expense"
      style={({ pressed }) => [
        styles.root,
        { backgroundColor: theme.brand },
        pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
      ]}
    >
      <Ionicons name="add" size={24} color={theme.onBrand} />
      <Text style={[styles.label, { color: theme.onBrand }]}>Add expense</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingLeft: spacing.lg,
    paddingRight: spacing.xl,
    borderRadius: radius.pill,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  label: { fontSize: 15, fontWeight: '700' },
});
