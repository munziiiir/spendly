import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CategoryBreakdown from '../../src/components/CategoryBreakdown';
import CategoryDonut from '../../src/components/CategoryDonut';
import DailyBars from '../../src/components/DailyBars';
import EmptyState from '../../src/components/EmptyState';
import LargeTitle from '../../src/components/LargeTitle';
import Money from '../../src/components/Money';
import MonthBudgetCard from '../../src/components/MonthBudgetCard';
import NavBar from '../../src/components/NavBar';
import ScreenContainer from '../../src/components/ScreenContainer';
import SegmentedControl from '../../src/components/SegmentedControl';
import TrendLine from '../../src/components/TrendLine';
import { CATEGORIES, getCategory } from '../../src/constants/categories';
import { convert } from '../../src/constants/rates';
import { useExpenses } from '../../src/context/ExpensesContext';
import { useSettings, useTheme } from '../../src/context/SettingsContext';
import { continuous, radius, spacing } from '../../src/theme';
import {
  formatDate,
  formatMoney,
  formatMonth,
  shiftMonth,
  toDateKey,
  toMonthKey,
} from '../../src/utils/format';
import { haptics } from '../../src/utils/haptics';

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
  const insets = useSafeAreaInsets();
  const { currency } = useSettings();
  const { expenses, monthlyTotals } = useExpenses();
  const [month, setMonth] = useState(toMonthKey(toDateKey(new Date())));
  const [view, setView] = useState('categories');

  const scrollY = useRef(new Animated.Value(0)).current;

  // The budget field on this screen sits below a month switcher, three stat
  // cards and a chart, so the keyboard covers it. Same treatment as Settings.
  const scrollRef = useRef(null);
  const budgetTop = useRef(0);
  const revealMargin = insets.top + 44 + spacing.md;

  function revealBudget() {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, budgetTop.current - revealMargin),
        animated: true,
      });
    });
  }

  // Convert once, here. Every total, chart and list below then works on one
  // currency and needs no conversion of its own.
  const monthExpenses = useMemo(
    () =>
      expenses
        .filter((item) => toMonthKey(item.date) === month)
        .map((item) => ({
          ...item,
          amount: convert(item.amount, item.currency || currency, currency),
          currency,
        })),
    [expenses, month, currency]
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

  function step(delta) {
    haptics.selected();
    setMonth((current) => shiftMonth(current, delta));
  }

  return (
    <ScreenContainer edges={[]}>
      <NavBar title="Stats" scrollY={scrollY} />

      <Animated.ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.sm }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
      >
        <LargeTitle title="Stats" />

        {/* Month switcher */}
        <View style={[styles.switcher, continuous, { backgroundColor: theme.card }]}>
          <Pressable
            onPress={() => step(-1)}
            accessibilityRole="button"
            accessibilityLabel="Previous month"
            hitSlop={8}
            style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-back" size={20} color={theme.brand} />
          </Pressable>

          <Text style={[styles.monthLabel, { color: theme.text }]}>{formatMonth(month)}</Text>

          <Pressable
            onPress={() => step(1)}
            accessibilityRole="button"
            accessibilityLabel="Next month"
            hitSlop={8}
            style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-forward" size={20} color={theme.brand} />
          </Pressable>
        </View>

        {/* Headline figures */}
        <View style={styles.statRow}>
          <StatCard label="Total" theme={theme}>
            <Money amount={total} style={[styles.statValue, { color: theme.text }]} />
          </StatCard>
          <StatCard label="Expenses" theme={theme}>
            <Text style={[styles.statValue, { color: theme.text }]}>{monthExpenses.length}</Text>
          </StatCard>
          <StatCard label="Average" theme={theme}>
            <Money amount={average} style={[styles.statValue, { color: theme.text }]} />
          </StatCard>
        </View>

        <View onLayout={(event) => (budgetTop.current = event.nativeEvent.layout.y)}>
          <MonthBudgetCard month={month} spent={total} onFocusInput={revealBudget} />
        </View>

        {monthExpenses.length === 0 ? (
          <EmptyState
            icon="bar-chart-outline"
            title="Nothing to show"
            message={`You have no expenses recorded for ${formatMonth(month)}.`}
          />
        ) : (
          <>
            <SegmentedControl
              options={VIEWS}
              value={view}
              onChange={setView}
              accessibilityLabelSuffix=" view"
            />

            <View style={[styles.card, continuous, { backgroundColor: theme.card }]}>
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
                <Text style={[styles.heading, { color: theme.textMuted }]}>Largest expense</Text>
                <Pressable
                  onPress={() => openExpense(biggest.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Largest expense, ${formatMoney(
                    biggest.amount,
                    currency
                  )}. Tap to edit.`}
                  style={({ pressed }) => [
                    styles.card,
                    continuous,
                    { backgroundColor: theme.card },
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.biggestRow}>
                    <View
                      style={[
                        styles.biggestIcon,
                        { backgroundColor: getCategory(biggest.category).color },
                      ]}
                    >
                      <Ionicons
                        name={getCategory(biggest.category).icon}
                        size={20}
                        color={theme.onBrand}
                      />
                    </View>
                    <View style={styles.biggestBody}>
                      <Money
                        amount={biggest.amount}
                        style={[styles.biggestAmount, { color: theme.text }]}
                      />
                      <Text style={[styles.biggestNote, { color: theme.textMuted }]}>
                        {biggest.note || getCategory(biggest.category).label} ·{' '}
                        {formatDate(biggest.date)}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
                  </View>
                </Pressable>
              </>
            )}
          </>
        )}
      </Animated.ScrollView>
    </ScreenContainer>
  );
}

function StatCard({ label, theme, children }) {
  return (
    <View style={[styles.statCard, continuous, { backgroundColor: theme.card }]}>
      <Text style={[styles.statLabel, { color: theme.textMuted }]} numberOfLines={1}>
        {label}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  pressed: { opacity: 0.6 },
  switcher: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.md + 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minHeight: 46,
  },
  arrow: { padding: spacing.sm },
  monthLabel: { fontSize: 17, fontWeight: '600' },
  statRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: {
    flex: 1,
    minWidth: 0,
    padding: spacing.md,
    borderRadius: radius.md + 2,
    gap: 2,
  },
  statLabel: { fontSize: 12 },
  statValue: { fontSize: 17, fontWeight: '600' },
  heading: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: spacing.md,
    marginLeft: spacing.lg,
  },
  card: { padding: spacing.lg, borderRadius: radius.md + 2, gap: spacing.lg },
  cardHint: { fontSize: 13 },
  biggestRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  biggestIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  biggestBody: { flex: 1, gap: 1 },
  biggestAmount: { fontSize: 22, fontWeight: '700' },
  biggestNote: { fontSize: 13 },
});
