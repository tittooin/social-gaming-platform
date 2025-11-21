import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TextInput, Button } from 'react-native';
import { useAuth } from '../state/auth';
import { createLobbySocket } from '../lib/ws';

type ChatItem = { id: string; userId?: string; content: any; ts?: number; room?: string };

export default function LobbyChatScreen() {
  const myId = useAuth((s) => s.user?.id);
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const socketRef = useRef<ReturnType<typeof createLobbySocket> | null>(null);

  useEffect(() => {
    const sock = createLobbySocket();
    socketRef.current = sock;
    const off = sock.onMessage((payload) => {
      if (payload?.type === 'message') {
        const item: ChatItem = {
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          userId: payload.userId,
          content: payload.content,
          ts: payload.ts || Date.now(),
          room: payload.room,
        };
        setMessages((prev) => [...prev, item]);
        if (payload.userId && payload.userId === myId) {
          setSending(false);
        }
      }
    });
    sock.connect();
    return () => {
      off();
      sock.disconnect();
      socketRef.current = null;
    };
  }, []);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setSending(true);
    const ok = socketRef.current?.sendJSON({ type: 'chat', content: text, ts: Date.now() });
    if (ok) setInput('');
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isMe = item.userId === myId;
          const sender = isMe ? 'You' : item.userId || 'Unknown';
          const time = new Date(item.ts || Date.now()).toLocaleTimeString();
          return (
            <View style={{ paddingVertical: 6, flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
              {/* Avatar */}
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: isMe ? '#8ED27B' : '#B9C0C7', alignItems: 'center', justifyContent: 'center', marginHorizontal: 6 }}>
                <Text style={{ color: '#fff', fontSize: 12 }}>
                  {(isMe ? 'Y' : (item.userId ? String(item.userId).slice(-2) : '?'))}
                </Text>
              </View>
              {/* Bubble with tail */}
              <View style={{ maxWidth: '75%', position: 'relative' }}>
                <View
                  style={{
                    backgroundColor: isMe ? '#DCF8C6' : '#EEE',
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontWeight: '600' }}>{sender}</Text>
                    <Text style={{ color: '#888', fontSize: 12 }}>{time}</Text>
                  </View>
                  <Text style={{ marginTop: 4 }}>
                    {typeof item.content === 'string' ? item.content : JSON.stringify(item.content)}
                  </Text>
                </View>
                {/* Tail */}
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    [isMe ? 'right' : 'left']: -6 as any,
                    width: 0,
                    height: 0,
                    borderStyle: 'solid',
                    borderTopWidth: 6,
                    borderBottomWidth: 0,
                    borderLeftWidth: isMe ? 6 : 0,
                    borderRightWidth: isMe ? 0 : 6,
                    borderTopColor: isMe ? '#DCF8C6' : '#EEE',
                    borderLeftColor: isMe ? '#DCF8C6' : 'transparent',
                    borderRightColor: isMe ? 'transparent' : '#EEE',
                    borderBottomColor: 'transparent',
                  }}
                />
              </View>
            </View>
          );
        }}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <TextInput
          placeholder="Message the lobby"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={send}
          returnKeyType="send"
          blurOnSubmit
          editable={!sending}
          style={{ flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 }}
        />
        <Button title={sending ? 'Sending…' : 'Send'} onPress={send} disabled={sending || !input.trim()} />
      </View>
    </View>
  );
}