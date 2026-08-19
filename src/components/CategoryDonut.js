import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import Money from './Money';
import { useTheme } from '../context/SettingsContext';
import { spacing } from '../theme';

const SIZE = 180;
const RADIUS = 70;
const STROKE = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Ring chart of the share each category takes of one month.
 *
 * Each slice is one stroked circle with a dash pattern: the dash is the length
 * of the slice and the gap is the rest of the ring. Offsetting each slice by
 * the length of the slices before it places them end to end.
 */
export default function CategoryDonut({ rows, total }) {
  const theme = useTheme();

  if (total <= 0) return null;

  let offset = 0;
  const slices = rows.map((row) => {
    const length = (row.total / total) * CIRCUMFERENCE;
    const slice = { id: row.id, color: row.color, length, offset };
    offset += length;
    return slice;
  });

  return (
    <View style={styles.root}>
      <View style={styles.chart}>
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {/* Rotate so the first slice starts at the top rather than the right. */}
          <G rotation="-90" origin={`${SIZE / 2}, ${SIZE / 2}`}>
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke={theme.surface}
              strokeWidth={STROKE}
              fill="none"
            />
            {slices.map((slice) => (
              <Circle
                key={slice.id}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                stroke={slice.color}
                strokeWidth={STROKE}
                strokeDasharray={`${slice.length} ${CIRCUMFERENCE - slice.length}`}
                strokeDashoffset={-slice.offset}
                fill="none"
              />
            ))}
          </G>
        </Svg>

        <View style={styles.centre} pointerEvents="none">
          <Money amount={total} style={[styles.centreValue, { color: theme.text }]} />
          <Text style={[styles.centreLabel, { color: theme.textMuted }]}>total</Text>
        </View>
      </View>

      <View style={styles.legend}>
        {rows.map((row) => (
          <View key={row.id} style={styles.legendItem}>
            <View style={[styles.swatch, { backgroundColor: row.color }]} />
            <Text style={[styles.legendText, { color: theme.textMuted }]}>
              {row.label} {Math.round((row.total / total) * 100)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', gap: spacing.lg },
  chart: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  centre: { position: 'absolute', alignItems: 'center' },
  centreValue: { fontSize: 22, fontWeight: '700' },
  centreLabel: { fontSize: 12 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  swatch: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 13, fontWeight: '400' },
});
