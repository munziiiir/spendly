import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { RATES, convert } from '../constants/rates';
import { darkTheme, lightTheme } from '../theme';
import { loadJSON, saveJSON } from '../utils/storage';

const STORAGE_KEY = '@spendly/settings';

/**
 * Budgets are held in US dollars, the same base the expense totals use. The
 * screens convert them to the currency the user has chosen. Without this, a
 * budget of 400 would stay 400 after a switch from rufiyaa to dollars and
 * would no longer mean the same amount of money.
 */
const BASE_CURRENCY = 'USD';

// Marks settings whose budgets are already held in the base currency.
const BUDGET_VERSION = 2;

const DEFAULT_SETTINGS = {
  currency: 'GBP',
  themeMode: 'system', // 'system' | 'light' | 'dark'
  monthlyBudget: 500 / RATES.GBP, // 500 pounds, held in dollars
  // Budgets for single months, keyed by "YYYY-MM". A month with no entry here
  // falls back to monthlyBudget, so the Settings figure stays the default.
  monthlyBudgets: {},
  budgetVersion: BUDGET_VERSION,
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
      const stored = result.value || {};
      // Merge rather than replace, so a settings key added in a later version
      // still gets its default instead of coming back undefined.
      const merged = { ...DEFAULT_SETTINGS, ...stored };

      // Budgets saved before this version were held in whatever currency the
      // user had chosen. Convert them to the base currency once, and record
      // that it happened so it never runs twice. The version has to be read
      // from the saved value, not from the merge: the merge would supply the
      // current version as a default and the migration would never run.
      if (stored.budgetVersion !== BUDGET_VERSION) {
        const from = merged.currency || 'GBP';
        merged.monthlyBudget = convert(merged.monthlyBudget, from, BASE_CURRENCY);
        merged.monthlyBudgets = Object.fromEntries(
          Object.entries(merged.monthlyBudgets || {}).map(([key, value]) => [
            key,
            convert(value, from, BASE_CURRENCY),
          ])
        );
        merged.budgetVersion = BUDGET_VERSION;
        saveJSON(STORAGE_KEY, merged);
      }

      setSettings(merged);
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

  /** Give one month its own budget. `value` is in the chosen currency. */
  const setBudgetForMonth = useCallback((monthKey, value) => {
    setSettings((current) => {
      const next = {
        ...current,
        monthlyBudgets: {
          ...current.monthlyBudgets,
          [monthKey]: convert(value, current.currency, BASE_CURRENCY),
        },
      };
      saveJSON(STORAGE_KEY, next);
      return next;
    });
  }, []);

  /** Change the default budget. `value` is in the chosen currency. */
  const setDefaultBudget = useCallback((value) => {
    setSettings((current) => {
      const next = {
        ...current,
        monthlyBudget: convert(value, current.currency, BASE_CURRENCY),
      };
      saveJSON(STORAGE_KEY, next);
      return next;
    });
  }, []);

  /** Drop the budget of one month so it follows the default again. */
  const clearBudgetForMonth = useCallback((monthKey) => {
    setSettings((current) => {
      const nextBudgets = { ...current.monthlyBudgets };
      delete nextBudgets[monthKey];
      const next = { ...current, monthlyBudgets: nextBudgets };
      saveJSON(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const isDark =
    settings.themeMode === 'system' ? systemScheme === 'dark' : settings.themeMode === 'dark';

  /**
   * The budget that applies to a month, in the chosen currency, and whether
   * that month overrides the default.
   */
  const getBudgetForMonth = useCallback(
    (monthKey) => {
      const custom = settings.monthlyBudgets?.[monthKey];
      const isCustom = typeof custom === 'number';
      const base = isCustom ? custom : settings.monthlyBudget;
      return { budget: convert(base, BASE_CURRENCY, settings.currency), isCustom };
    },
    [settings.monthlyBudgets, settings.monthlyBudget, settings.currency]
  );

  /** The default budget, in the chosen currency. */
  const defaultBudget = convert(settings.monthlyBudget, BASE_CURRENCY, settings.currency);

  const value = useMemo(
    () => ({
      ...settings,
      loading,
      isDark,
      theme: isDark ? darkTheme : lightTheme,
      updateSetting,
      defaultBudget,
      getBudgetForMonth,
      setBudgetForMonth,
      setDefaultBudget,
      clearBudgetForMonth,
    }),
    [
      settings,
      loading,
      isDark,
      updateSetting,
      defaultBudget,
      getBudgetForMonth,
      setBudgetForMonth,
      setDefaultBudget,
      clearBudgetForMonth,
    ]
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
