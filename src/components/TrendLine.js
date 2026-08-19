import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import Money from './Money';
import { convert } from '../constants/rates';
import { useSettings, useTheme } from '../context/SettingsContext';
import { spacing } from '../theme';
import { formatMonth, shiftMonth } from '../utils/format';

const WIDTH = 300;
const HEIGHT = 140;
const PADDING = 12;
const MONTHS = 6;

/**
 * Spending over the six months that end with the selected month.
 *
 * The chart answers a question the single-month views cannot: whether spending
 * is going up or down over time.
 */
export default function TrendLine({ monthlyTotals, month }) {
  const theme = useTheme();
  const { currency } = useSettings();

  // Oldest month first, so the line reads left to right. The totals arrive in
  // US dollars, because the list can hold more than one currency.
  const points = Array.from({ length: MONTHS }, (unused, index) => {
    const key = shiftMonth(month, index - (MONTHS - 1));
    return { key, total: convert(monthlyTotals[key] || 0, 'USD', currency) };
  });

  const max = Math.max(...points.map((point) => point.total));
  const scale = max > 0 ? max : 1;

  // One equal column per month, with the point in the middle of its column.
  // The month labels below sit in columns of the same width, so every label
  // lines up under its own point.
  const stepX = WIDTH / MONTHS;
  const plot = points.map((point, index) => ({
    ...point,
    x: (index + 0.5) * stepX,
    y: HEIGHT - PADDING - (point.total / scale) * (HEIGHT - PADDING * 2),
  }));

  return (
    <View style={styles.root}>
      <View style={styles.scale}>
        <View style={styles.scaleRow}>
          <Text style={[styles.scaleText, { color: theme.textMuted }]}>Peak </Text>
          <Money amount={max} style={[styles.scaleText, { color: theme.textMuted }]} />
        </View>
        <Text style={[styles.scaleText, { color: theme.textMuted }]}>Last {MONTHS} months</Text>
      </View>

      <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <Line
          x1={PADDING}
          y1={HEIGHT - PADDING}
          x2={WIDTH - PADDING}
          y2={HEIGHT - PADDING}
          stroke={theme.border}
          strokeWidth={1}
        />
        <Polyline
          points={plot.map((point) => `${point.x},${point.y}`).join(' ')}
          fill="none"
          stroke={theme.brand}
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {plot.map((point, index) => (
          <Circle
            key={point.key}
            cx={point.x}
            cy={point.y}
            r={index === MONTHS - 1 ? 6 : 4}
            fill={index === MONTHS - 1 ? theme.brand : theme.card}
            stroke={theme.brand}
            strokeWidth={2}
          />
        ))}
      </Svg>

      <View style={styles.axis}>
        {plot.map((point) => (
          <Text key={point.key} style={[styles.axisText, { color: theme.textMuted }]}>
            {formatMonth(point.key).slice(0, 3)}
          </Text>
        ))}
      </View>

      <View style={styles.captionRow}>
        <Text style={[styles.caption, { color: theme.textMuted }]}>
          {formatMonth(month)}:{' '}
        </Text>
        <Money
          amount={convert(monthlyTotals[month] || 0, 'USD', currency)}
          style={[styles.caption, { color: theme.textMuted }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.sm },
  scale: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scaleRow: { flexDirection: 'row', alignItems: 'center' },
  captionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  scaleText: { fontSize: 13, fontWeight: '500' },
  axis: { flexDirection: 'row' },
  axisText: { flex: 1, fontSize: 11, textAlign: 'center' },
  caption: { fontSize: 12, textAlign: 'center' },
});
