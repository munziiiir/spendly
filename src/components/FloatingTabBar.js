import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import GlassSurface from './GlassSurface';
import { useTheme } from '../context/SettingsContext';
import { radius, shadow, spacing } from '../theme';
import { haptics } from '../utils/haptics';

/** Height of the bar itself, without the gap below it. */
export const TAB_BAR_HEIGHT = 58;

/** The gap between the bottom of the bar and the safe area. */
export const TAB_BAR_GAP = spacing.sm;

/**
 * How much room a screen must leave at the foot of its scrolling content so
 * the floating bar never covers the last row.
 *
 * The bar is out of the layout — it floats over the screen — so nothing
 * reserves this space automatically and each screen has to add it.
 */
export function useTabBarSpace() {
  const insets = useSafeAreaInsets();
  return insets.bottom + TAB_BAR_HEIGHT + TAB_BAR_GAP * 2;
}

/** The inset of the highlight capsule inside the bar, in points. */
const PADDING = 5;

/**
 * The tab bar: a floating island of Liquid Glass.
 *
 * iOS 26 lifted the tab bar off the bottom edge and turned it into a pane of
 * glass that the content passes underneath. A bar welded to the bottom of the
 * screen, painted one flat colour, is the shape of an older iOS — and it was
 * the last part of this app still drawn that way.
 *
 * The bar floats over the screens rather than sitting below them, so every
 * screen pads its scrolling content by `useTabBarSpace()`.
 */
export default function FloatingTabBar({ state, descriptors, navigation }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);

  const count = state.routes.length;
  const tabWidth = barWidth > 0 ? (barWidth - PADDING * 2) / count : 0;

  // The capsule slides between tabs instead of appearing under the new one,
  // the same movement the segmented control makes. One idea, used twice.
  const offset = useRef(new Animated.Value(0)).current;
  const settled = useRef(false);

  useEffect(() => {
    if (tabWidth === 0) return;
    const target = state.index * tabWidth;

    if (!settled.current) {
      offset.setValue(target);
      settled.current = true;
      return;
    }

    Animated.spring(offset, {
      toValue: target,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  }, [state.index, tabWidth, offset]);

  return (
    <View
      pointerEvents="box-none"
      style={[styles.root, { paddingBottom: insets.bottom + TAB_BAR_GAP }]}
    >
      <GlassSurface
        onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
        style={[styles.bar, shadow.soft]}
      >
        {tabWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.highlight,
              {
                width: tabWidth,
                backgroundColor: theme.glassHighlight,
                transform: [{ translateX: offset }],
              },
            ]}
          />
        )}

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const label = options.title ?? route.name;
          const color = focused ? theme.brand : theme.textMuted;

          function onPress() {
            // `emit` is what lets a screen cancel the move, and what makes a
            // second tap on the active tab scroll its list back to the top.
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              haptics.selected();
              navigation.navigate(route.name);
            }
          }

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={() =>
                navigation.emit({ type: 'tabLongPress', target: route.key })
              }
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={`${label} tab`}
              style={styles.tab}
            >
              {options.tabBarIcon?.({ focused, color, size: 24 })}
              <Text
                numberOfLines={1}
                maxFontSizeMultiplier={1.3}
                style={[styles.label, { color }]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  // `box-none` on the wrapper lets touches through everywhere except on the
  // bar, so the list keeps scrolling either side of the island.
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: TAB_BAR_HEIGHT,
    padding: PADDING,
    borderRadius: radius.pill,
    // The glass clips its own corners, so the capsule inside must be clipped
    // with it or it will square off the ends of the island.
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    top: PADDING,
    bottom: PADDING,
    left: PADDING,
    borderRadius: radius.pill,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: { fontSize: 10, fontWeight: '500' },
});
