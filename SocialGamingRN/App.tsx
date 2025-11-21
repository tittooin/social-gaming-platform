/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AuthGate from './src/navigation/AuthGate';
import HomeScreen from './src/screens/HomeScreen';
import FeedScreen from './src/screens/FeedScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import WalletScreen from './src/screens/WalletScreen';
import LobbyScreen from './src/screens/LobbyScreen';
import MatchesScreen from './src/screens/MatchesScreen';
import TournamentsScreen from './src/screens/TournamentsScreen';
import GamesHubScreen from './src/screens/GamesHubScreen';
import GameWebViewScreen from './src/screens/GameWebViewScreen';
import GamePlayerScreen from './src/screens/GamePlayerScreen';
import LoginScreen from './src/screens/LoginScreen';
import OTPScreen from './src/screens/OTPScreen';
import LobbyChatScreen from './src/screens/LobbyChatScreen';
import DMChatScreen from './src/screens/DMChatScreen';
import { useAuth } from './src/state/auth';
import navigationRef from './src/navigation/navigation';

export type RootStackParamList = {
  MainTabs: undefined;
  GameWebView: { url?: string } | undefined;
  GamePlayer: { gameUrl?: string } | undefined;
  Login: undefined;
  OTP: { phone?: string } | undefined;
  LobbyChat: undefined;
  DMChat: { peerId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tabs.Navigator>
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Feed" component={FeedScreen} />
      <Tabs.Screen name="Lobby" component={LobbyScreen} />
      <Tabs.Screen name="GamesHub" component={GamesHubScreen} />
      <Tabs.Screen name="Tournaments" component={TournamentsScreen} />
      <Tabs.Screen name="Matches" component={MatchesScreen} />
      <Tabs.Screen name="Wallet" component={WalletScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

export default function App() {
  const token = useAuth((s) => s.token);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer theme={DefaultTheme} ref={navigationRef}>
        <AuthGate>
          <Stack.Navigator>
            {token ? (
              <>
                <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
                <Stack.Screen name="GameWebView" component={GameWebViewScreen} options={{ title: 'Play' }} />
                <Stack.Screen name="GamePlayer" component={GamePlayerScreen} options={{ title: 'Game Player' }} />
                <Stack.Screen name="LobbyChat" component={LobbyChatScreen} options={{ title: 'Lobby Chat' }} />
                <Stack.Screen name="DMChat" component={DMChatScreen} options={{ title: 'Direct Message' }} />
              </>
            ) : (
              <>
                <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
                <Stack.Screen name="OTP" component={OTPScreen} options={{ title: 'OTP' }} />
              </>
            )}
          </Stack.Navigator>
        </AuthGate>
      </NavigationContainer>
    </>
  );
}
