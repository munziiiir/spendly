import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Money from './Money';
import { useSettings, useTheme } from '../context/SettingsContext';
import { radius, spacing } from '../theme';
import { formatDate, formatMoney } from '../utils/format';

/**
 * Horizontal bars for each category, where a bar opens to show the expenses
 * behind it.
 *
 * The chart alone says which category is large. Opening the section answers
 * the next question, which is what made it large.
 */
export default function CategoryBreakdown({ rows, total, expenses, onOpenExpense }) {
  const theme = useTheme();
  const { currency } = useSettings();
  const [openId, setOpenId] = useState(null);

  return (
    <View style={styles.root}>
      {rows.map((row) => {
        const share = total > 0 ? row.total / total : 0;
        const open = openId === row.id;
        const items = open
          ? expenses.filter((item) => item.category === row.id)
          : [];

        return (
          <View key={row.id}>
            <Pressable
              onPress={() => setOpenId(open ? null : row.id)}
              accessibilityRole="button"
              accessibilityState={{ expanded: open }}
              accessibilityLabel={`${row.label}, ${formatMoney(row.total, currency)}, ${
                open ? 'hide' : 'show'
              } the expenses`}
              style={({ pressed }) => [styles.barRow, pressed && { opacity: 0.6 }]}
            >
              <View style={styles.barLabels}>
                <View style={styles.barName}>
                  <Ionicons name={row.icon} size={15} color={row.color} />
                  <Text style={[styles.barText, { color: theme.text }]}>{row.label}</Text>
                  <Ionicons
                    name={open ? 'chevron-up' : 'chevron-down'}
                    size={13}
                    color={theme.textMuted}
                  />
                </View>
                <View style={styles.barValue}>
                  <Money
                    amount={row.total}
                    style={[styles.barText, { color: theme.textMuted }]}
                  />
                  <Text style={[styles.barText, { color: theme.textMuted }]}>
                    {' '}
                    · {Math.round(share * 100)}%
                  </Text>
                </View>
              </View>
              <View style={[styles.track, { backgroundColor: theme.surface }]}>
                <View
                  style={[styles.fill, { width: `${share * 100}%`, backgroundColor: row.color }]}
                />
              </View>
            </Pressable>

            {open && (
              <View style={[styles.details, { borderLeftColor: row.color }]}>
                {items.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => onOpenExpense(item.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.note || row.label}, ${formatMoney(
                      item.amount,
                      currency
                    )}, ${formatDate(item.date)}. Tap to edit.`}
                    style={({ pressed }) => [styles.detailRow, pressed && { opacity: 0.6 }]}
                  >
                    <View style={styles.detailBody}>
                      <Text style={[styles.detailTitle, { color: theme.text }]} numberOfLines={1}>
                        {item.note || row.label}
                      </Text>
                      <Text style={[styles.detailDate, { color: theme.textMuted }]}>
                        {formatDate(item.date)}
                      </Text>
                    </View>
                    <Money
                      amount={item.amount}
                      style={[styles.detailAmount, { color: theme.text }]}
                    />
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.lg },
  barRow: { gap: spacing.sm },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  barValue: { flexDirection: 'row', alignItems: 'center' },
  barName: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  barText: { fontSize: 13, fontWeight: '500' },
  track: { height: 10, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
  details: {
    marginTop: spacing.sm,
    marginLeft: spacing.sm,
    paddingLeft: spacing.md,
    borderLeftWidth: 2,
    gap: spacing.md,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  detailBody: { flex: 1 },
  detailTitle: { fontSize: 15, fontWeight: '400' },
  detailDate: { fontSize: 12 },
  detailAmount: { fontSize: 15, fontWeight: '600' },
});
