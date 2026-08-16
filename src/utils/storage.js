import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Thin wrapper around AsyncStorage.
 *
 * Every call is wrapped in try/catch so that a corrupted value or a failed
 * device write degrades into "no saved data" rather than crashing the app on
 * launch. The caller is told whether the operation succeeded so it can surface
 * an error banner.
 */

export async function loadJSON(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return { ok: true, value: fallback };
    return { ok: true, value: JSON.parse(raw) };
  } catch (error) {
    console.warn(`[storage] failed to read "${key}"`, error);
    return { ok: false, value: fallback, error };
  }
}

export async function saveJSON(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch (error) {
    console.warn(`[storage] failed to write "${key}"`, error);
    return { ok: false, error };
  }
}

export async function removeKeys(keys) {
  try {
    await AsyncStorage.multiRemove(keys);
    return { ok: true };
  } catch (error) {
    console.warn('[storage] failed to clear keys', error);
    return { ok: false, error };
  }
}
