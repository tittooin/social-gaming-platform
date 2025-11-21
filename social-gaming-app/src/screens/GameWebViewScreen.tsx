import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import { API_BASE, endMatch, startMatch } from '../api/client';
import { useRoute } from '@react-navigation/native';

type RouteParams = { url: string; title?: string };

export default function GameWebViewScreen() {
  const route = useRoute<any>();
  const { url, title } = (route?.params || {}) as RouteParams;
  const [loading, setLoading] = useState(true);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [finalUrl, setFinalUrl] = useState<string | null>(null);
  const webRef = useRef<WebView | null>(null);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const token = (await AsyncStorage.getItem('auth_token')) || '';
        const start = await startMatch();
        if (!mounted) return;
        setMatchId(start.matchId);
        const query = new URLSearchParams({ token, matchId: start.matchId }).toString();
        setFinalUrl(`${url}?${query}`);
      } catch (e) {
        Alert.alert('Error', 'Failed to start match');
      } finally {
        setLoading(false);
      }
    };
    init();
    return () => { mounted = false; };
  }, [url]);

  const onMessage = async (ev: any) => {
    try {
      const data = JSON.parse(ev?.nativeEvent?.data || '{}');
      if (data?.type === 'MATCH_END') {
        const mid = String(data?.matchId || matchId || '');
        const roll = Number(data?.clientRoll);
        if (!mid || !roll) return;
        const res = await endMatch({ matchId: mid, clientRoll: roll });
        Alert.alert('Match Result', `Server: ${res.serverRoll}\nReward: ${res.reward}`);
      }
    } catch (e) {
      // ignore parse errors
    }
  };

  if (loading || !finalUrl) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Preparing game…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={(r) => (webRef.current = r)}
        source={{ uri: finalUrl }}
        onMessage={onMessage}
        startInLoadingState
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 8, fontSize: 14 },
});