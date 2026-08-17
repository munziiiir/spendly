import { StyleSheet, Text, View } from 'react-native';

import { useSettings, useTheme } from '../context/SettingsContext';
import { radius, spacing } from '../theme';
import { formatMoney } from '../utils/format';

/**
 * Progress bar comparing one month's spend against that month's budget.
 * Turns amber past 80% and red once the budget is exceeded.
 *
 * The budget comes from `getBudgetForMonth`, so a month with its own figure
 * uses that figure and every other month uses the default from Settings.
 */
export default function BudgetBar({ spent, month }) {
  const theme = useTheme();
  const { currency, getBudgetForMonth } = useSettings();
  const { budget, isCustom } = getBudgetForMonth(month);

  if (!budget || budget <= 0) return null;

  const ratio = Math.min(spent / budget, 1);
  const percent = Math.round((spent / budget) * 100);
  const barColor = percent >= 100 ? theme.danger : percent >= 80 ? theme.warning : theme.success;

  return (
    <View style={styles.root}>
      <View style={styles.labels}>
        <Text style={[styles.caption, { color: theme.textMuted }]}>
          {percent}% of {formatMoney(budget, currency)}
          {isCustom ? ' set for this month' : ' budget'}
        </Text>
        <Text style={[styles.caption, { color: barColor, fontWeight: '700' }]}>
          {percent >= 100 ? 'Over budget' : `${formatMoney(budget - spent, currency)} left`}
        </Text>
      </View>

      <View
        style={[styles.track, { backgroundColor: theme.surface }]}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: percent }}
      >
        <View style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.sm, marginTop: spacing.md },
  labels: { flexDirection: 'row', justifyContent: 'space-between' },
  caption: { fontSize: 12 },
  track: { height: 8, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
});
