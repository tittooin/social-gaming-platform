import WebSocket, { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { applyMove as ludoApply } from '../games/ludo/engine.js';
import { applyMove as chessApply } from '../games/chess/engine.js';

export function initGameWSS(server) {
  const wss = new WebSocketServer({ server, path: '/ws/game' });
  const rooms = new Map(); // roomKey -> { gameType, state, clients:Set(ws) }

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    const matchId = url.searchParams.get('match');
    const gameType = url.searchParams.get('game');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
      ws.userId = decoded.sub;
    } catch {
      ws.close(1008, 'Unauthorized');
      return;
    }
    if (!matchId || !gameType) { ws.close(1008, 'match and game required'); return; }
    const roomKey = `${gameType}:${String(matchId)}`;
    const room = rooms.get(roomKey) || { gameType, state: null, clients: new Set() };
    room.clients.add(ws);
    rooms.set(roomKey, room);

    ws.on('message', (msg) => {
      try {
        const parsed = JSON.parse(msg.toString());
        if (parsed.type === 'move') {
          room.state = room.state || { turn: 0, players: [], lastRoll: null };
          if (gameType === 'ludo') room.state = ludoApply(room.state, parsed.move);
          else if (gameType === 'chess') room.state = chessApply(room.state, parsed.move);
          for (const client of room.clients) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: 'state', state: room.state }));
            }
          }
        }
      } catch (e) {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'error', error: e.message }));
      }
    });
    ws.on('close', () => {
      room.clients.delete(ws);
      if (room.clients.size === 0) rooms.delete(roomKey);
    });
  });
}