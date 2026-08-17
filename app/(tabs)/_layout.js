import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';

import { useSettings } from '../../src/context/SettingsContext';

/**
 * Bottom tab navigator — the app's three browsing sections.
 *
 * Sits inside the root Stack, so opening an expense or the Add form pushes a
 * stack screen on top of the tabs rather than replacing them. Adding an
 * expense is an action, not a place, so its button lives on the Expenses
 * screen instead of in this bar.
 */
export default function TabsLayout() {
  const { theme } = useSettings();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.card },
        headerTitleStyle: { color: theme.text, fontWeight: '700' },
        headerShadowVisible: false,
        tabBarActiveTintColor: theme.brand,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
        },
        sceneStyle: { backgroundColor: theme.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Expenses',
          tabBarIcon: ({ color, size }) => <Ionicons name="list" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, size }) => <Ionicons name="pie-chart" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
