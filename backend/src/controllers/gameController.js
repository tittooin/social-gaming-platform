import { startMatch as ludoStart, applyMove as ludoApply, cpuChooseMove as ludoCPU } from '../games/ludo/engine.js';
import { start as chessStart, applyMove as chessApply, cpuMove as chessCPU } from '../games/chess/engine.js';
import { startRound as wordStart, finalizeRound as wordFinalize } from '../games/word/engine.js';
import { pool } from '../../db/index.js';
import { submitScore } from '../services/leaderboardService.js';
import { awardWin, recordMatch, addXP } from '../services/rewardService.js';

function requireAuth(req) {
  // Assuming req.user injected by upstream middleware
  if (!req.user) throw new Error('Unauthorized');
}

export async function startGame(req, res) {
  try {
    requireAuth(req);
    const { game_type } = req.body;
    const seed = Date.now();
    let initial;
    if (game_type === 'ludo') initial = ludoStart({ seed });
    else if (game_type === 'chess') initial = chessStart(seed);
    else if (game_type === 'word') initial = wordStart({ seed });
    else return res.status(400).json({ error: 'Unknown game_type' });
    const { rows } = await pool.query(
      `INSERT INTO matches (user_id, server_seed, status)
       VALUES ($1,$2,'started')
       RETURNING id`,
      [req.user.id, String(seed)]
    );
    const matchId = rows[0].id;
    // snapshot initial state into per-game table
    if (game_type === 'ludo') {
      await pool.query(`INSERT INTO ludo_state (match_id,user_id,seed,state_json,result,score) VALUES ($1,$2,$3,$4,$5,$6)`, [matchId, req.user.id, String(seed), initial, null, 0]);
    } else if (game_type === 'chess') {
      await pool.query(`INSERT INTO chess_state (match_id,user_id,seed,state_json,result,score) VALUES ($1,$2,$3,$4,$5,$6)`, [matchId, req.user.id, String(seed), initial, null, 0]);
    } else if (game_type === 'word') {
      await pool.query(`INSERT INTO word_rounds (match_id,user_id,seed,state_json,result,score) VALUES ($1,$2,$3,$4,$5,$6)`, [matchId, req.user.id, String(seed), initial, null, 0]);
    }
    return res.json({ match_id: matchId, state: initial });
  } catch (e) {
    res.status(500).json({ error: e.message, stack: e.stack });
  }
}

