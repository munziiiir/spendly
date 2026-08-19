import { useRouter } from 'expo-router';

import ExpenseForm from '../../src/components/ExpenseForm';
import ScreenContainer from '../../src/components/ScreenContainer';
import { useExpenses } from '../../src/context/ExpensesContext';

/**
 * Add screen — a stack route that opens as a modal from the Add expense button
 * on the Expenses tab.
 *
 * It sits outside the (tabs) group on purpose. A modal that belongs to the
 * root stack covers the tab bar, which is what makes adding an expense feel
 * like an action rather than a fourth place to browse.
 *
 * The path is /expense/new, next to /expense/[id] for edit.
 */
export default function AddExpenseScreen() {
  const router = useRouter();
  const { addExpense } = useExpenses();

  function handleSubmit(draft) {
    addExpense(draft);
    router.back();
  }

  return (
    <ScreenContainer edges={[]} elevated>
      <ExpenseForm
        title="New Expense"
        actionLabel="Add"
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </ScreenContainer>
  );
}
