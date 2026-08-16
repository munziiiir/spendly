import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import ScreenContainer from '../../src/components/ScreenContainer';
import { CURRENCIES } from '../../src/constants/categories';
import { useExpenses } from '../../src/context/ExpensesContext';
import { useSettings, useTheme } from '../../src/context/SettingsContext';
import { radius, spacing } from '../../src/theme';

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
  const { currency, themeMode, monthlyBudget, updateSetting } = useSettings();
  const { clearAll, expenses } = useExpenses();

  // The budget field holds text while the user types, and only commits a
  // number on blur. Settings hydrate from storage after the first render, so
  // the field follows the stored value when it arrives.
  const [budgetText, setBudgetText] = useState(String(monthlyBudget ?? ''));
  useEffect(() => {
    setBudgetText(String(monthlyBudget ?? ''));
  }, [monthlyBudget]);

  function commitBudget() {
    const value = parseFloat(String(budgetText).replace(/[^0-9.]/g, ''));
    const safe = Number.isFinite(value) && value >= 0 ? Math.round(value * 100) / 100 : 0;
    updateSetting('monthlyBudget', safe);
    setBudgetText(String(safe));
  }

  function confirmClear() {
    Alert.alert(
      'Clear all expenses?',
      `This deletes all ${expenses.length} expenses from this device. It cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => clearAll() },
      ]
    );
  }

  return (
    <ScreenContainer edges={[]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Appearance */}
        <Section title="Appearance" theme={theme}>
          <Text style={[styles.hint, { color: theme.textMuted }]}>
            "System" follows the light or dark setting of your phone.
          </Text>
          <View style={[styles.segment, { backgroundColor: theme.surface }]}>
            {THEME_MODES.map((mode) => {
              const selected = themeMode === mode.id;
              return (
                <Pressable
                  key={mode.id}
                  onPress={() => updateSetting('themeMode', mode.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${mode.label} theme`}
                  style={[
                    styles.segmentItem,
                    selected && { backgroundColor: theme.brand },
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      { color: selected ? theme.onBrand : theme.textMuted },
                    ]}
                  >
                    {mode.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        {/* Currency */}
        <Section title="Currency" theme={theme}>
          {CURRENCIES.map((item, index) => {
            const selected = currency === item.code;
            return (
              <Pressable
                key={item.code}
                onPress={() => updateSetting('currency', item.code)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[
                  styles.row,
                  index > 0 && { borderTopWidth: 1, borderTopColor: theme.border },
                ]}
              >
                <Text style={[styles.rowSymbol, { color: theme.text }]}>{item.symbol}</Text>
                <View style={styles.rowBody}>
                  <Text style={[styles.rowTitle, { color: theme.text }]}>{item.code}</Text>
                  <Text style={[styles.rowSubtitle, { color: theme.textMuted }]}>
                    {item.label}
                  </Text>
                </View>
                {selected && <Ionicons name="checkmark" size={20} color={theme.brand} />}
              </Pressable>
            );
          })}
        </Section>

        {/* Monthly budget */}
        <Section title="Monthly budget" theme={theme}>
          <Text style={[styles.hint, { color: theme.textMuted }]}>
            The Expenses tab compares this month's spending against this figure. Set it to 0
            to hide the budget bar.
          </Text>
          <TextInput
            value={budgetText}
            onChangeText={setBudgetText}
            onBlur={commitBudget}
            onSubmitEditing={commitBudget}
            keyboardType="decimal-pad"
            returnKeyType="done"
            placeholder="0"
            placeholderTextColor={theme.textMuted}
            accessibilityLabel="Monthly budget amount"
            style={[
              styles.input,
              { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text },
            ]}
          />
        </Section>

        {/* Data */}
        <Section title="Data" theme={theme}>
          <Pressable
            onPress={confirmClear}
            accessibilityRole="button"
            accessibilityLabel="Clear all expenses"
            style={({ pressed }) => [
              styles.destructive,
              { borderColor: theme.danger },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="trash-outline" size={18} color={theme.danger} />
            <Text style={[styles.destructiveText, { color: theme.danger }]}>
              Clear all expenses
            </Text>
          </Pressable>
        </Section>

        {/* About */}
        <Section title="About" theme={theme}>
          <Text style={[styles.aboutName, { color: theme.text }]}>Spendly</Text>
          <Text style={[styles.hint, { color: theme.textMuted }]}>Version 1.0.0</Text>
          <Text style={[styles.hint, { color: theme.textMuted }]}>
            Spendly works offline. All data stays on this device and is never sent anywhere.
          </Text>
        </Section>
      </ScrollView>
    </ScreenContainer>
  );
}

/** One titled card. Keeps every section of the screen visually identical. */
function Section({ title, theme, children }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>{title}</Text>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  section: { gap: spacing.sm },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  card: { borderRadius: radius.md, borderWidth: 1, padding: spacing.lg, gap: spacing.md },
  hint: { fontSize: 13, lineHeight: 18 },
  segment: { flexDirection: 'row', borderRadius: radius.sm, padding: spacing.xs },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  segmentText: { fontSize: 14, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  rowSymbol: { fontSize: 20, fontWeight: '700', width: 24, textAlign: 'center' },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600' },
  rowSubtitle: { fontSize: 12 },
  input: {
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.md,
    fontSize: 18,
    fontWeight: '700',
    minHeight: 48,
  },
  destructive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  destructiveText: { fontSize: 15, fontWeight: '600' },
  aboutName: { fontSize: 18, fontWeight: '800' },
});
