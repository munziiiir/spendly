import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';

import GlassSurface from './GlassSurface';
import { useTabBarSpace } from './FloatingTabBar';
import { useTheme } from '../context/SettingsContext';
import { radius, shadow, spacing } from '../theme';
import { haptics } from '../utils/haptics';

/**
 * The main call to action of the app: record an expense.
 *
 * It floats over the bottom of the expense list rather than sitting in the tab
 * bar, because adding an expense is an action and the tabs are places.
 *
 * It is glass, like the tab bar below it, but tinted with the brand colour.
 * iOS 26 uses tinted glass exactly this way: the tint says "this is the button
 * that does the thing" while the material keeps it in the same world as the
 * island underneath. A flat blue capsule beside a pane of glass would read as
 * a leftover from the previous design.
 *
 * It sits above the tab bar rather than beside it, so it can keep its label.
 * An icon alone would be one guess short of obvious on the screen a new user
 * sees first.
 */
export default function AddExpenseButton() {
  const theme = useTheme();
  const router = useRouter();
  const tabBarSpace = useTabBarSpace();

  /**
   * The button shrinks under the finger and springs back.
   *
   * A floating button has no surrounding surface to shade, so a change of
   * opacity is the only feedback it can give, and on a saturated fill that is
   * hard to see. Scale is legible on any colour.
   */
  const scale = useRef(new Animated.Value(1)).current;

  function press(to) {
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  }

  return (
    <Animated.View
      style={[
        styles.root,
        shadow.soft,
        { bottom: tabBarSpace + spacing.xs, transform: [{ scale }] },
      ]}
    >
      <Pressable
        onPressIn={() => press(0.95)}
        onPressOut={() => press(1)}
        onPress={() => {
          haptics.pressed();
          router.push('/expense/new');
        }}
        accessibilityRole="button"
        accessibilityLabel="Add an expense"
      >
        <GlassSurface style={styles.button} tintColor={theme.brand}>
          <Ionicons name="add" size={22} color={theme.onBrand} />
          <Text style={[styles.label, { color: theme.onBrand }]} maxFontSizeMultiplier={1.3}>
            Add expense
          </Text>
        </GlassSurface>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    right: spacing.lg,
    borderRadius: radius.pill,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md + 2,
    paddingLeft: spacing.lg,
    paddingRight: spacing.xl,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  label: { fontSize: 16, fontWeight: '600' },
});
