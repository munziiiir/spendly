import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import BudgetBar from './BudgetBar';
import CurrencySign from './CurrencySign';
import Money from './Money';
import { useSettings, useTheme } from '../context/SettingsContext';
import { continuous, radius, spacing } from '../theme';
import { formatMonth } from '../utils/format';

/**
 * Budget for one month, with the figure the user can change.
 *
 * A month keeps its own budget once the user sets one here. Every other month
 * follows the default in Settings, so a one-off month such as a holiday does
 * not force the user to change the default and change it back.
 *
 * `onFocusInput` lets the screen scroll the field clear of the keyboard. The
 * card cannot do that itself — it does not own the scroll view it sits in.
 */
export default function MonthBudgetCard({ month, spent, onFocusInput }) {
  const theme = useTheme();
  const { currency, getBudgetForMonth, setBudgetForMonth, clearBudgetForMonth } = useSettings();
  const { budget, isCustom } = getBudgetForMonth(month);

  const [text, setText] = useState(String(budget ?? ''));
  // The field follows the month the user selects, and the stored value.
  useEffect(() => {
    setText(String(budget ?? ''));
  }, [budget, month]);

  function commit() {
    const value = parseFloat(String(text).replace(/[^0-9.]/g, ''));
    const safe = Number.isFinite(value) && value >= 0 ? Math.round(value * 100) / 100 : 0;
    // The field starts at the default figure. Without this guard, a tap on the
    // field and a tap away would pin the month to the default for ever, and it
    // would stop following a later change in Settings.
    if (!isCustom && safe === budget) return;
    setBudgetForMonth(month, safe);
    setText(String(safe));
  }

  return (
    <View style={[styles.card, continuous, { backgroundColor: theme.card }]}>
      <View style={styles.headRow}>
        <Text style={[styles.title, { color: theme.text }]}>Budget</Text>
        <Text style={[styles.source, { color: isCustom ? theme.brand : theme.textMuted }]}>
          {isCustom ? 'set for this month' : 'default from Settings'}
        </Text>
      </View>

      <BudgetBar spent={spent} month={month} />

      {budget <= 0 && (
        <Text style={[styles.hint, { color: theme.textMuted }]}>
          No budget applies to {formatMonth(month)}. Enter a figure to track one.
        </Text>
      )}

      <View style={styles.editRow}>
        <View
          style={[
            styles.field,
            continuous,
            { backgroundColor: theme.surface },
          ]}
        >
          <CurrencySign code={currency} size={16} color={theme.textMuted} weight="400" />
          <TextInput
            value={text}
            onChangeText={setText}
            onFocus={onFocusInput}
            onBlur={commit}
            onSubmitEditing={commit}
            keyboardType="decimal-pad"
            returnKeyType="done"
            placeholder="0"
            placeholderTextColor={theme.textMuted}
            accessibilityLabel={`Budget for ${formatMonth(month)}`}
            style={[styles.input, { color: theme.text }]}
          />
        </View>

        {isCustom && (
          <Pressable
            onPress={() => clearBudgetForMonth(month)}
            accessibilityRole="button"
            accessibilityLabel={`Use the default budget for ${formatMonth(month)}`}
            style={({ pressed }) => [
              styles.reset,
              continuous,
              { backgroundColor: theme.surface },
              pressed && { opacity: 0.6 },
            ]}
          >
            <Text style={[styles.resetText, { color: theme.brand }]}>Use default</Text>
          </Pressable>
        )}
      </View>

      <Text style={[styles.hint, { color: theme.textMuted }]}>
        {isCustom
          ? `${formatMonth(month)} keeps this figure. Other months use the Settings default.`
          : `Change this to give ${formatMonth(month)} a budget of its own.`}
      </Text>

      {!isCustom && spent > budget && budget > 0 && (
        <View style={styles.hintRow}>
          <Text style={[styles.hint, { color: theme.danger }]}>You are </Text>
          <Money amount={spent - budget} style={[styles.hint, { color: theme.danger }]} />
          <Text style={[styles.hint, { color: theme.danger }]}> over the default budget.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, borderRadius: radius.md + 2, gap: spacing.sm },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '600' },
  source: { fontSize: 12 },
  editRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  field: {
    flex: 1,
    // Without this the field refuses to shrink below its own text, and the
    // "Use default" button beside it is pushed off the edge of the card on a
    // narrow screen.
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  input: { flex: 1, minWidth: 0, fontSize: 17, paddingVertical: spacing.sm },
  reset: {
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    minHeight: 44,
  },
  resetText: { fontSize: 14, fontWeight: '500' },
  hint: { fontSize: 13, lineHeight: 18 },
  hintRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
});
