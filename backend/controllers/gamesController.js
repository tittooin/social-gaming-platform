import { listGames, addGame, removeGame } from '../services/gamesService.js';
import fs from 'fs';
import path from 'path';

export async function getGames(req, res, next) {
  try {
    const games = listGames();
    return res.json({ games });
  } catch (e) {
    return next(e);
  }
}

export async function adminAddGame(req, res, next) {
  try {
    const { key, name, url, icon, category } = req.body || {};
    const result = addGame({ key, name, url, icon, category });
    return res.json(result);
  } catch (e) {
    return next(e);
  }
}

export async function adminRemoveGame(req, res, next) {
  try {
    const { key } = req.body || {};
    const result = removeGame({ key });
    return res.json(result);
  } catch (e) {
    return next(e);
  }
}

// List static games integrated under backend/public/games
export async function getStaticGames(req, res, next) {
  try {
    // When running from backend/ as CWD, public/games is directly under it
    const baseDir = path.join(process.cwd(), 'public', 'games');
    const entries = fs.readdirSync(baseDir, { withFileTypes: true });
    // Optional config file to refine bots mapping and names
    const cfgPath = path.join(baseDir, 'config.json');
    let cfg = {};
    if (fs.existsSync(cfgPath)) {
      try {
        cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
      } catch (e) {
        console.warn('Failed to read games config.json:', e);
      }
    }
    const botsMap = (cfg && cfg.bots) ? cfg.bots : {};
    const nameOverride = (cfg && cfg.names) ? cfg.names : {};
    const games = entries
      .filter((d) => d.isDirectory())
      .map((d) => {
        const dir = d.name;
        const hasIndex = fs.existsSync(path.join(baseDir, dir, 'index.html'));
        if (!hasIndex) return null;
        // Thumbnails: support common extensions and alternate filename 'thumbnail'
        const thumbCandidates = [
          'thumb.png', 'thumb.jpg', 'thumb.jpeg', 'thumb.webp',
          'thumbnail.png', 'thumbnail.jpg', 'thumbnail.jpeg', 'thumbnail.webp',
        ];
        let thumb = null;
        for (const file of thumbCandidates) {
          const full = path.join(baseDir, dir, file);
          if (fs.existsSync(full)) {
            thumb = `/games/${dir}/${file}`;
            break;
          }
        }
        const autoName = dir
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        const name = nameOverride[dir] || autoName;
        return {
          key: dir,
          name,
          url: `/games/${dir}/index.html`,
          thumb,
          bots: !!botsMap[dir],
        };
      })
      .filter(Boolean);
    return res.json({ games });
  } catch (e) {
    return next(e);
  }
}