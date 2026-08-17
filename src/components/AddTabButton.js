import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/SettingsContext';
import { spacing } from '../theme';

/**
 * The raised centre button of the tab bar.
 *
 * It occupies a tab slot so that the three real tabs keep an even spacing
 * around it, but it never switches tab: it pushes the Add modal on the root
 * stack instead. Adding an expense is an action, not a place.
 */
export default function AddTabButton() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View style={styles.slot}>
      <Pressable
        onPress={() => router.push('/expense/new')}
        accessibilityRole="button"
        accessibilityLabel="Add an expense"
        hitSlop={8}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: theme.brand, borderColor: theme.card },
          pressed && { opacity: 0.85, transform: [{ scale: 0.94 }] },
        ]}
      >
        <Ionicons name="add" size={30} color={theme.onBrand} />
      </Pressable>
      <Text style={[styles.label, { color: theme.textMuted }]}>Add</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: { flex: 1, alignItems: 'center' },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    // Lifts the button above the bar so it reads as the main action.
    marginTop: -22,
    borderWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  label: { fontSize: 10, fontWeight: '600', marginTop: spacing.xs },
});
