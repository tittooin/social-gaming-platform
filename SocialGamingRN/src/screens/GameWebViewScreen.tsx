import React, { useEffect, useMemo, useState } from 'react';
import { View, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import Config from 'react-native-config';
import { useAuth } from '../state/auth';
import { startMatch, endMatch } from '../api/endpoints';
import { useRoute } from '@react-navigation/native';

export default function GameWebViewScreen() {
  const token = useAuth((s) => s.token);
  const route = useRoute<any>();
  const [matchId, setMatchId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await startMatch();
        setMatchId(res.matchId);
      } catch (e) {
        Alert.alert('Match', 'Failed to start match');
      }
    };
    init();
  }, []);

  const url = useMemo(() => {
    const base = Config.BASE_URL?.replace(/\/$/, '') || '';
    const paramUrl: string | undefined = route?.params?.url;
    const gameUrl = paramUrl || `${base}/games/sample`;
    const q: Record<string, string> = {};
    if (token) q.token = token;
    if (matchId) q.matchId = matchId;
    const qs = Object.keys(q)
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(q[k])}`)
      .join('&');
    return qs ? `${gameUrl}?${qs}` : gameUrl;
  }, [token, matchId, route?.params?.url]);

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: url }}
        onMessage={async (e) => {
          try {
            const msg = JSON.parse(e.nativeEvent.data);
            if (msg?.event === 'gameFinished' && matchId) {
              const winner = msg?.winner || 'unknown';
              const score = typeof msg?.score === 'number' ? msg.score : undefined;
              const rewards = typeof msg?.rewards === 'number' ? msg.rewards : 0;
              const result = await endMatch(matchId, { winner, score, rewards });
              Alert.alert('Match Result', `Winner: ${winner}\nScore: ${score ?? '-'}\nReward: ${result.reward}`);
            }
          } catch (err) {
            // Fallback for non-JSON messages
            console.log('WebView message:', e.nativeEvent.data);
          }
        }}
      />
    </View>
  );
}