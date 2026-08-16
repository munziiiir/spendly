import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import EmptyState from '../../src/components/EmptyState';
import { CATEGORIES, getCategory } from '../../src/constants/categories';
import { useExpenses } from '../../src/context/ExpensesContext';
import { useSettings, useTheme } from '../../src/context/SettingsContext';
import { radius, spacing } from '../../src/theme';
import {
  formatMoney,
  formatMonth,
  shiftMonth,
  toDateKey,
  toMonthKey,
} from '../../src/utils/format';

/**
 * Stats tab: month-by-month totals and a breakdown by category.
 *
 * The bar chart is drawn with plain Views rather than a charting library —
 * fewer dependencies, and it themes itself for free.
 */
export default function StatsScreen() {
  const theme = useTheme();
  const { currency } = useSettings();
  const { expenses } = useExpenses();
  const [month, setMonth] = useState(toMonthKey(toDateKey(new Date())));

  const monthExpenses = useMemo(
    () => expenses.filter((item) => toMonthKey(item.date) === month),
    [expenses, month]
  );

  const total = useMemo(
    () => monthExpenses.reduce((sum, item) => sum + item.amount, 0),
    [monthExpenses]
  );

  const breakdown = useMemo(() => {
    const totals = CATEGORIES.map((category) => ({
      ...category,
      total: monthExpenses
        .filter((item) => item.category === category.id)
        .reduce((sum, item) => sum + item.amount, 0),
    }));
    return totals.filter((row) => row.total > 0).sort((a, b) => b.total - a.total);
  }, [monthExpenses]);

  const biggest = useMemo(() => {
    if (monthExpenses.length === 0) return null;
    return monthExpenses.reduce((max, item) => (item.amount > max.amount ? item : max));
  }, [monthExpenses]);

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Month switcher */}
      <View style={[styles.switcher, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Pressable
          onPress={() => setMonth((m) => shiftMonth(m, -1))}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          style={styles.arrow}
        >
          <Ionicons name="chevron-back" size={22} color={theme.brand} />
        </Pressable>

        <Text style={[styles.monthLabel, { color: theme.text }]}>{formatMonth(month)}</Text>

        <Pressable
          onPress={() => setMonth((m) => shiftMonth(m, 1))}
          accessibilityRole="button"
          accessibilityLabel="Next month"
          style={styles.arrow}
        >
          <Ionicons name="chevron-forward" size={22} color={theme.brand} />
        </Pressable>
      </View>

      {/* Headline figures */}
      <View style={styles.statRow}>
        <StatCard label="Total" value={formatMoney(total, currency)} theme={theme} />
        <StatCard label="Expenses" value={String(monthExpenses.length)} theme={theme} />
      </View>

      {monthExpenses.length === 0 ? (
        <EmptyState
          icon="bar-chart-outline"
          title="Nothing to show"
          message={`You have no expenses recorded for ${formatMonth(month)}.`}
        />
      ) : (
        <>
          <Text style={[styles.heading, { color: theme.text }]}>By category</Text>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {breakdown.map((row) => {
              const share = total > 0 ? row.total / total : 0;
              return (
                <View key={row.id} style={styles.barRow}>
                  <View style={styles.barLabels}>
                    <View style={styles.barName}>
                      <Ionicons name={row.icon} size={15} color={row.color} />
                      <Text style={[styles.barText, { color: theme.text }]}>{row.label}</Text>
                    </View>
                    <Text style={[styles.barText, { color: theme.textMuted }]}>
                      {formatMoney(row.total, currency)} · {Math.round(share * 100)}%
                    </Text>
                  </View>
                  <View style={[styles.track, { backgroundColor: theme.surface }]}>
                    <View
                      style={[
                        styles.fill,
                        { width: `${share * 100}%`, backgroundColor: row.color },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          {!!biggest && (
            <>
              <Text style={[styles.heading, { color: theme.text }]}>Largest expense</Text>
              <View
                style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <Text style={[styles.biggestAmount, { color: theme.text }]}>
                  {formatMoney(biggest.amount, currency)}
                </Text>
                <Text style={[styles.biggestNote, { color: theme.textMuted }]}>
                  {biggest.note || getCategory(biggest.category).label}
                </Text>
              </View>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

function StatCard({ label, value, theme }) {
  return (
    <View
      style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}
    >
      <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  switcher: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.sm,
  },
  arrow: { padding: spacing.sm },
  monthLabel: { fontSize: 16, fontWeight: '700' },
  statRow: { flexDirection: 'row', gap: spacing.md },
  statCard: { flex: 1, padding: spacing.lg, borderRadius: radius.md, borderWidth: 1, gap: spacing.xs },
  statLabel: { fontSize: 12, fontWeight: '600' },
  statValue: { fontSize: 22, fontWeight: '800' },
  heading: { fontSize: 16, fontWeight: '700', marginTop: spacing.md },
  card: { padding: spacing.lg, borderRadius: radius.md, borderWidth: 1, gap: spacing.lg },
  barRow: { gap: spacing.sm },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  barName: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  barText: { fontSize: 13, fontWeight: '600' },
  track: { height: 10, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
  biggestAmount: { fontSize: 28, fontWeight: '800' },
  biggestNote: { fontSize: 14 },
});
