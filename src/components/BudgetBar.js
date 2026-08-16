import { StyleSheet, Text, View } from 'react-native';

import { useSettings, useTheme } from '../context/SettingsContext';
import { radius, spacing } from '../theme';
import { formatMoney } from '../utils/format';

/**
 * Progress bar comparing this month's spend against the budget set in
 * Settings. Turns amber past 80% and red once the budget is exceeded.
 */
export default function BudgetBar({ spent }) {
  const theme = useTheme();
  const { currency, monthlyBudget } = useSettings();

  if (!monthlyBudget || monthlyBudget <= 0) return null;

  const ratio = Math.min(spent / monthlyBudget, 1);
  const percent = Math.round((spent / monthlyBudget) * 100);
  const barColor = percent >= 100 ? theme.danger : percent >= 80 ? theme.warning : theme.success;

  return (
    <View style={styles.root}>
      <View style={styles.labels}>
        <Text style={[styles.caption, { color: theme.textMuted }]}>
          {percent}% of {formatMoney(monthlyBudget, currency)} budget
        </Text>
        <Text style={[styles.caption, { color: barColor, fontWeight: '700' }]}>
          {percent >= 100 ? 'Over budget' : `${formatMoney(monthlyBudget - spent, currency)} left`}
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
