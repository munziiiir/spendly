import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getCategory } from '../constants/categories';
import { useSettings, useTheme } from '../context/SettingsContext';
import { radius, spacing } from '../theme';
import { formatMoney } from '../utils/format';

/** A single row in the expense list. Tapping it opens the edit screen. */
export default function ExpenseItem({ expense, onPress }) {
  const theme = useTheme();
  const { currency } = useSettings();
  const category = getCategory(expense.category);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${category.label}, ${formatMoney(expense.amount, currency)}${
        expense.note ? `, ${expense.note}` : ''
      }. Tap to edit.`}
      style={({ pressed }) => [
        styles.root,
        { backgroundColor: theme.card, borderColor: theme.border },
        pressed && { opacity: 0.6 },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: `${category.color}22` }]}>
        <Ionicons name={category.icon} size={20} color={category.color} />
      </View>

      <View style={styles.body}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {expense.note || category.label}
        </Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]} numberOfLines={1}>
          {category.label}
        </Text>
      </View>

      <Text style={[styles.amount, { color: theme.text }]}>
        {formatMoney(expense.amount, currency)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  icon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontWeight: '600' },
  subtitle: { fontSize: 12 },
  amount: { fontSize: 16, fontWeight: '700' },
});
