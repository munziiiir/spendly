import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import CurrencySign from './CurrencySign';
import ErrorBanner from './ErrorBanner';
import { CATEGORIES } from '../constants/categories';
import { convert } from '../constants/rates';
import { useSettings, useTheme } from '../context/SettingsContext';
import { radius, spacing } from '../theme';
import { haptics } from '../utils/haptics';
import { formatDate, fromDateKey, parseAmount, parseDate, toDateKey } from '../utils/format';

/**
 * Shared add/edit form.
 *
 * Both the Add screen and the Edit screen render this same component, so the
 * validation rules only exist in one place.
 */
export default function ExpenseForm({ initialValue, submitLabel, onSubmit, onDelete }) {
  const theme = useTheme();
  const { currency } = useSettings();

  // The form always works in the currency the user has chosen. An expense
  // recorded in another currency is converted for editing and saved back in
  // the chosen one, so the figure on screen is always the figure that is saved.
  const [amount, setAmount] = useState(
    initialValue
      ? convert(initialValue.amount, initialValue.currency || currency, currency).toFixed(2)
      : ''
  );
  const [note, setNote] = useState(initialValue?.note ?? '');
  const [category, setCategory] = useState(initialValue?.category ?? CATEGORIES[0].id);
  const [date, setDate] = useState(initialValue?.date ?? toDateKey(new Date()));
  const [errors, setErrors] = useState({});
  const [pickerOpen, setPickerOpen] = useState(false);

  function handleSubmit() {
    const amountResult = parseAmount(amount);
    const dateResult = parseDate(date);

    const nextErrors = {};
    if (!amountResult.ok) nextErrors.amount = amountResult.error;
    if (!dateResult.ok) nextErrors.date = dateResult.error;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      haptics.failed();
      return;
    }

    haptics.saved();

    onSubmit({
      amount: amountResult.value,
      note: note.trim(),
      category,
      date: dateResult.value,
      currency,
    });

    // Reset only when adding; the edit screen navigates away instead.
    if (!initialValue) {
      setAmount('');
      setNote('');
      setDate(toDateKey(new Date()));
      setErrors({});
      setPickerOpen(false);
    }
  }

  // Changing the date clears its error, so a corrected date does not keep
  // showing the message from the previous attempt.
  function changeDate(value) {
    setDate(value);
    setErrors((current) => ({ ...current, date: undefined }));
  }

  function setQuickDate(offsetDays) {
    changeDate(toDateKey(new Date(Date.now() - offsetDays * 86400000)));
    setPickerOpen(false);
  }

  /**
   * The picker reports a Date. The rest of the app works in "YYYY-MM-DD", so
   * the value is converted straight back to that form and nothing else in the
   * app has to know a picker exists.
   */
  function handlePickerChange(event, selected) {
    // Android shows the picker as a dialog that closes itself.
    if (Platform.OS !== 'ios') setPickerOpen(false);
    if (event.type === 'dismissed' || !selected) return;
    changeDate(toDateKey(selected));
  }

  return (
    <View style={styles.flex}>
      {/*
        The keyboard is handled by the scroll view itself rather than by a
        KeyboardAvoidingView wrapper. This form is presented as a modal, and
        that wrapper measures against the whole window, so on iOS it pads by
        the height of a keyboard that begins below the modal's own frame and
        pushes the Save button off screen. `automaticallyAdjustKeyboardInsets`
        uses the native inset instead, which is measured against the modal.
        `keyboardDismissMode` matters because the amount field opens a decimal
        pad, and a decimal pad has no return key — without swipe-to-dismiss
        there is no way for the user to close it.
      */}
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        <ErrorBanner message={errors.amount} />

        {/* Amount */}
        <Text style={[styles.label, { color: theme.textMuted }]}>Amount</Text>
        <View
          style={[styles.amountRow, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <View style={styles.symbol}>
            <CurrencySign code={currency} size={26} color={theme.textMuted} />
          </View>
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
                onPress={() => {
                  haptics.selected();
                  setCategory(item.id);
                }}
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
                  numberOfLines={2}
                  maxFontSizeMultiplier={1.4}
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
          returnKeyType="done"
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
        <Pressable
          onPress={() => setPickerOpen((open) => !open)}
          accessibilityRole="button"
          accessibilityState={{ expanded: pickerOpen }}
          accessibilityLabel={`Expense date, ${formatDate(date)}. Tap to change it.`}
          style={({ pressed }) => [
            styles.input,
            styles.dateButton,
            { backgroundColor: theme.card, borderColor: pickerOpen ? theme.brand : theme.border },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Ionicons name="calendar-outline" size={18} color={theme.textMuted} />
          <Text style={[styles.dateText, { color: theme.text }]}>{formatDate(date)}</Text>
          <Ionicons
            name={pickerOpen ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={theme.textMuted}
          />
        </Pressable>

        {pickerOpen && (
          <DateTimePicker
            value={fromDateKey(date)}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={handlePickerChange}
            themeVariant={theme.mode}
            accentColor={theme.brand}
          />
        )}
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
    </View>
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
  symbol: { marginRight: spacing.sm, justifyContent: 'center' },
  amountInput: { flex: 1, minWidth: 0, fontSize: 32, fontWeight: '700', paddingVertical: spacing.md },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    minHeight: 48,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  // A fixed minimum height keeps the three columns level once a label wraps
  // onto a second line at larger text sizes.
  gridItem: {
    width: '31.5%',
    minHeight: 74,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  gridLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  quickRow: { flexDirection: 'row', gap: spacing.sm },
  dateButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  dateText: { flex: 1, fontSize: 15, fontWeight: '600' },
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
