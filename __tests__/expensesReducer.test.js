import { expensesReducer, initialExpensesState } from '../src/context/expensesReducer';

/**
 * Unit tests for the expense reducer.
 *
 * The reducer is the one piece of logic that every screen depends on, and it
 * is pure, so it can be tested without a renderer or a storage mock.
 */

/** Small helper so each test only states the fields it cares about. */
function makeExpense(overrides = {}) {
  return {
    id: 'a1',
    createdAt: 1000,
    amount: 10,
    note: '',
    category: 'food',
    date: '2026-08-10',
    ...overrides,
  };
}

const loaded = (items) => ({ items, loading: false, error: null });

describe('expensesReducer', () => {
  it('returns the same state for an unknown action', () => {
    const state = loaded([makeExpense()]);
    expect(expensesReducer(state, { type: 'NOT_A_REAL_ACTION' })).toBe(state);
  });

  it('hydrates newest first and clears the loading flag', () => {
    const older = makeExpense({ id: 'old', date: '2026-08-01' });
    const newer = makeExpense({ id: 'new', date: '2026-08-20' });

    const state = expensesReducer(initialExpensesState, {
      type: 'HYDRATE',
      payload: [older, newer],
    });

    expect(state.items.map((item) => item.id)).toEqual(['new', 'old']);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('breaks a date tie with createdAt, newest first', () => {
    const first = makeExpense({ id: 'first', createdAt: 1 });
    const second = makeExpense({ id: 'second', createdAt: 2 });

    const state = expensesReducer(initialExpensesState, {
      type: 'HYDRATE',
      payload: [first, second],
    });

    expect(state.items.map((item) => item.id)).toEqual(['second', 'first']);
  });

  it('adds an expense and keeps the list sorted', () => {
    const existing = makeExpense({ id: 'existing', date: '2026-08-05' });
    const added = makeExpense({ id: 'added', date: '2026-08-25' });

    const state = expensesReducer(loaded([existing]), { type: 'ADD', payload: added });

    expect(state.items).toHaveLength(2);
    expect(state.items[0].id).toBe('added');
  });

  it('updates only the expense with the matching id', () => {
    const target = makeExpense({ id: 'target', amount: 10 });
    const other = makeExpense({ id: 'other', amount: 99, date: '2026-08-09' });

    const state = expensesReducer(loaded([target, other]), {
      type: 'UPDATE',
      payload: { id: 'target', amount: 42 },
    });

    expect(state.items.find((item) => item.id === 'target').amount).toBe(42);
    expect(state.items.find((item) => item.id === 'other').amount).toBe(99);
  });

  it('keeps the untouched fields of an updated expense', () => {
    const target = makeExpense({ id: 'target', note: 'Lunch', category: 'food' });

    const state = expensesReducer(loaded([target]), {
      type: 'UPDATE',
      payload: { id: 'target', amount: 42 },
    });

    expect(state.items[0].note).toBe('Lunch');
    expect(state.items[0].category).toBe('food');
  });

  it('deletes the expense with the given id', () => {
    const keep = makeExpense({ id: 'keep' });
    const drop = makeExpense({ id: 'drop' });

    const state = expensesReducer(loaded([keep, drop]), { type: 'DELETE', payload: 'drop' });

    expect(state.items.map((item) => item.id)).toEqual(['keep']);
  });

  it('empties the list on CLEAR', () => {
    const state = expensesReducer(loaded([makeExpense(), makeExpense({ id: 'b2' })]), {
      type: 'CLEAR',
    });

    expect(state.items).toEqual([]);
  });

  it('records an error and stops loading on SET_ERROR', () => {
    const state = expensesReducer(initialExpensesState, {
      type: 'SET_ERROR',
      payload: 'Could not load your saved expenses.',
    });

    expect(state.error).toBe('Could not load your saved expenses.');
    expect(state.loading).toBe(false);
  });

  it('does not mutate the state it receives', () => {
    const items = [makeExpense()];
    const state = loaded(items);

    expensesReducer(state, { type: 'DELETE', payload: 'a1' });

    expect(state.items).toHaveLength(1);
    expect(items).toHaveLength(1);
  });
});
