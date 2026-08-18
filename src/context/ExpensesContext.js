import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';

import { expensesReducer, initialExpensesState } from './expensesReducer';
import { convert } from '../constants/rates';
import { loadJSON, saveJSON } from '../utils/storage';
import { toMonthKey } from '../utils/format';

const STORAGE_KEY = '@spendly/expenses';

// Read only for the one-time migration below. Settings themselves belong to
// SettingsContext.
const SETTINGS_KEY = '@spendly/settings';

const ExpensesContext = createContext(null);

/**
 * Holds every expense in memory and mirrors it to AsyncStorage.
 *
 * The list is loaded once on mount and written back after any change, which is
 * what makes the app work offline and survive a restart.
 */
export function ExpensesProvider({ children }) {
  const [state, dispatch] = useReducer(expensesReducer, initialExpensesState);

  // Nothing may be written back until the saved list has been read, or until
  // the user has changed something on purpose. Without this, a failed read
  // would leave an empty list in memory and the write-back effect below would
  // save that empty list over the real one.
  const canWrite = useRef(false);

  // Load saved expenses on first render.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const result = await loadJSON(STORAGE_KEY, []);
      if (cancelled) return;

      if (!result.ok) {
        dispatch({ type: 'SET_ERROR', payload: 'Could not load your saved expenses.' });
        return;
      }
      // Guard against a hand-edited or partially written storage value.
      const safe = Array.isArray(result.value) ? result.value.filter(isValidExpense) : [];

      // Expenses saved before the app converted currencies carry no currency of
      // their own. Stamp them once with the currency the user had chosen, which
      // is the currency they were typed in. The write-back effect saves them.
      const settings = await loadJSON(SETTINGS_KEY, {});
      if (cancelled) return;
      const previousCurrency = settings.value?.currency || 'GBP';
      const stamped = safe.map((item) =>
        item.currency ? item : { ...item, currency: previousCurrency }
      );

      canWrite.current = true;
      dispatch({ type: 'HYDRATE', payload: stamped });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Write back on every change, but not during the initial load and not after
  // a failed read.
  useEffect(() => {
    if (state.loading || !canWrite.current) return;
    saveJSON(STORAGE_KEY, state.items).then((result) => {
      if (!result.ok) {
        dispatch({ type: 'SET_ERROR', payload: 'Could not save to this device.' });
      }
    });
  }, [state.items, state.loading]);

  const addExpense = useCallback((draft) => {
    canWrite.current = true;
    dispatch({
      type: 'ADD',
      payload: {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now(),
        ...draft,
      },
    });
  }, []);

  const updateExpense = useCallback((expense) => {
    canWrite.current = true;
    dispatch({ type: 'UPDATE', payload: expense });
  }, []);

  const deleteExpense = useCallback((id) => {
    canWrite.current = true;
    dispatch({ type: 'DELETE', payload: id });
  }, []);

  const clearAll = useCallback(() => {
    canWrite.current = true;
    dispatch({ type: 'CLEAR' });
  }, []);

  const getExpense = useCallback(
    (id) => state.items.find((item) => item.id === id),
    [state.items]
  );

  /**
   * Totals per month in US dollars, e.g. { "2026-08": 214.5 }.
   *
   * The list can hold expenses in several currencies, so the totals are held
   * in one base currency. A screen converts them to the currency the user has
   * chosen when it shows them.
   */
  const monthlyTotals = useMemo(() => {
    return state.items.reduce((totals, item) => {
      const key = toMonthKey(item.date);
      totals[key] = (totals[key] || 0) + convert(item.amount, item.currency || 'USD', 'USD');
      return totals;
    }, {});
  }, [state.items]);

  const value = useMemo(
    () => ({
      expenses: state.items,
      loading: state.loading,
      error: state.error,
      monthlyTotals,
      addExpense,
      updateExpense,
      deleteExpense,
      clearAll,
      getExpense,
    }),
    [state, monthlyTotals, addExpense, updateExpense, deleteExpense, clearAll, getExpense]
  );

  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>;
}

function isValidExpense(item) {
  return (
    item &&
    typeof item.id === 'string' &&
    typeof item.amount === 'number' &&
    typeof item.date === 'string'
  );
}

export function useExpenses() {
  const context = useContext(ExpensesContext);
  if (!context) throw new Error('useExpenses must be used inside an ExpensesProvider');
  return context;
}
