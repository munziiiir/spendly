import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import BudgetBar from './BudgetBar';
import Money from './Money';
import { useSettings, useTheme } from '../context/SettingsContext';
import { radius, spacing } from '../theme';
import { formatMonth } from '../utils/format';

/**
 * Budget for one month, with the figure the user can change.
 *
 * A month keeps its own budget once the user sets one here. Every other month
 * follows the default in Settings, so a one-off month such as a holiday does
 * not force the user to change the default and change it back.
 */
export default function MonthBudgetCard({ month, spent }) {
  const theme = useTheme();
  const { getBudgetForMonth, setBudgetForMonth, clearBudgetForMonth } = useSettings();
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
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
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
        <TextInput
          value={text}
          onChangeText={setText}
          onBlur={commit}
          onSubmitEditing={commit}
          keyboardType="decimal-pad"
          returnKeyType="done"
          placeholder="0"
          placeholderTextColor={theme.textMuted}
          accessibilityLabel={`Budget for ${formatMonth(month)}`}
          style={[
            styles.input,
            { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text },
          ]}
        />
        {isCustom && (
          <Pressable
            onPress={() => clearBudgetForMonth(month)}
            accessibilityRole="button"
            accessibilityLabel={`Use the default budget for ${formatMonth(month)}`}
            style={({ pressed }) => [
              styles.reset,
              { borderColor: theme.border },
              pressed && { opacity: 0.6 },
            ]}
          >
            <Text style={[styles.resetText, { color: theme.textMuted }]}>Use default</Text>
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
          <Text style={[styles.hint, { color: theme.danger }]}>
            {' '}
            over the default budget.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, borderRadius: radius.md, borderWidth: 1, gap: spacing.sm },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '700' },
  source: { fontSize: 12, fontWeight: '600' },
  editRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.md,
    fontSize: 16,
    fontWeight: '700',
    minHeight: 46,
  },
  reset: {
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  resetText: { fontSize: 13, fontWeight: '600' },
  hint: { fontSize: 12, lineHeight: 17 },
  hintRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
});
