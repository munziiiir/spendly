/**
 * Pure reducer for the expense list.
 *
 * Kept in its own file with no React or AsyncStorage imports so that it can be
 * unit tested directly (see __tests__/expensesReducer.test.js).
 */

export const initialExpensesState = {
  items: [],
  loading: true,
  error: null,
};

/** Newest first, so the Home list never has to sort on every render. */
function byDateDesc(a, b) {
  if (a.date === b.date) return b.createdAt - a.createdAt;
  return a.date < b.date ? 1 : -1;
}

export function expensesReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return {
        items: [...action.payload].sort(byDateDesc),
        loading: false,
        error: null,
      };

    case 'ADD':
      return {
        ...state,
        items: [action.payload, ...state.items].sort(byDateDesc),
        error: null,
      };

    case 'UPDATE':
      return {
        ...state,
        items: state.items
          .map((item) =>
            item.id === action.payload.id ? { ...item, ...action.payload } : item
          )
          .sort(byDateDesc),
        error: null,
      };

    case 'DELETE':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
        error: null,
      };

    case 'CLEAR':
      return { ...state, items: [], error: null };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    default:
      return state;
  }
}
