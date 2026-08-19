import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '../context/SettingsContext';
import { continuous, radius, shadow, spacing } from '../theme';
import { haptics } from '../utils/haptics';

/**
 * The main call to action of the app: record an expense.
 *
 * It floats over the bottom of the expense list rather than sitting in the tab
 * bar, because adding an expense is an action and the tabs are places. The
 * list keeps a bottom padding wide enough that the button never covers the
 * last row.
 */
export default function AddExpenseButton() {
  const theme = useTheme();
  const router = useRouter();

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
    <Animated.View style={[styles.root, shadow.soft, { transform: [{ scale }] }]}>
      <Pressable
        onPressIn={() => press(0.95)}
        onPressOut={() => press(1)}
        onPress={() => {
          haptics.pressed();
          router.push('/expense/new');
        }}
        accessibilityRole="button"
        accessibilityLabel="Add an expense"
        style={[styles.button, continuous, { backgroundColor: theme.brand }]}
      >
        <Ionicons name="add" size={22} color={theme.onBrand} />
        <Text style={[styles.label, { color: theme.onBrand }]} maxFontSizeMultiplier={1.3}>
          Add expense
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
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
  },
  label: { fontSize: 16, fontWeight: '600' },
});
