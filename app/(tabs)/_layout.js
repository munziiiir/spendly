import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';
import { Platform, StyleSheet } from 'react-native';

import { useSettings } from '../../src/context/SettingsContext';

/**
 * Bottom tab navigator — the app's three browsing sections.
 *
 * Sits inside the root Stack, so opening an expense or the Add form pushes a
 * stack screen on top of the tabs rather than replacing them. Adding an
 * expense is an action, not a place, so its button lives on the Expenses
 * screen instead of in this bar.
 *
 * No tab draws a header. Each screen renders its own large title inside its
 * scrolling content, the way iOS does, and a compact title fades in over it
 * once the large one has scrolled away. A header supplied by the navigator
 * would sit above that and give the screen two titles.
 */
export default function TabsLayout() {
  const { theme } = useSettings();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.brand,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.separator,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
        // 10pt medium is the iOS tab label. The default is larger and heavier,
        // which is what makes a React Native tab bar recognisable as one.
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
        tabBarItemStyle: Platform.select({
          ios: { paddingTop: 4 },
          default: {},
        }),
        sceneStyle: { backgroundColor: theme.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Expenses',
          // The filled glyph marks the selected tab and the outline marks the
          // rest, which is how every iOS tab bar reads.
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'list' : 'list-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'pie-chart' : 'pie-chart-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
