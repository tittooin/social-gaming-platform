import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getTournaments, joinTournament, getLeaderboard, Tournament, LeaderboardRow } from '../api/endpoints';

export default function TournamentsScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [board, setBoard] = useState<LeaderboardRow[]>([]);
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const list = await getTournaments();
        if (mounted) setTournaments(list);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const loadLeaderboard = async (id: string) => {
    setSelectedId(id);
    const rows = await getLeaderboard(id);
    setBoard(rows);
  };

  const onJoin = async (id: string) => {
    setJoining(id);
    try {
      await joinTournament(id);
    } finally {
      setJoining(null);
    }
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: '600' }}>Tournaments</Text>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={tournaments}
          keyExtractor={(t) => t.id}
          renderItem={({ item }) => (
            <View style={{ padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginTop: 8 }}>
              <Text style={{ fontWeight: '600' }}>{item.name}</Text>
              <Text style={{ marginTop: 4 }}>Game: {item.game} • Rule: {item.rule ?? 'N/A'} • Slots: {item.slots ?? 'N/A'}</Text>
              <View style={{ marginTop: 8, flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                <Button title={joining === item.id ? 'Joining…' : 'Join'} onPress={() => onJoin(item.id)} disabled={joining === item.id} />
                <View style={{ width: 8 }} />
                <Button title="Leaderboard" onPress={() => loadLeaderboard(item.id)} />
                {item.url ? (
                  <>
                    <View style={{ width: 8 }} />
                    <Button title="Play" onPress={() => navigation.navigate('GamePlayer', { gameUrl: item.url })} />
                  </>
                ) : null}
              </View>
              {selectedId === item.id && (
                <View style={{ marginTop: 12 }}>
                  <Text style={{ fontWeight: '600' }}>Leaderboard</Text>
                  {board.length === 0 ? (
                    <Text style={{ marginTop: 6 }}>No entries</Text>
                  ) : (
                    board.map((row) => (
                      <View key={`${row.rank}-${row.user_id}`} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                        <Text>#{row.rank} {row.user_id}</Text>
                        <Text>{row.points} pts</Text>
                      </View>
                    ))
                  )}
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}