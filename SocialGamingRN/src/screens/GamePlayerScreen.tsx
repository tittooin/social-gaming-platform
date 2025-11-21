import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Alert, ActivityIndicator, Button } from 'react-native';
import { WebView } from 'react-native-webview';
import Config from 'react-native-config';
import { useAuth } from '../state/auth';
import { startMatch, endMatch, fetchWallet } from '../api/endpoints';
import { useRoute, useNavigation } from '@react-navigation/native';

type Props = { gameUrl?: string; gameId?: string };

export default function GamePlayerScreen(props: Props) {
  const token = useAuth((s) => s.token);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [matchId, setMatchId] = useState<string | null>(null);
  const [webError, setWebError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [fallbackTried, setFallbackTried] = useState<boolean>(false);
  const webRef = useRef<WebView>(null);

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
    const paramUrl: string | undefined = route?.params?.gameUrl;
    const paramId: string | undefined = route?.params?.gameId;
    const provided = props.gameUrl || paramUrl;
    const id = props.gameId || paramId;
    // Preferred external domain, configurable via env
    const externalHost = (Config.EXTERNAL_HOST_GAMES || 'https://tittoos.games').replace(/\/$/, '');
    const resolved = id
      ? `${externalHost}/${encodeURIComponent(id)}/index.html`
      : provided || `${base}/games/sample`;
    const q: Record<string, string> = {};
    if (token) q.token = token;
    if (matchId) q.matchId = matchId;
    const qs = Object.keys(q)
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(q[k])}`)
      .join('&');
    const full = qs ? `${resolved}?${qs}` : resolved;
    setCurrentUrl(full);
    return full;
  }, [token, matchId, route?.params?.gameUrl, route?.params?.gameId, props.gameUrl, props.gameId]);

  const injectedJS = `
    (function(){
      try {
        window.gameBridge = {
          finishGame: function(winner, rewards){
            var payload = { event: 'gameFinished', winner: winner || 'unknown', rewards: rewards || 0 };
            window.ReactNativeWebView.postMessage(JSON.stringify(payload));
          }
        };
      } catch (e) {}
      true;
    })();
  `;

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webRef}
        source={{ uri: currentUrl || url }}
        injectedJavaScriptBeforeContentLoaded={matchId ? `window.__MATCH_ID = '${matchId}'; true;` : undefined}
        injectedJavaScript={injectedJS}
        startInLoadingState
        renderLoading={() => (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" />
          </View>
        )}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        allowsFullscreenVideo
        cacheEnabled
        onError={(e) => {
          setWebError(e.nativeEvent?.description || 'Unknown error');
          // Try local fallback once when external fails
          const base = Config.BASE_URL?.replace(/\/$/, '') || '';
          const id: string | undefined = props.gameId || route?.params?.gameId;
          if (id && !fallbackTried) {
            setFallbackTried(true);
            const localUrl = `${base}/games/${encodeURIComponent(id)}`;
            const qs: string[] = [];
            if (token) qs.push(`token=${encodeURIComponent(token)}`);
            if (matchId) qs.push(`matchId=${encodeURIComponent(matchId)}`);
            setCurrentUrl(qs.length ? `${localUrl}?${qs.join('&')}` : localUrl);
          } else {
            Alert.alert('Game Load Error', 'Failed to load game URL. Please try another game.');
          }
        }}
        onHttpError={(e) => {
          setWebError(`HTTP ${e.nativeEvent.statusCode}`);
          const base = Config.BASE_URL?.replace(/\/$/, '') || '';
          const id: string | undefined = props.gameId || route?.params?.gameId;
          if (id && !fallbackTried) {
            setFallbackTried(true);
            const localUrl = `${base}/games/${encodeURIComponent(id)}`;
            const qs: string[] = [];
            if (token) qs.push(`token=${encodeURIComponent(token)}`);
            if (matchId) qs.push(`matchId=${encodeURIComponent(matchId)}`);
            setCurrentUrl(qs.length ? `${localUrl}?${qs.join('&')}` : localUrl);
          } else {
            Alert.alert('Game Load Error', `HTTP ${e.nativeEvent.statusCode}. The game may be unavailable.`);
          }
        }}
        onMessage={async (e) => {
          try {
            const msg = JSON.parse(e.nativeEvent.data);
            // Expect: { event: 'gameFinished', winner, score, rewards }
            if (msg?.event === 'gameFinished' && matchId) {
              const winner = msg?.winner || 'unknown';
              const score = typeof msg?.score === 'number' ? msg.score : undefined;
              const rewards = typeof msg?.rewards === 'number' ? msg.rewards : 0;
              const result = await endMatch(matchId, { winner, score, rewards });
              try { await fetchWallet(); } catch {}
              Alert.alert('Victory!', `Winner: ${winner}\nScore: ${score ?? '-'}\nRewards: ${result.reward}`);
              // Navigate back to Matches after showing the alert
              navigation.navigate('MainTabs', { screen: 'Matches' });
            }
          } catch (err) {
            // Fallback for non-JSON messages
            console.log('WebView message:', e.nativeEvent.data);
          }
        }}
      />
      {__DEV__ ? (
        <View style={{ position: 'absolute', right: 10, bottom: 10 }}>
          <Button
            title="Finish (Test)"
            onPress={() => {
              const js = "window.gameBridge && window.gameBridge.finishGame('player1', 90);";
              webRef.current?.injectJavaScript(js);
            }}
          />
        </View>
      ) : null}
    </View>
  );
}