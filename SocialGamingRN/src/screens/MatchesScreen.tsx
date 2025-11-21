import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Config from 'react-native-config';
import { listMatches, MatchListItem } from '../api/endpoints';

export default function MatchesScreen() {
  const navigation = useNavigation<any>();
  const base = (Config.BASE_URL || '').replace(/\/$/, '');
  const sampleUrl = `${base}/games/ludo`;
  const [peerId, setPeerId] = useState('');
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<MatchListItem[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const items = await listMatches();
      if (mounted) {
        // If backend not ready, use demo items
        if (!items || items.length === 0) {
          setMatches([
            { id: 'match-1001', opponent_id: 'user-2001' },
            { id: 'match-1002', opponent_id: 'user-2002' },
            { id: 'match-1003', opponent_id: 'user-2003' },
          ]);
        } else {
          setMatches(items);
        }
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      (async () => {
        const items = await listMatches();
        if (mounted) setMatches(items || []);
      })();
      return () => { mounted = false; };
    }, [])
  );

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ marginBottom: 8, fontWeight: '600' }}>Matches</Text>
      <Button title="Replay Sample Game" onPress={() => navigation.navigate('GameWebView', { url: sampleUrl })} />

      <View style={{ height: 8 }} />
      <Text style={{ fontWeight: '600', marginBottom: 4 }}>Quick Play</Text>
      <View style={{ gap: 8 }}>
        <Button title="Ludo" onPress={() => navigation.navigate('GamePlayer', { gameId: 'ludo' })} />
        <Button title="Dice Duel" onPress={() => navigation.navigate('GamePlayer', { gameId: 'dice-duel' })} />
        <Button title="Carrom" onPress={() => navigation.navigate('GamePlayer', { gameId: 'carrom' })} />
        <Button title="Chess" onPress={() => navigation.navigate('GamePlayer', { gameId: 'chess' })} />
        <Button title="Checkers" onPress={() => navigation.navigate('GamePlayer', { gameId: 'checkers' })} />
        <Button title="TicTacToe" onPress={() => navigation.navigate('GamePlayer', { gameId: 'tic-tac-toe' })} />
        <Button title="Solitaire" onPress={() => navigation.navigate('GamePlayer', { gameId: 'solitaire' })} />
        <Button title="Snake Classic" onPress={() => navigation.navigate('GamePlayer', { gameId: 'snake' })} />
        <Button title="Bubble Shooter" onPress={() => navigation.navigate('GamePlayer', { gameId: 'bubble-shooter' })} />
        <Button title="2048" onPress={() => navigation.navigate('GamePlayer', { gameId: '2048' })} />
        <Button title="Rummy" onPress={() => navigation.navigate('GamePlayer', { gameId: 'rummy' })} />
        <Button title="Teen Patti" onPress={() => navigation.navigate('GamePlayer', { gameId: 'teen-patti' })} />
        <Button title="Poker" onPress={() => navigation.navigate('GamePlayer', { gameId: 'poker' })} />
        <Button title="Callbreak" onPress={() => navigation.navigate('GamePlayer', { gameId: 'callbreak' })} />
        <Button title="Sapsidy" onPress={() => navigation.navigate('GamePlayer', { gameId: 'sapsidy' })} />
        <Button title="Blackjack" onPress={() => navigation.navigate('GamePlayer', { gameId: 'blackjack' })} />
        <Button title="Baccarat" onPress={() => navigation.navigate('GamePlayer', { gameId: 'baccarat' })} />
        <Button title="Roulette" onPress={() => navigation.navigate('GamePlayer', { gameId: 'roulette' })} />
        <Button title="Andar Bahar" onPress={() => navigation.navigate('GamePlayer', { gameId: 'andar-bahar' })} />
        <Button title="Word Swipe" onPress={() => navigation.navigate('GamePlayer', { gameId: 'word-swipe' })} />
        <Button title="Word Connect" onPress={() => navigation.navigate('GamePlayer', { gameId: 'word-connect' })} />
      </View>

      <View style={{ height: 16 }} />
      <Text style={{ marginBottom: 8, fontWeight: '600' }}>Start DM from Matches</Text>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const opponentId = item.opponent_id;
            return (
              <View style={{ padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 8 }}>
                <Text style={{ fontWeight: '600' }}>Match #{item.id}</Text>
                <Text style={{ marginTop: 4 }}>Opponent: {opponentId || 'Unknown'}</Text>
                <View style={{ marginTop: 8 }}>
                  <Button
                    title="Start DM"
                    onPress={() => opponentId && navigation.navigate('DMChat', { peerId: opponentId })}
                    disabled={!opponentId}
                  />
                </View>
              </View>
            );
          }}
        />
      )}

      <View style={{ height: 8 }} />
      <Text style={{ fontWeight: '600' }}>Quick DM</Text>
      <TextInput
        placeholder="Peer user ID"
        value={peerId}
        onChangeText={setPeerId}
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginTop: 8 }}
      />
      <View style={{ marginTop: 8 }}>
        <Button title="Start DM" onPress={() => navigation.navigate('DMChat', { peerId })} />
      </View>
    </View>
  );
}