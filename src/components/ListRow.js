import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/SettingsContext';
import { spacing } from '../theme';

/**
 * One row inside a `ListGroup`.
 *
 * The separator belongs to the row rather than to the group, because only the
 * row knows whether it is the last one — and the last row of an iOS list has
 * no rule under it. It is also inset to the start of the label, not drawn from
 * edge to edge, so the icon column reads as a column.
 *
 * A row without `onPress` renders as a plain view, so the same component
 * serves a control and a line of information without a press state that does
 * nothing.
 */
export default function ListRow({
  icon,
  iconColor,
  iconBackground,
  leading,
  title,
  subtitle,
  value,
  selected,
  chevron,
  destructive,
  last,
  onPress,
  accessibilityLabel,
  children,
}) {
  const theme = useTheme();
  // `leading` puts any node in the icon column. The currency rows use it to
  // show a currency sign, which is drawn text rather than an Ionicons glyph
  // and so cannot go through `icon`.
  const hasLead = !!icon || !!leading;

  const body = (
    <>
      {hasLead && (
        <View style={[styles.iconWrap, !!iconBackground && { backgroundColor: iconBackground }]}>
          {leading ?? <Ionicons name={icon} size={19} color={iconColor || theme.brand} />}
        </View>
      )}

      <View style={styles.body}>
        {!!title && (
          <Text
            style={[styles.title, { color: destructive ? theme.danger : theme.text }]}
            numberOfLines={1}
          >
            {title}
          </Text>
        )}
        {!!subtitle && (
          <Text style={[styles.subtitle, { color: theme.textMuted }]} numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>

      {children}

      {!!value && (
        <Text style={[styles.value, { color: theme.textMuted }]} numberOfLines={1}>
          {value}
        </Text>
      )}

      {/* A tick marks the chosen option in a list of choices, which is how iOS
          shows a single selection inside a grouped list.

          The column is reserved on every row of the group, not only on the
          chosen one. Rendering it only when selected would let the tick push
          the other content sideways, so the one selected row would sit out of
          line with the rest of the list. */}
      {typeof selected === 'boolean' && (
        <View style={styles.tick}>
          {selected && <Ionicons name="checkmark" size={20} color={theme.brand} />}
        </View>
      )}

      {chevron && <Ionicons name="chevron-forward" size={17} color={theme.textMuted} />}
    </>
  );

  const content = <View style={styles.inner}>{body}</View>;

  return (
    <View>
      {onPress ? (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityState={{ selected: !!selected }}
          accessibilityLabel={accessibilityLabel}
          // iOS fills the whole row while it is held, rather than fading it.
          style={({ pressed }) => pressed && { backgroundColor: theme.surface }}
        >
          {content}
        </Pressable>
      ) : (
        content
      )}

      {!last && (
        <View
          style={[
            styles.separator,
            { backgroundColor: theme.separator, marginLeft: hasLead ? 58 : spacing.lg },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingRight: spacing.lg,
    // 44pt is the smallest target iOS asks for, and the height of a plain
    // list row.
    minHeight: 44,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.lg,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 1 },
  title: { fontSize: 17 },
  subtitle: { fontSize: 13 },
  value: { fontSize: 17 },
  tick: { width: 22, alignItems: 'center' },
  separator: { height: StyleSheet.hairlineWidth },
});
