import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import FeedScreen from './src/screens/FeedScreen';
import PlayScreen from './src/screens/PlayScreen';
import WalletScreen from './src/screens/WalletScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PlayersScreen from './src/screens/PlayersScreen';
import LobbyScreen from './src/screens/LobbyScreen';
import GameWebViewScreen from './src/screens/GameWebViewScreen';
import { setTokenInMemory } from './src/api/client';

export type AuthStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  GameWebView: { url: string; title?: string } | undefined;
};

export type MainTabParamList = {
  Feed: undefined;
  Play: undefined;
  Wallet: undefined;
  Profile: undefined;
  Players?: undefined;
  Lobby?: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tabs.Navigator>
      <Tabs.Screen name="Feed" component={FeedScreen} />
      <Tabs.Screen name="Play" component={PlayScreen} />
      <Tabs.Screen name="Wallet" component={WalletScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
      <Tabs.Screen name="Players" component={PlayersScreen} />
      <Tabs.Screen name="Lobby" component={LobbyScreen} />
    </Tabs.Navigator>
  );
}

export default function App() {
  const theme = {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, background: '#fff' },
  };

  // Deep link config
  const linking = {
    prefixes: [Linking.createURL('/')],
    config: {
      screens: {
        Login: 'login',
        MainTabs: {
          screens: {
            Feed: 'feed',
            Play: 'play',
            Wallet: 'wallet',
            Profile: 'profile',
            Players: 'players',
            Lobby: 'lobby',
          },
        },
        GameWebView: 'game',
      },
    },
  } as const;

  // Persistent auth gate
  const [booting, setBooting] = useState(true);
  const [initialRoute, setInitialRoute] = useState<'Login' | 'MainTabs'>('Login');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          setTokenInMemory(token);
          if (mounted) setInitialRoute('MainTabs');
        }
      } finally {
        if (mounted) setBooting(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (booting) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>Social Gaming</Text>
      </View>
    );
  }

  return (
    <NavigationContainer theme={theme} linking={linking as any}>
      <StatusBar style="dark" />
      {/* Simple gate: start with Auth stack, then show tabs. Replace with real auth later. */}
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs as any} />
        <Stack.Screen name="GameWebView" component={GameWebViewScreen} options={{ headerShown: true, title: 'Game' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
