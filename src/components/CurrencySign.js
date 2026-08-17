import { Text } from 'react-native';

import RufiyaaSign from './RufiyaaSign';
import { getCurrencySymbol } from '../constants/categories';

/**
 * The sign of a currency on its own, without an amount.
 *
 * Used where a screen shows the sign as a label: the prefix of the amount
 * field, and the currency list in Settings. The rufiyaa is drawn; every other
 * sign is a character.
 */
export default function CurrencySign({ code, size = 20, color, weight = '700' }) {
  if (code === 'MVR') {
    return <RufiyaaSign size={size * 0.74} color={color} />;
  }

  return (
    <Text style={{ fontSize: size, color, fontWeight: weight }}>
      {getCurrencySymbol(code)}
    </Text>
  );
}
