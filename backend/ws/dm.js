import WebSocket, { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { pool } from '../db/index.js';

export function initDMWSS(server) {
  const wss = new WebSocketServer({ server, path: '/ws/dm' });
  const rooms = new Map(); // roomKey -> Set(ws)

  wss.on('connection', async (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    const peerId = url.searchParams.get('peer');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
      ws.userId = decoded.sub;
    } catch {
      ws.close(1008, 'Unauthorized');
      return;
    }
    if (!peerId) { ws.close(1008, 'peer required'); return; }
    const roomKey = makeRoomKey(ws.userId, peerId);
    const set = rooms.get(roomKey) || new Set();
    set.add(ws);
    rooms.set(roomKey, set);

    const room = await ensureDMRoom(roomKey, ws.userId, peerId);

    ws.on('message', async (msg) => {
      const text = msg.toString();
      await pool.query('INSERT INTO chat_messages (room_id, user_id, content) VALUES ($1,$2,$3)', [room.id, ws.userId, text]);
      for (const c of rooms.get(roomKey) || []) {
        if (c.readyState === WebSocket.OPEN) {
          c.send(JSON.stringify({ type: 'message', userId: ws.userId, content: text, room: roomKey }));
        }
      }
    });
    ws.on('close', () => {
      const s = rooms.get(roomKey);
      if (s) { s.delete(ws); if (s.size === 0) rooms.delete(roomKey); }
    });
  });

  function makeRoomKey(a, b) {
    return [a, b].sort().join('_');
  }
  async function ensureDMRoom(roomKey, u1, u2) {
    const { rows } = await pool.query('SELECT * FROM chat_rooms WHERE room_key = $1', [roomKey]);
    if (rows[0]) return rows[0];
    const ins = await pool.query('INSERT INTO chat_rooms (room_key, type, user1_id, user2_id) VALUES ($1,$2,$3,$4) RETURNING *', [roomKey, 'dm', u1, u2]);
    return ins.rows[0];
  }
}