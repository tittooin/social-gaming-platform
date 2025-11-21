import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API_BASE } from '../api/client';
import { isWeb, colors, layout, cardStyles } from '../lib/theme';

export default function PlayScreen() {
  const navigation = useNavigation<any>();
  const [games, setGames] = useState<Array<{ key: string; name: string; url: string; thumb?: string | null; bots?: boolean }>>([]);
  const [botPref, setBotPref] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetch(`${API_BASE}/games/static`);
        const data = await resp.json();
        const items = (data?.games || []).map((g: any) => ({
          key: g.key,
          name: g.name,
          url: `${API_BASE}${g.url}`,
          thumb: g.thumb ? `${API_BASE}${g.thumb}` : null,
          bots: !!g.bots,
        }));
        setGames(items);
      } catch (e) {
        console.warn('Failed loading games:', e);
      }
    };
    load();
  }, []);

  const openGame = (game: { url: string; name: string; key: string }) => {
    let targetUrl = game.url;
    if (botPref[game.key]) {
      targetUrl += targetUrl.includes('?') ? '&cpu=1' : '?cpu=1';
    }
    navigation.navigate('GameWebView', { url: targetUrl, title: game.name });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Play</Text>
      </View>
      <FlatList
        data={games}
        keyExtractor={(g) => g.key}
        numColumns={isWeb ? 3 : 1}
        columnWrapperStyle={isWeb ? { gap: 16 } : undefined}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => openGame(item)}>
            <Image
              source={item.thumb ? { uri: item.thumb } : require('../../assets/icon.png')}
              style={styles.thumb}
              resizeMode="cover"
            />
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSub}>Tap to launch</Text>
            {item.bots ? (
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Play vs Bot</Text>
                <Switch
                  value={!!botPref[item.key]}
                  onValueChange={(v) => setBotPref((prev) => ({ ...prev, [item.key]: v }))}
                  trackColor={{ false: '#93c5fd', true: colors.accentGreen }}
                  thumbColor={botPref[item.key] ? '#fff' : '#fff'}
                />
              </View>
            ) : null}
            <View style={styles.actionBtn}><Text style={styles.actionText}>Start</Text></View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        contentContainerStyle={{ paddingTop: 8 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: layout.padding, alignSelf: 'stretch' },
  headerRow: { maxWidth: layout.maxWidth, alignSelf: 'center', width: '100%' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: colors.primaryBlue },
  card: { ...cardStyles.container, flex: 1 },
  thumb: { width: '100%', height: 120, borderRadius: 8, marginBottom: 8, backgroundColor: colors.cardBg },
  cardTitle: { ...cardStyles.title },
  cardSub: { ...cardStyles.sub },
  toggleRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleLabel: { color: colors.text, fontSize: 12, fontWeight: '600' },
  actionBtn: { ...cardStyles.action, alignSelf: 'flex-start' },
  actionText: { ...cardStyles.actionText },
});