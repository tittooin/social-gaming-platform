// Server-side Chess engine using chess.js
import { Chess } from 'chess.js';

export function start(seed = null) {
  const chess = new Chess();
  return { fen: chess.fen(), pgn: chess.pgn(), turn: chess.turn(), seed };
}

export function applyMove(state, move) {
  const chess = new Chess(state.fen);
  const res = chess.move(move); // e.g., { from:'e2', to:'e4' } or SAN
  if (!res) throw new Error('Illegal move');
  return { fen: chess.fen(), pgn: chess.pgn(), turn: chess.turn(), last: res.san, check: chess.inCheck(), checkmate: chess.isCheckmate(), stalemate: chess.isStalemate() };
}

export function cpuMove(state, depth = 1) {
  const chess = new Chess(state.fen);
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return { fen: chess.fen(), pgn: chess.pgn(), turn: chess.turn(), last: null };
  // naive: pick best by material after one ply
  let best = moves[0];
  let bestScore = -Infinity;
  for (const m of moves) {
    const clone = new Chess(chess.fen());
    clone.move(m);
    const score = evaluateMaterial(clone);
    if (score > bestScore) { bestScore = score; best = m; }
  }
  chess.move(best);
  return { fen: chess.fen(), pgn: chess.pgn(), turn: chess.turn(), last: best.san };
}

function evaluateMaterial(chess) {
  const values = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  let score = 0;
  const board = chess.board();
  for (const row of board) {
    for (const cell of row) {
      if (!cell) continue;
      const v = values[cell.type] || 0;
      score += cell.color === 'w' ? v : -v;
    }
  }
  return score;
}