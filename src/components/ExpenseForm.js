import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
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
import SheetHeader from './SheetHeader';
import { CATEGORIES } from '../constants/categories';
import { convert } from '../constants/rates';
import { useSettings, useTheme } from '../context/SettingsContext';
import { continuous, radius, spacing } from '../theme';
import { haptics } from '../utils/haptics';
import { formatDate, fromDateKey, parseAmount, parseDate, toDateKey } from '../utils/format';

/** Points of clearance left above a field when it is scrolled into view. */
const REVEAL_MARGIN = 24;

/**
 * Shared add/edit form.
 *
 * Both the Add screen and the Edit screen render this same component, so the
 * validation rules only exist in one place.
 *
 * The confirming button lives in the toolbar at the top rather than at the
 * foot of the form. That is where iOS puts it, and it means the button cannot
 * be pushed under the keyboard — the problem that a full-width button at the
 * bottom of a scrolling sheet always ends up having.
 */
export default function ExpenseForm({
  initialValue,
  title,
  actionLabel = 'Save',
  onSubmit,
  onDelete,
  onCancel,
}) {
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

  /**
   * Anything the user can put a keyboard or a picker in front of records where
   * it sits, so the form can scroll it clear.
   *
   * iOS insets the scroll view for the keyboard on its own, but an inset only
   * stops the keyboard covering the content — it does not move the field the
   * user is actually typing in up to where they can see it. That second half
   * is what this does, and it is the half the user notices.
   */
  const scrollRef = useRef(null);
  const fieldTops = useRef({});

  function measure(key) {
    return (event) => {
      fieldTops.current[key] = event.nativeEvent.layout.y;
    };
  }

  function reveal(key) {
    // One frame of delay lets the keyboard begin its own animation first, so
    // the two movements run together instead of one after the other.
    requestAnimationFrame(() => {
      const y = fieldTops.current[key];
      if (typeof y !== 'number') return;
      scrollRef.current?.scrollTo({ y: Math.max(0, y - REVEAL_MARGIN), animated: true });
    });
  }

  /**
   * The date picker fades and rises into place instead of appearing whole.
   *
   * A picker is a large object. Dropped in at full opacity it reads as the
   * screen having changed rather than as something having opened, and the user
   * loses track of where the change happened.
   */
  const pickerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!pickerOpen) return;
    pickerAnim.setValue(0);
    Animated.timing(pickerAnim, {
      toValue: 1,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [pickerOpen, pickerAnim]);

  function handleSubmit() {
    const amountResult = parseAmount(amount);
    const dateResult = parseDate(date);

    const nextErrors = {};
    if (!amountResult.ok) nextErrors.amount = amountResult.error;
    if (!dateResult.ok) nextErrors.date = dateResult.error;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      haptics.failed();
      // A rejected form scrolls back to the top, because that is where the
      // reason is written. Reporting an error the user cannot see is the same
      // as not reporting it.
      scrollRef.current?.scrollTo({ y: 0, animated: true });
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
    haptics.selected();
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

  function togglePicker() {
    haptics.pressed();
    setPickerOpen((open) => {
      const next = !open;
      // Opening scrolls the picker into view. Without this the calendar can
      // open below the fold and nothing appears to have happened at all.
      if (next) reveal('date');
      return next;
    });
  }

  return (
    <View style={styles.flex}>
      <SheetHeader
        title={title}
        onCancel={onCancel}
        actionLabel={actionLabel}
        onAction={handleSubmit}
      />

      {/*
        The keyboard is handled by the scroll view itself rather than by a
        KeyboardAvoidingView wrapper. This form is presented as a modal, and
        that wrapper measures against the whole window, so on iOS it pads by
        the height of a keyboard that begins below the modal's own frame.
        `automaticallyAdjustKeyboardInsets` uses the native inset instead,
        which is measured against the modal. `keyboardDismissMode` matters
        because the amount field opens a decimal pad, and a decimal pad has no
        return key — without swipe-to-dismiss there is no way to close it.
      */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        <ErrorBanner message={errors.amount} />

        {/* Amount. The one figure the screen exists to capture, so it is the
            only thing on screen drawn at this size. */}
        <View onLayout={measure('amount')}>
          <Label theme={theme}>Amount</Label>
          <View
            style={[
              styles.amountRow,
              continuous,
              { backgroundColor: theme.card, borderColor: theme.separator },
            ]}
          >
            <CurrencySign code={currency} size={28} color={theme.textMuted} />
            <TextInput
              value={amount}
              onChangeText={setAmount}
              onFocus={() => reveal('amount')}
              placeholder="0.00"
              placeholderTextColor={theme.textMuted}
              keyboardType="decimal-pad"
              accessibilityLabel="Expense amount"
              maxFontSizeMultiplier={1.3}
              style={[styles.amountInput, { color: theme.text }]}
            />
          </View>
        </View>

        {/* Category */}
        <Label theme={theme}>Category</Label>
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
                accessibilityLabel={item.label}
                style={({ pressed }) => [
                  styles.gridItem,
                  continuous,
                  {
                    backgroundColor: theme.card,
                    // The selected tile is marked by a ring in the colour of
                    // the category, not by a wash of it. A wash changes the
                    // tile's weight and makes the grid look uneven.
                    borderColor: selected ? item.color : theme.separator,
                    borderWidth: selected ? 2 : StyleSheet.hairlineWidth,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.gridIcon, { backgroundColor: `${item.color}1F` }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <Text
                  style={[styles.gridLabel, { color: selected ? theme.text : theme.textMuted }]}
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
        <View onLayout={measure('note')}>
          <Label theme={theme}>Note (optional)</Label>
          <TextInput
            value={note}
            onChangeText={setNote}
            onFocus={() => reveal('note')}
            placeholder="e.g. Lunch with Sam"
            placeholderTextColor={theme.textMuted}
            maxLength={60}
            returnKeyType="done"
            accessibilityLabel="Expense note"
            style={[
              styles.input,
              continuous,
              { backgroundColor: theme.card, borderColor: theme.separator, color: theme.text },
            ]}
          />
        </View>

        {/* Date */}
        <View onLayout={measure('date')}>
          <Label theme={theme}>Date</Label>
          <View style={styles.quickRow}>
            <QuickDate label="Today" onPress={() => setQuickDate(0)} theme={theme} />
            <QuickDate label="Yesterday" onPress={() => setQuickDate(1)} theme={theme} />
          </View>

          <Pressable
            onPress={togglePicker}
            accessibilityRole="button"
            accessibilityState={{ expanded: pickerOpen }}
            accessibilityLabel={`Expense date, ${formatDate(date)}. Tap to change it.`}
            style={({ pressed }) => [
              styles.dateButton,
              continuous,
              {
                backgroundColor: theme.card,
                borderColor: pickerOpen ? theme.brand : theme.separator,
                borderWidth: pickerOpen ? 1.5 : StyleSheet.hairlineWidth,
              },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="calendar-outline" size={19} color={theme.brand} />
            <Text style={[styles.dateText, { color: theme.text }]}>{formatDate(date)}</Text>
            <Ionicons
              name={pickerOpen ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={theme.textMuted}
            />
          </Pressable>

          {pickerOpen && (
            <Animated.View
              // Measured again once the picker has a height, so the scroll
              // that reveals it uses the real position rather than the
              // position the row had before it opened.
              onLayout={() => reveal('date')}
              style={[
                styles.pickerWrap,
                continuous,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.separator,
                  opacity: pickerAnim,
                  transform: [
                    {
                      translateY: pickerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-14, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <DateTimePicker
                value={fromDateKey(date)}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={handlePickerChange}
                themeVariant={theme.mode}
                accentColor={theme.brand}
              />
            </Animated.View>
          )}

          {!!errors.date && (
            <Text style={[styles.fieldError, { color: theme.danger }]}>{errors.date}</Text>
          )}
        </View>

        {!!onDelete && (
          <Pressable
            onPress={onDelete}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.delete,
              continuous,
              { backgroundColor: theme.card, borderColor: theme.separator },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.deleteText, { color: theme.danger }]}>Delete Expense</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

/** The small grey caption above a field, as iOS writes a grouped list header. */
function Label({ children, theme }) {
  return <Text style={[styles.label, { color: theme.textMuted }]}>{children}</Text>;
}

function QuickDate({ label, onPress, theme }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.quickChip,
        continuous,
        { backgroundColor: theme.surface },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.quickText, { color: theme.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  label: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  pressed: { opacity: 0.6 },

  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
  },
  amountInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 34,
    fontWeight: '600',
    paddingVertical: spacing.md,
  },

  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 17,
    minHeight: 48,
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  // A fixed minimum height keeps the three columns level once a label wraps
  // onto a second line at larger text sizes.
  gridItem: {
    width: '31.7%',
    minHeight: 86,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
  },
  gridIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridLabel: { fontSize: 11, fontWeight: '500', textAlign: 'center' },

  quickRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  quickChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  quickText: { fontSize: 14, fontWeight: '500' },

  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  dateText: { flex: 1, fontSize: 17 },
  pickerWrap: {
    marginTop: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    overflow: 'hidden',
    paddingVertical: spacing.xs,
  },
  fieldError: { fontSize: 13, marginTop: spacing.sm, marginLeft: spacing.xs },

  delete: {
    marginTop: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 48,
  },
  deleteText: { fontSize: 17 },
});
