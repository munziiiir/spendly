import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import ErrorBanner from './ErrorBanner';
import { CATEGORIES, getCurrencySymbol } from '../constants/categories';
import { useSettings, useTheme } from '../context/SettingsContext';
import { radius, spacing } from '../theme';
import { parseAmount, parseDate, toDateKey } from '../utils/format';

/**
 * Shared add/edit form.
 *
 * Both the Add tab and the Edit screen render this same component, so the
 * validation rules only exist in one place.
 */
export default function ExpenseForm({ initialValue, submitLabel, onSubmit, onDelete }) {
  const theme = useTheme();
  const { currency } = useSettings();

  const [amount, setAmount] = useState(
    initialValue ? String(initialValue.amount.toFixed(2)) : ''
  );
  const [note, setNote] = useState(initialValue?.note ?? '');
  const [category, setCategory] = useState(initialValue?.category ?? CATEGORIES[0].id);
  const [date, setDate] = useState(initialValue?.date ?? toDateKey(new Date()));
  const [errors, setErrors] = useState({});

  function handleSubmit() {
    const amountResult = parseAmount(amount);
    const dateResult = parseDate(date);

    const nextErrors = {};
    if (!amountResult.ok) nextErrors.amount = amountResult.error;
    if (!dateResult.ok) nextErrors.date = dateResult.error;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      amount: amountResult.value,
      note: note.trim(),
      category,
      date: dateResult.value,
    });

    // Reset only when adding; the edit screen navigates away instead.
    if (!initialValue) {
      setAmount('');
      setNote('');
      setDate(toDateKey(new Date()));
      setErrors({});
    }
  }

  function setQuickDate(offsetDays) {
    setDate(toDateKey(new Date(Date.now() - offsetDays * 86400000)));
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ErrorBanner message={errors.amount} />

        {/* Amount */}
        <Text style={[styles.label, { color: theme.textMuted }]}>Amount</Text>
        <View
          style={[styles.amountRow, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <Text style={[styles.symbol, { color: theme.textMuted }]}>
            {getCurrencySymbol(currency)}
          </Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={theme.textMuted}
            keyboardType="decimal-pad"
            accessibilityLabel="Expense amount"
            style={[styles.amountInput, { color: theme.text }]}
          />
        </View>

        {/* Category */}
        <Text style={[styles.label, { color: theme.textMuted }]}>Category</Text>
        <View style={styles.grid}>
          {CATEGORIES.map((item) => {
            const selected = item.id === category;
            return (
              <Pressable
                key={item.id}
                onPress={() => setCategory(item.id)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[
                  styles.gridItem,
                  {
                    backgroundColor: selected ? `${item.color}22` : theme.card,
                    borderColor: selected ? item.color : theme.border,
                  },
                ]}
              >
                <Ionicons name={item.icon} size={22} color={item.color} />
                <Text
                  style={[
                    styles.gridLabel,
                    { color: selected ? theme.text : theme.textMuted },
                  ]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Note */}
        <Text style={[styles.label, { color: theme.textMuted }]}>Note (optional)</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="e.g. Lunch with Sam"
          placeholderTextColor={theme.textMuted}
          maxLength={60}
          accessibilityLabel="Expense note"
          style={[
            styles.input,
            { backgroundColor: theme.card, borderColor: theme.border, color: theme.text },
          ]}
        />

        {/* Date */}
        <Text style={[styles.label, { color: theme.textMuted }]}>Date</Text>
        <View style={styles.quickRow}>
          <QuickDate label="Today" onPress={() => setQuickDate(0)} theme={theme} />
          <QuickDate label="Yesterday" onPress={() => setQuickDate(1)} theme={theme} />
        </View>
        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={theme.textMuted}
          autoCapitalize="none"
          accessibilityLabel="Expense date"
          style={[
            styles.input,
            { backgroundColor: theme.card, borderColor: theme.border, color: theme.text },
          ]}
        />
        {!!errors.date && (
          <Text style={[styles.fieldError, { color: theme.danger }]}>{errors.date}</Text>
        )}

        <Pressable
          onPress={handleSubmit}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.submit,
            { backgroundColor: theme.brand },
            pressed && { opacity: 0.8 },
          ]}
        >
          <Text style={[styles.submitText, { color: theme.onBrand }]}>{submitLabel}</Text>
        </Pressable>

        {!!onDelete && (
          <Pressable
            onPress={onDelete}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.delete,
              { borderColor: theme.danger },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="trash-outline" size={18} color={theme.danger} />
            <Text style={[styles.deleteText, { color: theme.danger }]}>Delete expense</Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function QuickDate({ label, onPress, theme }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.quickChip, { backgroundColor: theme.surface, borderColor: theme.border }]}
    >
      <Text style={[styles.quickText, { color: theme.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2, gap: spacing.sm },
  label: { fontSize: 13, fontWeight: '600', marginTop: spacing.md },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
  },
  symbol: { fontSize: 26, fontWeight: '700', marginRight: spacing.sm },
  amountInput: { flex: 1, fontSize: 32, fontWeight: '700', paddingVertical: spacing.md },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    minHeight: 48,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  gridItem: {
    width: '31.5%',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  gridLabel: { fontSize: 11, fontWeight: '600' },
  quickRow: { flexDirection: 'row', gap: spacing.sm },
  quickChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  quickText: { fontSize: 13, fontWeight: '600' },
  fieldError: { fontSize: 12, fontWeight: '600' },
  submit: {
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  submitText: { fontSize: 16, fontWeight: '700' },
  delete: {
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  deleteText: { fontSize: 15, fontWeight: '600' },
});
