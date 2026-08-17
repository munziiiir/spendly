import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import CategoryBreakdown from '../../src/components/CategoryBreakdown';
import CategoryDonut from '../../src/components/CategoryDonut';
import DailyBars from '../../src/components/DailyBars';
import EmptyState from '../../src/components/EmptyState';
import MonthBudgetCard from '../../src/components/MonthBudgetCard';
import TrendLine from '../../src/components/TrendLine';
import { CATEGORIES, getCategory } from '../../src/constants/categories';
import { useExpenses } from '../../src/context/ExpensesContext';
import { useSettings, useTheme } from '../../src/context/SettingsContext';
import { radius, spacing } from '../../src/theme';
import {
  formatDate,
  formatMoney,
  formatMonth,
  shiftMonth,
  toDateKey,
  toMonthKey,
} from '../../src/utils/format';

/** The views the user can switch between. Each one answers a different question. */
const VIEWS = [
  { id: 'categories', label: 'Categories', icon: 'list' },
  { id: 'donut', label: 'Share', icon: 'pie-chart' },
  { id: 'daily', label: 'Daily', icon: 'bar-chart' },
  { id: 'trend', label: 'Trend', icon: 'trending-up' },
];

/**
 * Stats tab: one month at a time, seen four ways.
 *
 * The charts use the same numbers; only the question changes. Categories and
 * Share ask where the money went, Daily asks when it went, and Trend asks
 * whether the month is normal for this user.
 */
export default function StatsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { currency } = useSettings();
  const { expenses, monthlyTotals } = useExpenses();
  const [month, setMonth] = useState(toMonthKey(toDateKey(new Date())));
  const [view, setView] = useState('categories');

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

  const average = monthExpenses.length > 0 ? total / monthExpenses.length : 0;

  function openExpense(id) {
    router.push(`/expense/${id}`);
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
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
        <StatCard label="Average" value={formatMoney(average, currency)} theme={theme} />
      </View>

      <MonthBudgetCard month={month} spent={total} />

      {monthExpenses.length === 0 ? (
        <EmptyState
          icon="bar-chart-outline"
          title="Nothing to show"
          message={`You have no expenses recorded for ${formatMonth(month)}.`}
        />
      ) : (
        <>
          {/* View switcher */}
          <View style={[styles.segment, { backgroundColor: theme.surface }]}>
            {VIEWS.map((option) => {
              const selected = view === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setView(option.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${option.label} view`}
                  style={[styles.segmentItem, selected && { backgroundColor: theme.brand }]}
                >
                  <Ionicons
                    name={option.icon}
                    size={15}
                    color={selected ? theme.onBrand : theme.textMuted}
                  />
                  <Text
                    style={[
                      styles.segmentText,
                      { color: selected ? theme.onBrand : theme.textMuted },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {view === 'categories' && (
              <>
                <Text style={[styles.cardHint, { color: theme.textMuted }]}>
                  Tap a category to see the expenses behind it.
                </Text>
                <CategoryBreakdown
                  rows={breakdown}
                  total={total}
                  expenses={monthExpenses}
                  onOpenExpense={openExpense}
                />
              </>
            )}

            {view === 'donut' && <CategoryDonut rows={breakdown} total={total} />}

            {view === 'daily' && <DailyBars expenses={monthExpenses} month={month} />}

            {view === 'trend' && <TrendLine monthlyTotals={monthlyTotals} month={month} />}
          </View>

          {!!biggest && (
            <>
              <Text style={[styles.heading, { color: theme.text }]}>Largest expense</Text>
              <Pressable
                onPress={() => openExpense(biggest.id)}
                accessibilityRole="button"
                accessibilityLabel={`Largest expense, ${formatMoney(
                  biggest.amount,
                  currency
                )}. Tap to edit.`}
                style={({ pressed }) => [
                  styles.card,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={[styles.biggestAmount, { color: theme.text }]}>
                  {formatMoney(biggest.amount, currency)}
                </Text>
                <Text style={[styles.biggestNote, { color: theme.textMuted }]}>
                  {biggest.note || getCategory(biggest.category).label} ·{' '}
                  {formatDate(biggest.date)}
                </Text>
              </Pressable>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

function StatCard({ label, value, theme }) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.statValue, { color: theme.text }]} numberOfLines={1}>
        {value}
      </Text>
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
  statRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
  },
  statLabel: { fontSize: 11, fontWeight: '600' },
  statValue: { fontSize: 17, fontWeight: '800' },
  segment: { flexDirection: 'row', borderRadius: radius.sm, padding: spacing.xs },
  segmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  segmentText: { fontSize: 12, fontWeight: '700' },
  heading: { fontSize: 16, fontWeight: '700', marginTop: spacing.md },
  card: { padding: spacing.lg, borderRadius: radius.md, borderWidth: 1, gap: spacing.lg },
  cardHint: { fontSize: 12 },
  biggestAmount: { fontSize: 28, fontWeight: '800' },
  biggestNote: { fontSize: 14 },
});
