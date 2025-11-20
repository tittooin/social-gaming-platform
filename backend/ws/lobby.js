import WebSocket, { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { pool } from '../db/index.js';

export function initLobbyWSS(server) {
  const wss = new WebSocketServer({ server, path: '/ws/lobby' });
  const clients = new Set();

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
      ws.userId = decoded.sub;
    } catch {
      ws.close(1008, 'Unauthorized');
      return;
    }

    clients.add(ws);
    ws.on('message', async (msg) => {
      const text = msg.toString();
      // persist message in a lobby room
      const roomKey = 'lobby';
      const roomRow = await ensureRoom(roomKey, 'lobby');
      await pool.query('INSERT INTO chat_messages (room_id, user_id, content) VALUES ($1,$2,$3)', [roomRow.id, ws.userId, text]);
      // broadcast
      for (const c of clients) {
        if (c.readyState === WebSocket.OPEN) {
          c.send(JSON.stringify({ type: 'message', userId: ws.userId, content: text, room: 'lobby' }));
        }
      }
    });
    ws.on('close', () => clients.delete(ws));
  });

  async function ensureRoom(roomKey, type) {
    const { rows } = await pool.query('SELECT * FROM chat_rooms WHERE room_key = $1', [roomKey]);
    if (rows[0]) return rows[0];
    const ins = await pool.query('INSERT INTO chat_rooms (room_key, type) VALUES ($1,$2) RETURNING *', [roomKey, type]);
    return ins.rows[0];
  }
}