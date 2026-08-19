import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/SettingsContext';
import { spacing } from '../theme';

/**
 * The toolbar across the top of the two modal sheets: cancel, title, confirm.
 *
 * The app drew this itself rather than using the navigation bar iOS supplies.
 * iOS 26 renders a bar button inside a liquid glass capsule, and that capsule
 * sat on the opaque header background the app had asked for, so the button
 * read as a grey smudge behind the word "Cancel". Two materials were fighting
 * over the same strip of screen.
 *
 * Drawing the toolbar in the sheet removes the argument: there is one surface,
 * the app owns it, and it matches every other surface in the app.
 *
 * The explicit Cancel stays for the reason it was first added — iOS presents a
 * modal as a card whose only other way out is a downward swipe, and that
 * gesture is not discoverable.
 */
export default function SheetHeader({ title, onCancel, actionLabel, onAction, actionDisabled }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // A sheet on iOS already begins below the status bar, so it needs no inset
  // of its own. Android presents the same route full screen, where the inset
  // is the only thing keeping the toolbar clear of the status bar.
  const topInset = Platform.OS === 'android' ? insets.top : 0;

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: topInset,
          backgroundColor: theme.background,
          borderBottomColor: theme.separator,
        },
      ]}
    >
      <View style={styles.bar}>
        <View style={styles.side}>
          <BarButton label="Cancel" onPress={onCancel} color={theme.brand} align="flex-start" />
        </View>

        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.side}>
          {!!actionLabel && (
            <BarButton
              label={actionLabel}
              onPress={onAction}
              color={theme.brand}
              align="flex-end"
              strong
              disabled={actionDisabled}
            />
          )}
        </View>
      </View>
    </View>
  );
}

/**
 * One text button in the toolbar.
 *
 * `hitSlop` matters more than the size of the glyph: the text is 17pt, which
 * is smaller than the 44pt target iOS asks for, so the tappable area is grown
 * rather than the text.
 */
function BarButton({ label, onPress, color, align, strong, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      style={({ pressed }) => [
        styles.button,
        { alignItems: align },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.buttonText, strong && styles.buttonStrong, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { borderBottomWidth: StyleSheet.hairlineWidth },
  bar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  // Both sides take the same width so the title stays centred on the sheet
  // whatever the two buttons are called.
  side: { flex: 1, justifyContent: 'center' },
  button: { justifyContent: 'center' },
  buttonText: { fontSize: 17 },
  // iOS puts the weight on the confirming button, never on Cancel.
  buttonStrong: { fontWeight: '600' },
  pressed: { opacity: 0.4 },
  disabled: { opacity: 0.4 },
  title: { fontSize: 17, fontWeight: '600', letterSpacing: -0.4 },
});
