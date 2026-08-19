import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';

import FloatingTabBar from '../../src/components/FloatingTabBar';
import { useSettings } from '../../src/context/SettingsContext';

/**
 * Bottom tab navigator — the app's three browsing sections.
 *
 * Sits inside the root Stack, so opening an expense or the Add form pushes a
 * stack screen on top of the tabs rather than replacing them. Adding an
 * expense is an action, not a place, so its button lives on the Expenses
 * screen instead of in this bar.
 *
 * The bar itself is drawn by `FloatingTabBar`: an island of Liquid Glass that
 * floats over the screens, the way iOS 26 draws one. Because it floats, it
 * takes no space in the layout, and each screen leaves room for it at the
 * foot of its content with `useTabBarSpace()`.
 *
 * No tab draws a header. Each screen renders its own large title inside its
 * scrolling content, and a compact title fades in over it once the large one
 * has scrolled away.
 */
export default function TabsLayout() {
  const { theme } = useSettings();

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
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
