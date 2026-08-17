import { useRouter } from 'expo-router';

import ExpenseForm from '../../src/components/ExpenseForm';
import ScreenContainer from '../../src/components/ScreenContainer';
import { useExpenses } from '../../src/context/ExpensesContext';

/**
 * Add screen — a stack route that opens as a modal from the raised button of
 * the tab bar.
 *
 * It sits outside the (tabs) group on purpose. A modal that belongs to the
 * root stack covers the tab bar, which is what makes adding an expense feel
 * like an action rather than a fourth place to browse.
 *
 * The path is /expense/new, next to /expense/[id] for edit. A route named
 * /add would collide with the Add slot of the tab bar, because a group such
 * as (tabs) does not appear in the path.
 */
export default function AddExpenseScreen() {
  const router = useRouter();
  const { addExpense } = useExpenses();

  function handleSubmit(draft) {
    addExpense(draft);
    router.back();
  }

  return (
    <ScreenContainer edges={[]}>
      <ExpenseForm submitLabel="Save expense" onSubmit={handleSubmit} />
    </ScreenContainer>
  );
}
