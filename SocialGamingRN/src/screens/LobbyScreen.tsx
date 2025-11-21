import React from 'react';
import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Config from 'react-native-config';

export default function LobbyScreen() {
  const navigation = useNavigation<any>();
  const base = (Config.BASE_URL || '').replace(/\/$/, '');
  const sampleUrl = `${base}/games/sample`;
  const ludoUrl = 'https://domain.com/games/ludo/index.html';

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ marginBottom: 16 }}>Game Lobby</Text>
      <Button title="Open Sample Game" onPress={() => navigation.navigate('GameWebView', { url: sampleUrl })} />
      <View style={{ height: 12 }} />
      <Button title="Play Ludo" onPress={() => navigation.navigate('GamePlayer', { gameUrl: ludoUrl })} />
      <View style={{ height: 12 }} />
      <Button title="Browse All Games" onPress={() => navigation.navigate('MainTabs', { screen: 'GamesHub' })} />
      <View style={{ height: 12 }} />
      <Button title="Open Lobby Chat" onPress={() => navigation.navigate('LobbyChat')} />
    </View>
  );
}