import { useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/SettingsContext';
import { spacing } from '../theme';

/** How far the page scrolls before the compact title has fully appeared. */
const FADE_START = 16;
const FADE_END = 44;

/**
 * The compact title bar that appears once the large title has scrolled away.
 *
 * iOS never leaves the user without a title. The large title goes up with the
 * content, and this takes its place. Both are needed: the large one gives the
 * screen its identity on arrival, and this one keeps the answer to "where am
 * I" available after that.
 *
 * The bar sits over the content and is driven by the scroll position of the
 * page, so it costs nothing until the user scrolls. `useNativeDriver` keeps
 * the fade on the UI thread, which means it stays smooth while the list below
 * is re-rendering.
 */
export default function NavBar({ title, scrollY }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const opacity = scrollY.interpolate({
    inputRange: [FADE_START, FADE_END],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  /**
   * Whether the bar is solid enough to be catching taps.
   *
   * The bar is opaque once it has appeared, and the content it hides keeps
   * scrolling underneath. Left permanently transparent to touch, a tap on the
   * bar would open whichever expense happened to be behind it — a row the user
   * cannot see. So the bar swallows taps while it is visible, and lets them
   * through while it is not.
   *
   * The listener still runs with the fade on the native driver; it reports the
   * value back to JavaScript, and the state only changes on the two frames
   * where the bar crosses the threshold.
   */
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const id = scrollY.addListener(({ value }) => {
      setSolid((current) => {
        const next = value >= FADE_END;
        return next === current ? current : next;
      });
    });
    return () => scrollY.removeListener(id);
  }, [scrollY]);

  return (
    <Animated.View
      pointerEvents={solid ? 'auto' : 'none'}
      style={[
        styles.root,
        {
          opacity,
          paddingTop: insets.top,
          backgroundColor: theme.background,
          borderBottomColor: theme.separator,
        },
      ]}
    >
      <View style={styles.bar}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    // A hairline is the whole separator on iOS. A one-point line reads as a
    // border drawn by an app rather than an edge drawn by the system.
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  // 44pt is the height of a UIKit navigation bar.
  bar: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    ...Platform.select({ ios: { letterSpacing: -0.4 }, default: {} }),
  },
});
