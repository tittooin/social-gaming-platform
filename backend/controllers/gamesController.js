import { listGames, addGame, removeGame } from '../services/gamesService.js';

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