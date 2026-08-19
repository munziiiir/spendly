import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/SettingsContext';
import { continuous, radius, shadow, spacing } from '../theme';
import { haptics } from '../utils/haptics';

/**
 * The iOS segmented control.
 *
 * Two screens needed one of these and both had drawn their own, filling the
 * selected segment with the brand colour. That is an Android pattern. iOS
 * marks the selection with a raised pale thumb that slides between the
 * segments, and leaves every label the same colour — the position of the thumb
 * carries the meaning, not the colour of the text.
 *
 * The thumb is a single absolutely positioned view that animates its x
 * position, rather than a background on the selected segment. A background
 * cannot travel, and the travel is the part the user reads as "iOS".
 *
 * `options` is `[{ id, label, icon? }]`. `icon` is an Ionicons name and is
 * optional, so the same control serves a plain three-way choice and the
 * icon-and-label switcher on the Stats tab.
 */
export default function SegmentedControl({ options, value, onChange, accessibilityLabelSuffix }) {
  const theme = useTheme();
  const [trackWidth, setTrackWidth] = useState(0);

  const index = Math.max(0, options.findIndex((option) => option.id === value));
  const segmentWidth = trackWidth > 0 ? (trackWidth - PADDING * 2) / options.length : 0;

  // The thumb starts under the selected segment rather than sliding in from
  // the left on first paint.
  const offset = useRef(new Animated.Value(0)).current;
  const settled = useRef(false);

  useEffect(() => {
    if (segmentWidth === 0) return;
    const target = index * segmentWidth;

    if (!settled.current) {
      offset.setValue(target);
      settled.current = true;
      return;
    }

    // A spring, because the iOS thumb overshoots very slightly and settles.
    // `useNativeDriver` keeps the travel on the UI thread, so it stays smooth
    // while the screen behind it re-renders with the new selection.
    Animated.spring(offset, {
      toValue: target,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  }, [index, segmentWidth, offset]);

  return (
    <View
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      style={[styles.track, continuous, { backgroundColor: theme.surface }]}
    >
      {segmentWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.thumb,
            continuous,
            shadow.thumb,
            {
              width: segmentWidth,
              backgroundColor: theme.segmentThumb,
              transform: [{ translateX: offset }],
            },
          ]}
        />
      )}

      {options.map((option) => {
        const selected = option.id === value;
        return (
          <Pressable
            key={String(option.id)}
            onPress={() => {
              if (!selected) haptics.selected();
              onChange(option.id);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`${option.label}${accessibilityLabelSuffix || ''}`}
            style={styles.segment}
          >
            {!!option.icon && (
              <Ionicons
                name={option.icon}
                size={14}
                color={selected ? theme.text : theme.textMuted}
              />
            )}
            <Text
              numberOfLines={1}
              maxFontSizeMultiplier={1.4}
              style={[
                styles.label,
                { color: selected ? theme.text : theme.textMuted },
                // iOS thickens the selected label a little. It is the only
                // difference in the text, so it stays subtle on purpose.
                selected && styles.labelSelected,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** The inset of the thumb inside its track, in points. iOS uses 2. */
const PADDING = 2;

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: radius.sm + 1,
    padding: PADDING,
  },
  thumb: {
    position: 'absolute',
    top: PADDING,
    bottom: PADDING,
    left: PADDING,
    borderRadius: radius.sm - 1,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: 7,
    minHeight: 32,
  },
  label: { fontSize: 13, fontWeight: '500' },
  labelSelected: { fontWeight: '600' },
});
