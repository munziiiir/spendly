import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, SectionList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AddExpenseButton from '../../src/components/AddExpenseButton';
import BudgetBar from '../../src/components/BudgetBar';
import CategoryChips from '../../src/components/CategoryChips';
import EmptyState from '../../src/components/EmptyState';
import ErrorBanner from '../../src/components/ErrorBanner';
import ExpenseItem from '../../src/components/ExpenseItem';
import LargeTitle from '../../src/components/LargeTitle';
import Money from '../../src/components/Money';
import NavBar from '../../src/components/NavBar';
import ScreenContainer from '../../src/components/ScreenContainer';
import { convert } from '../../src/constants/rates';
import { useExpenses } from '../../src/context/ExpensesContext';
import { useSettings, useTheme } from '../../src/context/SettingsContext';
import { continuous, radius, spacing } from '../../src/theme';
import { formatDateHeading, formatMonth, toDateKey, toMonthKey } from '../../src/utils/format';

/** A SectionList that can report its scroll position to the fading title bar. */
const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);

/**
 * Home screen: this month's total, a category filter, and every expense
 * grouped by day.
 */
export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { currency } = useSettings();
  const { expenses, loading, error } = useExpenses();
  const [filter, setFilter] = useState(null);

  const scrollY = useRef(new Animated.Value(0)).current;

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

  // Every expense converts into the chosen currency before it joins the total,
  // because the list can hold expenses recorded in more than one currency.
  const monthTotal = useMemo(
    () =>
      expenses
        .filter((item) => toMonthKey(item.date) === currentMonth)
        .reduce((sum, item) => sum + convert(item.amount, item.currency || currency, currency), 0),
    [expenses, currentMonth, currency]
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
    <ScreenContainer edges={[]}>
      <NavBar title="Expenses" scrollY={scrollY} />

      <AnimatedSectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingTop: insets.top + spacing.sm }]}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        ListHeaderComponent={
          <View>
            <LargeTitle title="Expenses" />
            <ErrorBanner message={error} />

            {/* The one figure the user opens the app to see. It gets a card of
                its own and the largest type on the screen. */}
            <View style={[styles.summary, continuous, { backgroundColor: theme.card }]}>
              <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>
                {formatMonth(currentMonth)}
              </Text>
              <Money amount={monthTotal} style={[styles.summaryValue, { color: theme.text }]} />
              <BudgetBar spent={monthTotal} month={currentMonth} />
            </View>

            <CategoryChips value={filter} onChange={setFilter} />
          </View>
        }
        renderSectionHeader={({ section }) => (
          <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>
            {formatDateHeading(section.title)}
          </Text>
        )}
        renderItem={({ item, index, section }) => (
          <ExpenseItem
            expense={item}
            first={index === 0}
            last={index === section.data.length - 1}
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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  loadingText: { fontSize: 14 },
  // The bottom padding clears the floating Add button, so the last row of the
  // list is always reachable.
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl * 3,
    flexGrow: 1,
  },
  summary: { padding: spacing.lg, borderRadius: radius.lg },
  summaryLabel: { fontSize: 13 },
  // 40pt is heavy enough to be the anchor of the screen without reaching the
  // weight iOS reserves for a large title.
  summaryValue: { fontSize: 40, fontWeight: '700', marginTop: 2, letterSpacing: 0.4 },
  sectionHeader: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: spacing.lg,
  },
});
