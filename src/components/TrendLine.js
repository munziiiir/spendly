import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import { useSettings, useTheme } from '../context/SettingsContext';
import { spacing } from '../theme';
import { formatMoney, formatMonth, shiftMonth } from '../utils/format';

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

  // Oldest month first, so the line reads left to right.
  const points = Array.from({ length: MONTHS }, (unused, index) => {
    const key = shiftMonth(month, index - (MONTHS - 1));
    return { key, total: monthlyTotals[key] || 0 };
  });

  const max = Math.max(...points.map((point) => point.total));
  const scale = max > 0 ? max : 1;

  const stepX = (WIDTH - PADDING * 2) / (MONTHS - 1);
  const plot = points.map((point, index) => ({
    ...point,
    x: PADDING + index * stepX,
    y: HEIGHT - PADDING - (point.total / scale) * (HEIGHT - PADDING * 2),
  }));

  return (
    <View style={styles.root}>
      <View style={styles.scale}>
        <Text style={[styles.scaleText, { color: theme.textMuted }]}>
          Peak {formatMoney(max, currency)}
        </Text>
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

      <Text style={[styles.caption, { color: theme.textMuted }]}>
        {formatMonth(month)}: {formatMoney(monthlyTotals[month] || 0, currency)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.sm },
  scale: { flexDirection: 'row', justifyContent: 'space-between' },
  scaleText: { fontSize: 12, fontWeight: '600' },
  axis: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.sm },
  axisText: { fontSize: 11 },
  caption: { fontSize: 12, textAlign: 'center' },
});
