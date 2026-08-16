import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { darkTheme, lightTheme } from '../theme';
import { loadJSON, saveJSON } from '../utils/storage';

const STORAGE_KEY = '@spendly/settings';

const DEFAULT_SETTINGS = {
  currency: 'GBP',
  themeMode: 'system', // 'system' | 'light' | 'dark'
  monthlyBudget: 500,
};

const SettingsContext = createContext(null);

/**
 * User preferences (currency, theme, budget), also persisted to AsyncStorage.
 *
 * Split from the expenses store because it changes far less often — keeping
 * them apart stops a settings tweak from re-rendering the whole expense list.
 */
export function SettingsProvider({ children }) {
  const systemScheme = useColorScheme();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const result = await loadJSON(STORAGE_KEY, DEFAULT_SETTINGS);
      if (cancelled) return;
      // Merge rather than replace, so a settings key added in a later version
      // still gets its default instead of coming back undefined.
      setSettings({ ...DEFAULT_SETTINGS, ...(result.value || {}) });
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateSetting = useCallback((key, value) => {
    setSettings((current) => {
      const next = { ...current, [key]: value };
      saveJSON(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    saveJSON(STORAGE_KEY, DEFAULT_SETTINGS);
  }, []);

  const isDark =
    settings.themeMode === 'system' ? systemScheme === 'dark' : settings.themeMode === 'dark';

  const value = useMemo(
    () => ({
      ...settings,
      loading,
      isDark,
      theme: isDark ? darkTheme : lightTheme,
      updateSetting,
      resetSettings,
    }),
    [settings, loading, isDark, updateSetting, resetSettings]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used inside a SettingsProvider');
  return context;
}

/** Convenience hook for the many components that only need colours. */
export function useTheme() {
  return useSettings().theme;
}
