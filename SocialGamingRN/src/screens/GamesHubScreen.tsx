import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getGames, GameItem } from '../api/endpoints';

export default function GamesHubScreen() {
  const nav = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState<GameItem[]>([]);
  const [category, setCategory] = useState<string>('all');

  const categories = ['all', 'board', 'cards', 'puzzle', 'arcade', 'sports'];
  const filtered = useMemo(() => {
    if (category === 'all') return games;
    return games.filter((g) => (g.category || 'unknown') === category);
  }, [games, category]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const list = await getGames();
        if (mounted) setGames(list);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: '600' }}>Games Hub</Text>
      {/* Category Filters */}
      <View style={{ flexDirection: 'row', marginTop: 8, flexWrap: 'wrap' }}>
        {categories.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => setCategory(c)}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: category === c ? '#333' : '#ddd',
              backgroundColor: category === c ? '#eee' : '#fff',
              marginRight: 8,
              marginTop: 8,
            }}
          >
            <Text style={{ fontWeight: category === c ? '700' : '400' }}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(g) => g.key}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => item.url ? nav.navigate('GamePlayer', { gameUrl: item.url }) : null}
              style={{ width: '48%', padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginTop: 12, opacity: item.url ? 1 : 0.6 }}
            >
              <Text style={{ fontSize: 32 }}>{item.icon || '🎮'}</Text>
              <Text style={{ marginTop: 6, fontWeight: '600' }}>{item.name}</Text>
              {item.category ? (
                <Text style={{ marginTop: 4, color: '#666' }}>{item.category}</Text>
              ) : null}
              {!item.url ? (
                <Text style={{ marginTop: 6, color: '#cc0000' }}>Unavailable</Text>
              ) : null}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}