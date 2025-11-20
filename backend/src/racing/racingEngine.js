import { pool } from '../../db/index.js';
import { getTrack } from './trackData.js';

// Start a race: create a row in races with seed and track
export async function startRace(userId, gameType, trackId) {
  const seed = String(Date.now());
  const res = await pool.query(
    `INSERT INTO races (user_id, game_type, track_id, seed, status)
     VALUES ($1,$2,$3,$4,'started')
     RETURNING id, seed`,
    [userId, gameType, trackId, seed]
  );
  return { raceId: res.rows[0].id, seed: res.rows[0].seed };
}

// Validation rules
function validateCheckpoints(track, checkpointsHit) {
  const expected = track.checkpointIndices;
  if (!Array.isArray(checkpointsHit)) return { ok: false, reason: 'checkpoints_missing' };
  if (checkpointsHit.length < expected.length) return { ok: false, reason: 'checkpoints_incomplete' };
  for (let i = 0; i < expected.length; i++) {
    if (checkpointsHit[i] !== expected[i]) return { ok: false, reason: 'checkpoint_order' };
  }
  return { ok: true };
}

function validateTime(track, finishTimeMs) {
  if (typeof finishTimeMs !== 'number' || finishTimeMs <= 0) return { ok: false, reason: 'time_invalid' };
  if (finishTimeMs < track.minFinishMs) return { ok: false, reason: 'too_fast' };
  // Upper bound sanity (2x track min)
  if (finishTimeMs > track.minFinishMs * 4) return { ok: false, reason: 'too_slow' };
  return { ok: true };
}

function validateNitro(track, nitroUsed) {
  if (typeof nitroUsed !== 'number' || nitroUsed < 0) return { ok: false, reason: 'nitro_invalid' };
  if (nitroUsed > track.maxNitro) return { ok: false, reason: 'nitro_excess' };
  return { ok: true };
}

// Delta movement check: ensure positions follow plausible speeds between samples
function validateMovement(track, positions) {
  if (!Array.isArray(positions) || positions.length < 2) return { ok: false, reason: 'replay_missing' };
  // crude cap: 35 units per second max
  const maxDelta = 35;
  for (let i = 1; i < positions.length; i++) {
    const a = positions[i - 1];
    const b = positions[i];
    const dx = (b.x - a.x);
    const dz = (b.z - a.z);
    const dist = Math.sqrt(dx*dx + dz*dz);
    if (dist > maxDelta) return { ok: false, reason: 'teleport_detected' };
  }
  return { ok: true };
}

export function calculatePosition(finishTimeMs, rivalsTimesMs) {
  const all = [...rivalsTimesMs, finishTimeMs].sort((a,b) => a - b);
  const pos = all.indexOf(finishTimeMs) + 1;
  return pos;
}

export async function validateRaceFinish({ raceId, userId, gameType, trackId, payload }) {
  const track = getTrack(trackId);
  const { finishTimeMs, checkpointsHit, nitroUsed, positions, aiLog } = payload;

  const vTime = validateTime(track, finishTimeMs);
  if (!vTime.ok) return { valid: false, reason: vTime.reason };
  const vCP = validateCheckpoints(track, checkpointsHit);
  if (!vCP.ok) return { valid: false, reason: vCP.reason };
  const vNitro = validateNitro(track, nitroUsed);
  if (!vNitro.ok) return { valid: false, reason: vNitro.reason };
  const vMove = validateMovement(track, positions);
  if (!vMove.ok) return { valid: false, reason: vMove.reason };

  // persist aiLog optionally
  if (aiLog) {
    await pool.query(
      `INSERT INTO race_ai_logs (race_id, user_id, track_id, log_json) VALUES ($1,$2,$3,$4)`,
      [raceId, userId, trackId, aiLog]
    );
  }

  return { valid: true, reason: 'ok' };
}

export async function saveReplay({ raceId, userId, trackId, positions }) {
  await pool.query(
    `INSERT INTO race_replays (race_id, user_id, track_id, replay_json) VALUES ($1,$2,$3,$4)`,
    [raceId, userId, trackId, { positions }]
  );
}