import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CurrencySign from '../../src/components/CurrencySign';
import LargeTitle from '../../src/components/LargeTitle';
import ListGroup from '../../src/components/ListGroup';
import ListRow from '../../src/components/ListRow';
import NavBar from '../../src/components/NavBar';
import ScreenContainer from '../../src/components/ScreenContainer';
import { useTabBarSpace } from '../../src/components/FloatingTabBar';
import SegmentedControl from '../../src/components/SegmentedControl';
import { CURRENCIES } from '../../src/constants/categories';
import { RATES_TAKEN_ON } from '../../src/constants/rates';
import { useExpenses } from '../../src/context/ExpensesContext';
import { useSettings, useTheme } from '../../src/context/SettingsContext';
import { spacing } from '../../src/theme';
import { haptics } from '../../src/utils/haptics';

const THEME_MODES = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

/**
 * Settings tab — the only screen that writes to SettingsContext.
 *
 * Every control writes straight through to storage, so there is no "Save"
 * button to forget: the theme, the currency and the budget all take effect on
 * the other tabs immediately.
 */
export default function SettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();
  const { currency, themeMode, defaultBudget, updateSetting, setDefaultBudget } = useSettings();
  const { clearAll, expenses } = useExpenses();

  const scrollY = useRef(new Animated.Value(0)).current;

  /**
   * The budget field sits near the foot of a long screen, so the keyboard
   * covers it. The scroll view is told where the field is when it is laid out
   * and scrolls it up on focus.
   */
  const scrollRef = useRef(null);
  const budgetTop = useRef(0);

  // The compact title bar floats over the top of the page, so a field scrolled
  // to the very top would land underneath it. The clearance is the height of
  // that bar plus a little air.
  const revealMargin = insets.top + 44 + spacing.md;

  function revealBudget() {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, budgetTop.current - revealMargin),
        animated: true,
      });
    });
  }

  // The budget field holds text while the user types, and only commits a
  // number on blur. Settings hydrate from storage after the first render, so
  // the field follows the stored value when it arrives.
  const [budgetText, setBudgetText] = useState(String(defaultBudget ?? ''));
  useEffect(() => {
    setBudgetText(String(defaultBudget ?? ''));
  }, [defaultBudget]);

  function commitBudget() {
    const value = parseFloat(String(budgetText).replace(/[^0-9.]/g, ''));
    const safe = Number.isFinite(value) && value >= 0 ? Math.round(value * 100) / 100 : 0;
    setDefaultBudget(safe);
    setBudgetText(String(safe));
  }

  function confirmClear() {
    Alert.alert(
      'Clear all expenses?',
      `This deletes all ${expenses.length} expenses from this device. It cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            haptics.deleted();
            clearAll();
          },
        },
      ]
    );
  }

  return (
    <ScreenContainer edges={[]}>
      <NavBar title="Settings" scrollY={scrollY} />

      <Animated.ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.sm, paddingBottom: tabBarSpace + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
      >
        <LargeTitle title="Settings" />

        <ListGroup
          title="Appearance"
          footer={'"System" follows the light or dark setting of your phone.'}
          style={styles.plainCard}
        >
          <SegmentedControl
            options={THEME_MODES}
            value={themeMode}
            onChange={(value) => updateSetting('themeMode', value)}
            accessibilityLabelSuffix=" theme"
          />
        </ListGroup>

        <ListGroup
          title="Currency"
          footer={`Every expense keeps the currency you entered it in. The app converts the amounts for display, at fixed rates taken on ${RATES_TAKEN_ON}. It cannot check a live rate, because it works offline.`}
        >
          {CURRENCIES.map((item, index) => (
            <ListRow
              key={item.code}
              title={item.code}
              subtitle={item.label}
              selected={currency === item.code}
              last={index === CURRENCIES.length - 1}
              accessibilityLabel={`${item.label}, ${item.code}`}
              onPress={() => {
                haptics.selected();
                updateSetting('currency', item.code);
              }}
              // The sign leads the row, in the column an icon would use. On
              // the trailing edge it had to share the space with the tick,
              // which left the four signs sitting at different distances from
              // the edge of the card.
              leading={
                <CurrencySign code={item.code} size={19} color={theme.textMuted} weight="400" />
              }
            />
          ))}
        </ListGroup>

        <View onLayout={(event) => (budgetTop.current = event.nativeEvent.layout.y)}>
          <ListGroup
            title="Monthly budget"
            footer="Every month uses this figure unless you give that month a budget of its own on the Stats tab. Set it to 0 to hide the budget bar."
          >
            <ListRow title="Budget" last>
              <View style={styles.budgetField}>
                <CurrencySign code={currency} size={17} color={theme.textMuted} weight="400" />
                <TextInput
                  value={budgetText}
                  onChangeText={setBudgetText}
                  onFocus={revealBudget}
                  onBlur={commitBudget}
                  onSubmitEditing={commitBudget}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  placeholder="0"
                  placeholderTextColor={theme.textMuted}
                  accessibilityLabel="Monthly budget amount"
                  style={[styles.budgetInput, { color: theme.text }]}
                />
              </View>
            </ListRow>
          </ListGroup>
        </View>

        <ListGroup title="Data">
          <ListRow
            title="Clear All Expenses"
            destructive
            last
            onPress={confirmClear}
            accessibilityLabel="Clear all expenses"
            icon="trash"
            iconColor={theme.onBrand}
            iconBackground={theme.danger}
          />
        </ListGroup>

        <ListGroup title="About" footer="Spendly works offline. All data stays on this device and is never sent anywhere.">
          <ListRow title="Spendly" value="Version 1.0.0" last />
        </ListGroup>

        <Text style={[styles.colophon, { color: theme.textMuted }]}>
          {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'} stored on this device
        </Text>
      </Animated.ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
  },
  // The segmented control is its own surface, so the card behind it would be
  // a second one. This makes the card carry the control instead of framing it.
  plainCard: { backgroundColor: 'transparent', borderRadius: 0 },
  budgetField: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  budgetInput: {
    fontSize: 17,
    minWidth: 90,
    textAlign: 'right',
    paddingVertical: spacing.xs,
  },
  colophon: { fontSize: 12, textAlign: 'center', marginTop: spacing.sm },
});
