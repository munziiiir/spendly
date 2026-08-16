import { ScrollView, StyleSheet, Text, Pressable } from 'react-native';

import { CATEGORIES } from '../constants/categories';
import { useTheme } from '../context/SettingsContext';
import { radius, spacing } from '../theme';

/** Horizontal filter bar on the Home screen. `value` of null means "All". */
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
            onPress={() => onChange(option.id)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? option.color : theme.card,
                borderColor: selected ? option.color : theme.border,
              },
            ]}
          >
            <Text
              style={[styles.label, { color: selected ? '#FFFFFF' : theme.textMuted }]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingVertical: spacing.sm },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  label: { fontSize: 13, fontWeight: '600' },
});
