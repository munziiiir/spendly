import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import EmptyState from '../../src/components/EmptyState';
import ExpenseForm from '../../src/components/ExpenseForm';
import ScreenContainer from '../../src/components/ScreenContainer';
import { useExpenses } from '../../src/context/ExpensesContext';
import { useTheme } from '../../src/context/SettingsContext';
import { spacing } from '../../src/theme';
import { haptics } from '../../src/utils/haptics';

/**
 * Edit screen — a dynamic route pushed on top of the tabs as a modal.
 *
 * The last known copy of the expense is held in a ref. Without it, a delete
 * would empty the list and flash "Expense not found" for the frame between the
 * delete and the screen closing.
 */
export default function EditExpenseScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const { getExpense, updateExpense, deleteExpense, loading } = useExpenses();

  const found = getExpense(String(id));
  const lastKnown = useRef(found);
  useEffect(() => {
    if (found) lastKnown.current = found;
  }, [found]);

  const expense = found || lastKnown.current;

  // Expenses hydrate from storage after the first render, so a deep link into
  // this screen must wait rather than report the expense as missing.
  if (loading) {
    return (
      <View style={[styles.centre, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.brand} />
      </View>
    );
  }

  if (!expense) {
    return (
      <ScreenContainer edges={[]}>
        <EmptyState
          icon="help-circle-outline"
          title="Expense not found"
          message="This expense may have been deleted. Go back to see your current list."
        />
      </ScreenContainer>
    );
  }

  function handleSubmit(draft) {
    updateExpense({ ...expense, ...draft });
    router.back();
  }

  function handleDelete() {
    Alert.alert('Delete this expense?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          haptics.deleted();
          deleteExpense(expense.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <ScreenContainer edges={[]}>
      <ExpenseForm
        initialValue={expense}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
});
