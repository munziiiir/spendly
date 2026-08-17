import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, SectionList, StyleSheet, Text, View } from 'react-native';

import AddExpenseButton from '../../src/components/AddExpenseButton';
import BudgetBar from '../../src/components/BudgetBar';
import CategoryChips from '../../src/components/CategoryChips';
import EmptyState from '../../src/components/EmptyState';
import ErrorBanner from '../../src/components/ErrorBanner';
import ExpenseItem from '../../src/components/ExpenseItem';
import { useExpenses } from '../../src/context/ExpensesContext';
import { useSettings, useTheme } from '../../src/context/SettingsContext';
import { radius, spacing } from '../../src/theme';
import { formatDateHeading, formatMoney, toDateKey, toMonthKey } from '../../src/utils/format';

/**
 * Home screen: this month's total, a category filter, and every expense
 * grouped by day.
 */
export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { currency } = useSettings();
  const { expenses, loading, error } = useExpenses();
  const [filter, setFilter] = useState(null);

  const currentMonth = toMonthKey(toDateKey(new Date()));

  const visible = useMemo(
    () => (filter ? expenses.filter((item) => item.category === filter) : expenses),
    [expenses, filter]
  );

  // Group the filtered list into one section per day.
  const sections = useMemo(() => {
    const buckets = new Map();
    visible.forEach((item) => {
      if (!buckets.has(item.date)) buckets.set(item.date, []);
      buckets.get(item.date).push(item);
    });
    return Array.from(buckets, ([date, data]) => ({ title: date, data }));
  }, [visible]);

  const monthTotal = useMemo(
    () =>
      expenses
        .filter((item) => toMonthKey(item.date) === currentMonth)
        .reduce((sum, item) => sum + item.amount, 0),
    [expenses, currentMonth]
  );

  if (loading) {
    return (
      <View style={[styles.centre, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.brand} />
        <Text style={[styles.loadingText, { color: theme.textMuted }]}>
          Loading your expenses…
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <ErrorBanner message={error} />

        <View style={[styles.summary, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Spent this month</Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>
            {formatMoney(monthTotal, currency)}
          </Text>
          <BudgetBar spent={monthTotal} month={currentMonth} />
        </View>

        <CategoryChips value={filter} onChange={setFilter} />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        renderSectionHeader={({ section }) => (
          <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>
            {formatDateHeading(section.title)}
          </Text>
        )}
        renderItem={({ item }) => (
          <ExpenseItem
            expense={item}
            onPress={() => router.push(`/expense/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon={filter ? 'funnel-outline' : 'wallet-outline'}
            title={filter ? 'Nothing in this category' : 'No expenses yet'}
            message={
              filter
                ? 'Try a different category, or clear the filter to see everything.'
                : 'Tap "Add expense" to record your first one. Everything is saved on this device.'
            }
          />
        }
      />

      <AddExpenseButton />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  loadingText: { fontSize: 14 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  summary: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1 },
  summaryLabel: { fontSize: 13, fontWeight: '600' },
  summaryValue: { fontSize: 34, fontWeight: '800', marginTop: spacing.xs },
  // The bottom padding clears the floating Add button, so the last row of the
  // list is always reachable.
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl * 3, flexGrow: 1 },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
});
