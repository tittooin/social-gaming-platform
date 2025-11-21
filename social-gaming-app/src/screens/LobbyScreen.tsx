import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../api/client';

type LobbyMessage = {
  id: string; // local id
  userId: string | number;
  content: string;
};

export default function LobbyScreen() {
  const [messages, setMessages] = useState<LobbyMessage[]>([]);
  const [input, setInput] = useState('');
  const [userId, setUserId] = useState<string | number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let cancelled = false;
    const connect = async () => {
      const token = (await AsyncStorage.getItem('auth_token')) || '';
      const userRaw = await AsyncStorage.getItem('auth_user');
      try {
        if (userRaw) {
          const user = JSON.parse(userRaw);
          if (!cancelled) setUserId(user?.id ?? null);
        }
      } catch {}
      const WS_BASE = API_BASE.replace(/^http/, 'ws');
      const url = `${WS_BASE}/ws/lobby?token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        // Optionally, send a hello message or fetch history from REST if desired
      };
      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          if (data?.type === 'message') {
            const msg: LobbyMessage = {
              id: `${Date.now()}-${Math.random()}`,
              userId: data.userId,
              content: String(data.content || ''),
            };
            setMessages((prev) => [msg, ...prev]);
          }
        } catch {
          // If server ever sends plain text, still show it
          const msg: LobbyMessage = {
            id: `${Date.now()}-${Math.random()}`,
            userId: 'unknown',
            content: String(ev.data || ''),
          };
          setMessages((prev) => [msg, ...prev]);
        }
      };
      ws.onclose = () => {
        wsRef.current = null;
      };
      ws.onerror = () => {
        // Keep simple; could add retry logic
      };
    };
    connect();
    return () => {
      cancelled = true;
      if (wsRef.current) {
        try { wsRef.current.close(); } catch {}
        wsRef.current = null;
      }
    };
  }, []);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const ws = wsRef.current;
    if (ws && (ws as any).readyState === 1) {
      ws.send(text);
      // Optimistically add own message
      setMessages((prev) => [{ id: `${Date.now()}-local`, userId: userId ?? 'me', content: text }, ...prev]);
      setInput('');
    }
  };

  const renderItem = ({ item }: { item: LobbyMessage }) => (
    <View style={styles.msgRow}>
      <Text style={[styles.msgUser, item.userId === userId ? styles.me : undefined]}>
        {item.userId === userId ? 'You' : `User ${item.userId}`}
      </Text>
      <Text style={styles.msgContent}>{item.content}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Global Lobby</Text>
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderItem}
        inverted
        contentContainerStyle={{ paddingBottom: 12 }}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message"
          returnKeyType="send"
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  msgRow: { paddingVertical: 8 },
  msgUser: { fontSize: 12, color: '#6b7280' },
  me: { color: '#2563eb' },
  msgContent: { fontSize: 16, color: '#111827' },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sendBtn: { marginLeft: 8, backgroundColor: '#111827', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  sendText: { color: 'white', fontWeight: '600' },
});