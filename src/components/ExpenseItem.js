import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Money from './Money';
import { getCategory } from '../constants/categories';
import { convert } from '../constants/rates';
import { useSettings, useTheme } from '../context/SettingsContext';
import { continuous, radius, spacing } from '../theme';
import { formatMoney } from '../utils/format';

/**
 * A single row in the expense list. Tapping it opens the edit screen.
 *
 * A day's expenses are one card, not a stack of separate cards, so a row draws
 * no outline of its own. `first` and `last` round the ends of the card and
 * decide which row omits the hairline beneath it. Read down a day, the effect
 * is one object with rules across it, which is how iOS groups a list.
 */
export default function ExpenseItem({ expense, onPress, first, last }) {
  const theme = useTheme();
  const { currency } = useSettings();
  const category = getCategory(expense.category);

  return (
    <View
      style={[
        { backgroundColor: theme.card },
        continuous,
        first && styles.first,
        last && styles.last,
      ]}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${category.label}, ${formatMoney(
          convert(expense.amount, expense.currency || currency, currency),
          currency
        )}${expense.note ? `, ${expense.note}` : ''}. Tap to edit.`}
        style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.surface }]}
      >
        <View style={[styles.icon, { backgroundColor: category.color }]}>
          <Ionicons name={category.icon} size={18} color="#FFFFFF" />
        </View>

        <View style={styles.body}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {expense.note || category.label}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]} numberOfLines={1}>
            {category.label}
          </Text>
        </View>

        <Money
          amount={expense.amount}
          from={expense.currency}
          style={[styles.amount, { color: theme.text }]}
        />

        <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
      </Pressable>

      {/* The hairline starts where the label starts, so the icons read as a
          column rather than as a row of unrelated circles. */}
      {!last && <View style={[styles.separator, { backgroundColor: theme.separator }]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  first: { borderTopLeftRadius: radius.md + 2, borderTopRightRadius: radius.md + 2 },
  last: { borderBottomLeftRadius: radius.md + 2, borderBottomRightRadius: radius.md + 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 58,
  },
  // A filled circle, the way iOS marks a category in Reminders or Wallet. The
  // tinted-square version reads as an app icon and competes with the amount.
  icon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 1 },
  title: { fontSize: 17 },
  subtitle: { fontSize: 13 },
  amount: { fontSize: 17, fontWeight: '600' },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 60 },
});
