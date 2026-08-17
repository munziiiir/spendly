import { StyleSheet, Text, View } from 'react-native';

import Money from './Money';
import { useTheme } from '../context/SettingsContext';
import { radius, spacing } from '../theme';

const CHART_HEIGHT = 140;

/**
 * One bar for every day of the selected month.
 *
 * Drawn with plain Views rather than SVG: a bar chart is only a row of
 * rectangles, and this way it needs no extra drawing code and themes itself.
 */
export default function DailyBars({ expenses, month }) {
  const theme = useTheme();

  const [year, monthNumber] = month.split('-').map(Number);
  const dayCount = new Date(year, monthNumber, 0).getDate();

  const totals = new Array(dayCount).fill(0);
  expenses.forEach((item) => {
    const day = Number(item.date.slice(8, 10));
    if (day >= 1 && day <= dayCount) totals[day - 1] += item.amount;
  });

  const max = Math.max(...totals);
  if (max <= 0) return null;

  const busiestDay = totals.indexOf(max) + 1;

  return (
    <View style={styles.root}>
      <View style={styles.scale}>
        <Money amount={max} style={[styles.scaleText, { color: theme.textMuted }]} />
        <Text style={[styles.scaleText, { color: theme.textMuted }]}>
          Busiest day: {busiestDay} of {dayCount}
        </Text>
      </View>

      <View style={[styles.chart, { height: CHART_HEIGHT }]}>
        {totals.map((value, index) => (
          <View key={index} style={styles.column}>
            <View
              style={[
                styles.bar,
                {
                  // A day with any spending keeps a visible stub.
                  height: value > 0 ? Math.max((value / max) * CHART_HEIGHT, 3) : 1,
                  backgroundColor: value > 0 ? theme.brand : theme.border,
                },
              ]}
            />
          </View>
        ))}
      </View>

      <View style={styles.axis}>
        <Text style={[styles.axisText, { color: theme.textMuted }]}>1</Text>
        <Text style={[styles.axisText, { color: theme.textMuted }]}>
          {Math.round(dayCount / 2)}
        </Text>
        <Text style={[styles.axisText, { color: theme.textMuted }]}>{dayCount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.sm },
  scale: { flexDirection: 'row', justifyContent: 'space-between' },
  scaleText: { fontSize: 12, fontWeight: '600' },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  column: { flex: 1, justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: radius.sm, minHeight: 1 },
  axis: { flexDirection: 'row', justifyContent: 'space-between' },
  axisText: { fontSize: 11 },
});
