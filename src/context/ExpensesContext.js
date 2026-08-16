import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';

import { expensesReducer, initialExpensesState } from './expensesReducer';
import { loadJSON, saveJSON } from '../utils/storage';
import { toMonthKey } from '../utils/format';

const STORAGE_KEY = '@spendly/expenses';

const ExpensesContext = createContext(null);

/**
 * Holds every expense in memory and mirrors it to AsyncStorage.
 *
 * The list is loaded once on mount and written back after any change, which is
 * what makes the app work offline and survive a restart.
 */
export function ExpensesProvider({ children }) {
  const [state, dispatch] = useReducer(expensesReducer, initialExpensesState);

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
      dispatch({ type: 'HYDRATE', payload: safe });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Write back on every change, but not during the initial load.
  useEffect(() => {
    if (state.loading) return;
    saveJSON(STORAGE_KEY, state.items).then((result) => {
      if (!result.ok) {
        dispatch({ type: 'SET_ERROR', payload: 'Could not save to this device.' });
      }
    });
  }, [state.items, state.loading]);

  const addExpense = useCallback((draft) => {
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
    dispatch({ type: 'UPDATE', payload: expense });
  }, []);

  const deleteExpense = useCallback((id) => {
    dispatch({ type: 'DELETE', payload: id });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const getExpense = useCallback(
    (id) => state.items.find((item) => item.id === id),
    [state.items]
  );

  /** Totals per month, e.g. { "2026-08": 214.5 } */
  const monthlyTotals = useMemo(() => {
    return state.items.reduce((totals, item) => {
      const key = toMonthKey(item.date);
      totals[key] = (totals[key] || 0) + item.amount;
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