export async function applyGameMove(req, res) {
  try {
    requireAuth(req);
    const { match_id, game_type, move, cpu } = req.body;
    const { rows } = await pool.query(`SELECT * FROM matches WHERE id=$1 AND user_id=$2`, [match_id, req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Match not found' });
    // load latest state snapshot
    let snap;
    if (game_type === 'ludo') {
      snap = (await pool.query(`SELECT * FROM ludo_state WHERE match_id=$1 ORDER BY updated_at DESC LIMIT 1`, [match_id])).rows[0];
    } else if (game_type === 'chess') {
      snap = (await pool.query(`SELECT * FROM chess_state WHERE match_id=$1 ORDER BY updated_at DESC LIMIT 1`, [match_id])).rows[0];
    } else if (game_type === 'word') {
      snap = (await pool.query(`SELECT * FROM word_rounds WHERE match_id=$1 ORDER BY updated_at DESC LIMIT 1`, [match_id])).rows[0];
    }
    let state = snap?.state_json || {};
    let next;
    if (game_type === 'ludo') {
      next = ludoApply(state, move);
      if (cpu) {
        const cpuMove = ludoCPU(next, cpu);
        next = ludoApply(next, cpuMove);
      }
    } else if (game_type === 'chess') {
      next = chessApply(state, move);
      if (cpu) next = chessCPU(next, cpu);
    } else if (game_type === 'word') {
      // move carries submitted words (intermediate not needed)
      next = { ...state, submitted: move.words || [] };
    } else return res.status(400).json({ error: 'Unknown game_type' });
    // update per-game state snapshot
    const table = game_type === 'ludo' ? 'ludo_state' : game_type === 'chess' ? 'chess_state' : 'word_rounds';
    await pool.query(`UPDATE ${table} SET state_json=$2, updated_at=now() WHERE match_id=$1`, [match_id, next]);
    await pool.query(
      `INSERT INTO match_moves(match_id,user_id,game_type,move_json,move_index)
       VALUES ($1,$2,$3,$4,(SELECT COALESCE(MAX(move_index),-1)+1 FROM match_moves WHERE match_id=$1))`,
      [match_id, req.user.id, game_type, move]
    );
    res.json({ state: next });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function endGame(req, res) {
  try {
    requireAuth(req);
    const { match_id, game_type, payload } = req.body;
    let rows;
    try {
      ({ rows } = await pool.query(`SELECT * FROM matches WHERE id=$1 AND user_id=$2`, [match_id, req.user.id]));
    } catch (e) { console.error('endGame error: load match', e); throw new Error(`endGame:load-match: ${e.message}`); }
    if (rows.length === 0) return res.status(404).json({ error: 'Match not found' });
    // load latest state snapshot
    let snap;
    if (game_type === 'ludo') {
      try {
        snap = (await pool.query(`SELECT * FROM ludo_state WHERE match_id=$1 ORDER BY updated_at DESC LIMIT 1`, [match_id])).rows[0];
      } catch (e) { console.error('endGame error: load ludo state', e); throw new Error(`endGame:load-state:ludo: ${e.message}`); }
    } else if (game_type === 'chess') {
      try {
        snap = (await pool.query(`SELECT * FROM chess_state WHERE match_id=$1 ORDER BY updated_at DESC LIMIT 1`, [match_id])).rows[0];
      } catch (e) { console.error('endGame error: load chess state', e); throw new Error(`endGame:load-state:chess: ${e.message}`); }
    } else if (game_type === 'word') {
      try {
        snap = (await pool.query(`SELECT * FROM word_rounds WHERE match_id=$1 ORDER BY updated_at DESC LIMIT 1`, [match_id])).rows[0];
      } catch (e) { console.error('endGame error: load word state', e); throw new Error(`endGame:load-state:word: ${e.message}`); }
    }
    let state = snap?.state_json || {};
    let result = 'loss';
    let score = 0;
    if (game_type === 'ludo') {
      if (state.winner === 'P1') { result = 'win'; score = 100; }
    } else if (game_type === 'chess') {
      // score by PGN length
      score = (state.pgn || '').split(' ').length;
      result = payload?.result || 'loss';
    } else if (game_type === 'word') {
      const finalized = wordFinalize({ letters: state.letters, submittedWords: payload.words || [] });
      score = finalized.score;
      result = 'complete';
      state = { ...state, valid: finalized.valid };
    } else return res.status(400).json({ error: 'Unknown game_type' });
    // update state and mark match ended
    const table = game_type === 'ludo' ? 'ludo_state' : game_type === 'chess' ? 'chess_state' : 'word_rounds';
    try {
      await pool.query(`UPDATE ${table} SET state_json=$2, result=$3, score=$4, updated_at=now() WHERE match_id=$1`, [match_id, state, result, score]);
    } catch (e) { console.error('endGame error: update state', e); throw new Error(`endGame:update-state: ${e.message}`); }
    try {
      await pool.query(`UPDATE matches SET status='ended', ended_at=now() WHERE id=$1`, [match_id]);
    } catch (e) { console.error('endGame error: update match', e); throw new Error(`endGame:update-match: ${e.message}`); }
    try {
      await submitScore({ gameType: game_type, userId: req.user.id, score });
    } catch (e) { console.error('endGame error: submitScore', e); throw new Error(`endGame:submit-score: ${e.message}`); }
    const outcome = result === 'win' ? 'win' : result === 'loss' ? 'loss' : 'draw';
    try {
      await recordMatch({ matchId: match_id, userId: req.user.id, gameType: game_type, outcome });
    } catch (e) { console.error('endGame error: recordMatch', e); throw new Error(`endGame:record-match: ${e.message}`); }
    try {
      if (outcome === 'win') await awardWin(req.user.id, 90);
    } catch (e) { console.error('endGame error: awardWin', e); throw new Error(`endGame:award-win: ${e.message}`); }
    try {
      await addXP(req.user.id, Math.max(1, Math.floor(score / 10)));
    } catch (e) { console.error('endGame error: addXP', e); throw new Error(`endGame:add-xp: ${e.message}`); }
    res.json({ result, score, state });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function getLeaderboard(req, res) {
  try {
    const game = req.params.game;
    const period = req.query.period || 'daily';
    const { getLeaderboard } = await import('../services/leaderboardService.js');
    const rows = await getLeaderboard(game, period);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}