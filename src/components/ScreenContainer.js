import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../context/SettingsContext';

/**
 * Wraps a screen in the themed background and keeps content clear of the
 * notch / home indicator on both platforms.
 *
 * `elevated` marks a screen presented as a modal sheet. In dark mode iOS
 * lightens a sheet rather than shadowing it, because a shadow needs something
 * lighter to fall on and there is nothing lighter than black. Without this a
 * black sheet opens over a black page and the edge between them disappears.
 */
export default function ScreenContainer({ children, edges = ['top'], elevated, style }) {
  const theme = useTheme();
  const background = elevated ? theme.backgroundElevated : theme.background;

  return (
    <SafeAreaView edges={edges} style={[styles.root, { backgroundColor: background }]}>
      <View style={[styles.inner, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: { flex: 1 },
});
