import { StyleSheet, Text, View } from 'react-native';

import RufiyaaSign from './RufiyaaSign';
import { getCurrencySymbol } from '../constants/categories';
import { convert } from '../constants/rates';
import { useSettings } from '../context/SettingsContext';

/**
 * An amount of money, shown in the currency the user has chosen.
 *
 * `amount` is the figure as recorded and `from` is the currency it was
 * recorded in. The component converts it for display, so an expense entered as
 * 10 US dollars reads as 154.20 rufiyaa once the user switches to MVR. The
 * stored figure never changes.
 *
 * The rufiyaa has no sign in Unicode, so it is drawn beside the digits. Every
 * other currency has a sign that a font can render, so it goes in the same
 * Text as the digits and wraps with them.
 */
export default function Money({ amount, from, style, numberOfLines }) {
  const { currency } = useSettings();
  const value = convert(amount, from || currency, currency);
  const digits = (Number.isFinite(value) ? value : 0).toFixed(2);

  const flat = StyleSheet.flatten(style) || {};
  const fontSize = flat.fontSize || 14;

  if (currency !== 'MVR') {
    return (
      <Text style={style} numberOfLines={numberOfLines}>
        {getCurrencySymbol(currency)}
        {digits}
      </Text>
    );
  }

  return (
    <View style={styles.row}>
      {/* The sign is wide, so it takes a little under two thirds of the font
          size. That keeps its stroke weight close to the weight of the digits. */}
      <RufiyaaSign size={fontSize * 0.62} color={flat.color} />
      <Text style={style} numberOfLines={numberOfLines}>
        {digits}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 3 },
});
