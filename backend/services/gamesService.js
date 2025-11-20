// Simple in-memory games registry for Phase-1.
// Replace with DB persistence later.

const DEFAULT_GAMES = [
  // Board
  { key: 'ludo', name: 'Ludo', url: 'https://html5.gamedistribution.com/rvvAS2zybpczj4b8b3/', icon: '🎲', category: 'board' },
  { key: 'dice', name: 'Dice', url: 'https://cdn.htmlgames.com/DiceDuel/index.html', icon: '🎲', category: 'board' },
  { key: 'sapsidi', name: 'Sapsidi (Classic Ludo)', url: 'https://cdn.htmlgames.com/ClassicLudo/index.html', icon: '🎲', category: 'board' },
  { key: 'carrom', name: 'Carrom', url: 'https://s3.eu-central-1.amazonaws.com/gd-files/Carrom.Multiplayer/index.html', icon: '🎯', category: 'board' },
  { key: 'chess', name: 'Chess', url: 'https://chessformer.org/play/index.html', icon: '♟️', category: 'board' },
  { key: 'checkers', name: 'Checkers', url: 'https://html5.gamedistribution.com/6fdcccb74189aca9297/index.html', icon: '⛀', category: 'board' },
  { key: 'tictactoe', name: 'TicTacToe', url: 'https://playtictactoe.org/app/index.html', icon: '⭕❌', category: 'board' },

  // Cards
  { key: 'rummy', name: 'Rummy', url: 'https://games.cdnplay.online/rummy/index.html', icon: '🃏', category: 'cards' },
  { key: 'solitaire', name: 'Solitaire', url: 'https://solitaire.online/solitaire-classic/index.html', icon: '🂡', category: 'cards' },

  // Puzzle
  { key: '2048', name: '2048', url: 'https://play2048.co/', icon: '🔢', category: 'puzzle' },
  { key: 'tetris', name: 'Tetris', url: 'https://tetris-game.example.com/', icon: '🧱', category: 'puzzle' },
  { key: 'word', name: 'Word Puzzle', url: 'https://justwords.online/wordpuzzle/index.html', icon: '🧩', category: 'puzzle' },

  // Arcade
  { key: 'snake', name: 'Snake Classic', url: 'https://playsnake.org/app/snake.html', icon: '🐍', category: 'arcade' },
  { key: 'bubble', name: 'Bubble Shooter', url: 'https://cdn.htmlgames.com/BubbleShooter/index.html', icon: '🔵', category: 'arcade' },
  { key: 'fruit_slice', name: 'Fruit Slice', url: 'https://fruit-slice.example.com/', icon: '🍉', category: 'arcade' },
  { key: 'runner', name: 'Runner', url: 'https://runner-game.example.com/', icon: '🏃', category: 'arcade' },

  // Other
  { key: 'pool8', name: 'Pool 8 Ball', url: 'https://cdn.htmlgames.com/8BallPool/index.html', icon: '🎱', category: 'sports' },
  { key: 'snakes_ladders', name: 'Snakes & Ladders', url: 'https://html5.gamedistribution.com/icebesar/snake-ladder/index.html', icon: '🪜', category: 'board' },
];

let games = [...DEFAULT_GAMES];

export function listGames() {
  return games.slice();
}

export function addGame({ key, name, url, icon, category }) {
  if (!key || !name || !url) throw new Error('Missing fields');
  const exists = games.find((g) => g.key === key);
  if (exists) {
    // update existing
    exists.name = name;
    exists.url = url;
    if (icon) exists.icon = icon;
    if (category) exists.category = category;
  } else {
    games.push({ key, name, url, icon: icon || '🎮', category: category || null });
  }
  return { ok: true };
}

export function removeGame({ key }) {
  const before = games.length;
  games = games.filter((g) => g.key !== key);
  return { removed: before - games.length };
}

export function getGameUrlForType(gameType) {
  const g = games.find((x) => x.key === gameType);
  return g?.url || null;
}