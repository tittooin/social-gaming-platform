import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API_BASE } from '../api/client';

export default function PlayScreen() {
  const navigation = useNavigation<any>();
  const games = [
    { key: 'ludo', title: 'Ludo (Web)', url: `${API_BASE}/games/ludo/index.html` },
    { key: 'cards', title: 'Cards (Web)', url: `${API_BASE}/games/cards/index.html` },
  ];

  const openGame = (game: { url: string; title: string }) => {
    navigation.navigate('GameWebView', { url: game.url, title: game.title });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Play</Text>
      <FlatList
        data={games}
        keyExtractor={(g) => g.key}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => openGame(item)}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSub}>Tap to launch</Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={{ paddingTop: 8 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  card: { padding: 16, backgroundColor: '#f9fafb', borderRadius: 12 },
  cardTitle: { fontSize: 18, fontWeight: '600' },
  cardSub: { marginTop: 4, fontSize: 12, color: '#6b7280' },
});