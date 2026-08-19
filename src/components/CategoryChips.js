import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';

import { CATEGORIES } from '../constants/categories';
import { useTheme } from '../context/SettingsContext';
import { continuous, radius, spacing } from '../theme';
import { haptics } from '../utils/haptics';

/**
 * Horizontal filter bar on the Home screen. `value` of null means "All".
 *
 * An unselected chip is a plain grey fill rather than an outline. iOS uses
 * fills for this — an outlined chip reads as a button waiting to be pressed,
 * and there are eight of them, so eight outlines make the row look busier than
 * the list it filters.
 */
export default function CategoryChips({ value, onChange }) {
  const theme = useTheme();
  const options = [{ id: null, label: 'All', color: theme.brand }, ...CATEGORIES];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {options.map((option) => {
        const selected = value === option.id;
        return (
          <Pressable
            key={option.id ?? 'all'}
            onPress={() => {
              haptics.selected();
              onChange(option.id);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`${option.label} filter`}
            style={({ pressed }) => [
              styles.chip,
              continuous,
              { backgroundColor: selected ? option.color : theme.surface },
              pressed && styles.pressed,
            ]}
          >
            {/* `onBrand` is white in both palettes. A selected chip is filled
                with a saturated colour either way, so its label does not
                follow the light/dark text colour. */}
            {!!option.icon && (
              <Ionicons
                name={option.icon}
                size={14}
                color={selected ? theme.onBrand : option.color}
              />
            )}
            <Text
              style={[styles.label, { color: selected ? theme.onBrand : theme.text }]}
              maxFontSizeMultiplier={1.4}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
      {/* Keeps the last chip clear of the screen edge when the row is scrolled
          to its end. */}
      <View style={styles.tailSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingVertical: spacing.sm, alignItems: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    minHeight: 34,
  },
  label: { fontSize: 14, fontWeight: '500' },
  pressed: { opacity: 0.6 },
  tailSpacer: { width: spacing.xs },
});
