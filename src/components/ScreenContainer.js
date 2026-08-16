import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../context/SettingsContext';

/**
 * Wraps a screen in the themed background and keeps content clear of the
 * notch / home indicator on both platforms.
 */
export default function ScreenContainer({ children, edges = ['top'], style }) {
  const theme = useTheme();
  return (
    <SafeAreaView
      edges={edges}
      style={[styles.root, { backgroundColor: theme.background }]}
    >
      <View style={[styles.inner, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: { flex: 1 },
});
