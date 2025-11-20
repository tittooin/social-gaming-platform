// Simple tournament rules registry for Phase-1.
// In future, persist in DB and support per-tournament configuration.

export const RULES = [
  { key: 'knockout', name: 'Knockout', description: 'Single elimination; losers are eliminated each round.' },
  { key: 'league', name: 'League', description: 'Round-robin or points-based league format.' },
  { key: 'highscore', name: 'High Score', description: 'Best score wins across a time window.' },
  { key: 'timeattack', name: 'Time Attack', description: 'Finish fastest; tie-breakers on consistency.' },
];

export function getAvailableRules() {
  return RULES.slice();
}

// Placeholder evaluation stub; integrate with actual match results later.
export function evaluateWinners({ rule, scores }) {
  // scores: [{ userId, score, timeMs }]
  if (rule === 'knockout') {
    // Winner is the last remaining participant.
    return scores.sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 1);
  }
  if (rule === 'league') {
    // Highest points
    return scores.sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 3);
  }
  if (rule === 'highscore') {
    return scores.sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 1);
  }
  if (rule === 'timeattack') {
    return scores.sort((a, b) => (a.timeMs ?? Infinity) - (b.timeMs ?? Infinity)).slice(0, 1);
  }
  return [];
}