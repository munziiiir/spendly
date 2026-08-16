import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import ExpenseForm from '../../src/components/ExpenseForm';
import ScreenContainer from '../../src/components/ScreenContainer';
import { useExpenses } from '../../src/context/ExpensesContext';

/** Add tab — records a new expense and sends the user back to the list. */
export default function AddScreen() {
  const router = useRouter();
  const { addExpense } = useExpenses();

  function handleSubmit(draft) {
    addExpense(draft);
    Alert.alert('Saved', 'Your expense has been added.', [
      { text: 'Add another', style: 'cancel' },
      { text: 'View list', onPress: () => router.push('/') },
    ]);
  }

  return (
    <ScreenContainer edges={[]}>
      <ExpenseForm submitLabel="Save expense" onSubmit={handleSubmit} />
    </ScreenContainer>
  );
}
