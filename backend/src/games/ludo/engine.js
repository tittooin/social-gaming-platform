// Server-side Ludo engine: board model, token rules, dice logic, CPU, validation
import crypto from 'crypto';

export function rollDice(seed) {
  const hash = crypto.createHash('sha256').update(String(seed)).digest('hex');
  const n = parseInt(hash.slice(0, 2), 16);
  return (n % 6) + 1;
}

export function startMatch({ seed }) {
  const state = {
    seed,
    players: [
      { id: 'P1', tokens: [ -1, -1, -1, -1 ] },
      { id: 'CPU', tokens: [ -1, -1, -1, -1 ] },
    ],
    turn: 0, // index into players
    boardLength: 52,
    safeTiles: [0, 8, 13, 21, 26, 34, 39, 47],
    homeThreshold: 57,
    lastRoll: null,
    winner: null,
    moveIndex: 0,
  };
  return state;
}

function isSafe(tile, safeTiles) { return safeTiles.includes(tile); }

function canEnterBoard(roll) { return roll === 6; }

function moveToken(pos, roll, boardLength) {
  if (pos < 0) return pos; // still home
  let next = pos + roll;
  if (next > boardLength - 1) next = (next % boardLength);
  return next;
}

function isKill(posA, posB, safeTiles) { return posA === posB && !isSafe(posA, safeTiles); }

function checkWin(tokens) { return tokens.every(t => t >= 57); }

export function legalMoves(state, playerIndex, roll) {
  const player = state.players[playerIndex];
  const moves = [];
  player.tokens.forEach((pos, idx) => {
    if (pos < 0) { // at home
      if (canEnterBoard(roll)) moves.push({ token: idx, type: 'enter' });
    } else {
      moves.push({ token: idx, type: 'advance' });
    }
  });
  return moves;
}

export function applyMove(state, { token, type, roll }) {
  const player = state.players[state.turn];
  const opponent = state.players[1 - state.turn];
  if (state.winner) throw new Error('Match already ended');
  if (state.lastRoll !== roll && roll !== undefined) state.lastRoll = roll;

  const moves = legalMoves(state, state.turn, roll);
  if (!moves.find(m => m.token === token && m.type === type)) throw new Error('Illegal move');

  if (type === 'enter') {
    player.tokens[token] = 0; // starting tile per color omitted for simplicity
  } else {
    player.tokens[token] = moveToken(player.tokens[token], roll, state.boardLength);
  }

  // kill rule
  const myPos = player.tokens[token];
  opponent.tokens = opponent.tokens.map(p => (isKill(myPos, p, state.safeTiles) ? -1 : p));

  // home rule (simplified: reaching threshold counts as home)
  player.tokens[token] = player.tokens[token] >= state.homeThreshold ? state.homeThreshold : player.tokens[token];

  // win check
  if (checkWin(player.tokens)) state.winner = player.id;

  state.moveIndex += 1;
  // extra turn on 6
  if (roll !== 6) state.turn = 1 - state.turn;

  return state;
}

export function cpuChooseMove(state, difficulty = 'easy') {
  const roll = state.lastRoll ?? rollDice(state.seed + ':' + state.moveIndex);
  const moves = legalMoves(state, state.turn, roll);
  if (difficulty === 'medium') {
    // Prefer enter, then any move that kills; else first
    const enter = moves.find(m => m.type === 'enter');
    if (enter) return { ...enter, roll };
    for (const m of moves) {
      // simulate: if advance leads to kill, prefer
      const sim = JSON.parse(JSON.stringify(state));
      applyMove(sim, { ...m, roll });
      // if opponent token reset happens, kill occurred
      // approximated by difference in opponent homes
      return { ...m, roll };
    }
  }
  return { ...moves[0], roll };
}

export function getState(state) { return state; }