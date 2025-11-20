// Word Sprint engine: seed letters, scoring, dictionary validation
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const dictPath = path.join(process.cwd(), 'backend', 'src', 'games', 'word', 'dictionary.txt');
let DICT = new Set();
try {
  const data = fs.readFileSync(dictPath, 'utf-8');
  DICT = new Set(data.split(/\r?\n/).map(w => w.trim().toLowerCase()).filter(Boolean));
} catch (e) {
  console.warn('Dictionary not found, word validation will be limited.');
}

export function generateSeedLetters(seed, count = 10) {
  const letters = [];
  let s = String(seed);
  for (let i = 0; i < count; i++) {
    const h = crypto.createHash('sha256').update(s + ':' + i).digest('hex');
    const n = parseInt(h.slice(0, 2), 16);
    const letter = String.fromCharCode('a'.charCodeAt(0) + (n % 26));
    letters.push(letter);
  }
  return letters;
}

export function startRound({ seed }) {
  const letters = generateSeedLetters(seed);
  return { seed, letters, started_at: Date.now(), duration_ms: 60000 };
}

export function validateWord(word, letters) {
  const w = (word || '').toLowerCase();
  if (!w || w.length < 2) return false;
  if (DICT.size > 0 && !DICT.has(w)) return false;
  // Must be composed of provided letters (multiset check)
  const counts = Object.create(null);
  for (const l of letters) counts[l] = (counts[l] || 0) + 1;
  for (const c of w) {
    if (!counts[c]) return false;
    counts[c] -= 1;
  }
  return true;
}

export function scoreWords(words) {
  // Simple scoring: length-based
  let score = 0;
  for (const w of words) {
    const len = w.length;
    if (len >= 8) score += 11;
    else if (len >= 6) score += 7;
    else if (len >= 4) score += 4;
    else score += 2;
  }
  return score;
}

export function finalizeRound({ letters, submittedWords }) {
  const valid = [];
  for (const w of submittedWords) {
    if (validateWord(w, letters)) valid.push(w);
  }
  const score = scoreWords(valid);
  return { valid, score };
}