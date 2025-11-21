import Config from 'react-native-config';
import { useAuth } from '../state/auth';

type MessageHandler = (payload: any) => void;

function toWsBase(url?: string): string {
  const base = (url || '').trim().replace(/\/$/, '');
  if (!base) return '';
  if (base.startsWith('https://')) return 'wss://' + base.slice('https://'.length);
  if (base.startsWith('http://')) return 'ws://' + base.slice('http://'.length);
  // If a raw host is provided, assume ws://
  return base.startsWith('ws') ? base : `ws://${base}`;
}

function buildUrl(path: string, params: Record<string, string | number | undefined>): string {
  const wsBase = toWsBase(Config.BASE_URL);
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return `${wsBase}${path}${q ? `?${q}` : ''}`;
}

export function createSocket(fullUrl: string) {
  let ws: WebSocket | null = null;
  const listeners = new Set<MessageHandler>();

  const connect = () => {
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;
    ws = new WebSocket(fullUrl);
    ws.onopen = () => {
      // noop
    };
    ws.onmessage = (ev) => {
      let payload: any = ev.data;
      try {
        payload = JSON.parse(ev.data);
      } catch {
        payload = { type: 'message', content: ev.data };
      }
      // If content itself is JSON, parse for convenience
      if (payload && typeof payload.content === 'string') {
        try {
          const inner = JSON.parse(payload.content);
          payload.content = inner;
        } catch {
          // keep as string
        }
      }
      for (const fn of listeners) fn(payload);
    };
    ws.onerror = () => {
      // allow UI to surface errors via messages if desired
    };
    ws.onclose = () => {
      // noop; caller may choose to reconnect
    };
  };

  const disconnect = () => {
    if (ws) {
      try { ws.close(); } catch {}
      ws = null;
    }
  };

  const sendJSON = (obj: any) => {
    const s = ws;
    if (!s || s.readyState !== WebSocket.OPEN) return false;
    try {
      const text = JSON.stringify(obj);
      s.send(text);
      return true;
    } catch {
      return false;
    }
  };

  const onMessage = (handler: MessageHandler) => {
    listeners.add(handler);
    return () => listeners.delete(handler);
  };

  return { connect, disconnect, sendJSON, onMessage };
}

export function createLobbySocket() {
  const token = useAuth.getState().token;
  const url = buildUrl('/ws/lobby', { token });
  return createSocket(url);
}

export function createDMSocket(peerId: string) {
  const token = useAuth.getState().token;
  const url = buildUrl('/ws/dm', { token, peer: peerId });
  return createSocket(url);
}