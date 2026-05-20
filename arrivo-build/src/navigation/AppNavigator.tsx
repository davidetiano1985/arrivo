import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { useAuth } from '../auth/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { HomeDashboard } from '../screens/HomeDashboard';
import { UsersListScreen } from '../screens/UsersListScreen';
import { UserDetailScreen } from '../screens/UserDetailScreen';
import { LocaliScreen } from '../screens/LocaliScreen';
import { LocaleDetailScreen } from '../screens/LocaleDetailScreen';
import { AlertsScreen } from '../screens/AlertsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { LoadingScreen } from '../components/LoadingScreen';
import { colors, fontSize } from '../components/theme';

import {
  RootStackParamList,
  MainTabParamList,
  UsersStackParamList,
  LocaliStackParamList,
} from '../types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const UsersStack = createNativeStackNavigator<UsersStackParamList>();
const LocaliStack = createNativeStackNavigator<LocaliStackParamList>();

const NAV_THEME = {
  dark: true,
  colors: {
    primary: colors.highlight,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.error,
  },
};

function UsersNavigator() {
  return (
    <UsersStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <UsersStack.Screen name="UsersList" component={UsersListScreen} options={{ title: 'Utenti' }} />
      <UsersStack.Screen name="UserDetail" component={UserDetailScreen} options={{ title: 'Dettaglio Utente' }} />
    </UsersStack.Navigator>
  );
}

function LocaliNavigator() {
  return (
    <LocaliStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <LocaliStack.Screen name="LocaliList" component={LocaliScreen} options={{ title: 'Locali' }} />
      <LocaliStack.Screen name="LocaleDetail" component={LocaleDetailScreen} options={{ title: 'Dettaglio Locale' }} />
    </LocaliStack.Navigator>
  );
}

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700', fontSize: fontSize.lg },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 60,
        },
        tabBarActiveTintColor: colors.highlight,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused }) => {
          const icons: Record<string, string> = {
            Dashboard: '📊',
            Users: '👥',
            Locali: '🏢',
            Alerts: '🔔',
            Settings: '⚙️',
          };
          return <TabIcon emoji={icons[route.name] ?? '●'} focused={focused} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={HomeDashboard}
        options={{ title: 'Dashboard', headerShown: false }}
      />
      <Tab.Screen
        name="Users"
        component={UsersNavigator}
        options={{ title: 'Utenti', headerShown: false }}
      />
      <Tab.Screen
        name="Locali"
        component={LocaliNavigator}
        options={{ title: 'Locali', headerShown: false }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{ title: 'Alert', headerTitle: '🔔 Alert & Sicurezza' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Impostazioni', headerTitle: '⚙️ Impostazioni' }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Verifica sessione..." />;
  }

  return (
    <NavigationContainer theme={NAV_THEME as Parameters<typeof NavigationContainer>[0]['theme']}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="Main" component={MainTabs} />
        ) : (
          <RootStack.Screen name="Login" component={LoginScreen} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
