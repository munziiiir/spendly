import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ExpensesProvider } from '../src/context/ExpensesContext';
import { SettingsProvider, useSettings } from '../src/context/SettingsContext';

/**
 * Root layout.
 *
 * Providers are mounted here so that every screen in the app — tabs and stack
 * alike — reads from the same expense and settings state.
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <ExpensesProvider>
            <RootNavigator />
          </ExpensesProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/** Separate component so it can read the theme from SettingsProvider above. */
function RootNavigator() {
  const { theme, isDark } = useSettings();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.card },
          headerTitleStyle: { color: theme.text },
          headerTintColor: theme.brand,
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="expense/new"
          options={{ title: 'Add Expense', presentation: 'modal' }}
        />
        <Stack.Screen
          name="expense/[id]"
          options={{ title: 'Edit Expense', presentation: 'modal' }}
        />
      </Stack>
    </>
  );
}
