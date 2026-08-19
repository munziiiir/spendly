import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../context/SettingsContext';

/**
 * A pane of Liquid Glass, with something sensible to fall back to.
 *
 * iOS 26 draws glass itself: the real effect samples what is behind it, bends
 * the light and reacts to movement. No stack of translucent views reproduces
 * that, so the app asks the system for it rather than imitating it.
 *
 * Everywhere else — Android, and any iOS before 26 — the same component draws
 * a near-opaque card instead. That is deliberate. A flat translucent panel
 * over a scrolling list is unreadable, and a bad imitation of glass looks
 * worse than a plain surface that was never trying.
 *
 * `expo-glass-effect` already ships inside Expo Go, and its own fallback on
 * Android is a plain View, so nothing here can stop the app from starting.
 */
export default function GlassSurface({ style, tintColor, children, ...rest }) {
  const theme = useTheme();
  const glass = isLiquidGlassAvailable();

  if (!glass) {
    return (
      <View
        style={[
          style,
          // A hairline gives the panel an edge that the glass would otherwise
          // have given it for free.
          { backgroundColor: tintColor || theme.glassFallback, borderColor: theme.separator },
          styles.fallbackBorder,
        ]}
        {...rest}
      >
        {children}
      </View>
    );
  }

  return (
    <GlassView
      // The app has its own light/dark switch, so the glass is told which one
      // to follow. Left on "auto" it would follow the phone instead, and a
      // user who had forced the app to dark would get a light bar.
      colorScheme={theme.mode}
      glassEffectStyle="regular"
      tintColor={tintColor}
      style={style}
      {...rest}
    >
      {children}
    </GlassView>
  );
}

const styles = StyleSheet.create({
  fallbackBorder: { borderWidth: StyleSheet.hairlineWidth },
});
