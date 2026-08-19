import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ExpensesProvider, useExpenses } from '../src/context/ExpensesContext';
import { SettingsProvider, useSettings } from '../src/context/SettingsContext';

/**
 * Hold the splash screen open until the saved expenses and settings have been
 * read back from storage.
 *
 * Both stores start empty and hydrate asynchronously, so without this the app
 * paints an empty list and a spinner for the frame or two the read takes. On a
 * phone that reads as the app having lost the user's data on launch.
 */
SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ fade: true, duration: 250 });

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
  const { theme, isDark, loading: settingsLoading } = useSettings();
  const { loading: expensesLoading } = useExpenses();
  const ready = !settingsLoading && !expensesLoading;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  // Safety net. The storage wrappers are written so they cannot throw, but a
  // splash screen that never hides would leave the app impossible to use, so
  // it comes down after a few seconds whatever the stores report.
  useEffect(() => {
    const timer = setTimeout(() => SplashScreen.hideAsync(), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {/*
        Every screen draws its own title, so no route asks for a header here.

        iOS 26 puts each navigation bar button inside a liquid glass capsule.
        That capsule is meant to float over content, and it did not agree with
        the flat header colour this app asked for — the two materials met on
        the same strip of screen and the button looked like a smudge. Rather
        than fight the system bar, the app now leaves it switched off and draws
        its own toolbar inside the sheet. One surface, one material, no seam.
      */}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="expense/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="expense/[id]" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
