import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import http from 'http';
import { router as authRouter } from './routes/auth.js';
import { router as walletRouter } from './routes/wallet.js';
import { router as matchRouter } from './routes/match.js';
import { router as gamesRouter } from './routes/games.js';
import { router as profileRouter } from './routes/profile.js';
import { router as followersRouter } from './routes/followers.js';
import { router as postsRouter } from './routes/posts.js';
import { router as uploadRouter } from './routes/upload.js';
import { router as adminRouter } from './routes/admin.js';
import { router as tournamentsRouter } from './routes/tournaments.js';
import { initLobbyWSS } from './ws/lobby.js';
import { initDMWSS } from './ws/dm.js';
import gameRouter from './src/routes/game.js';
import { initGameWSS } from './src/ws/games.js';
import racingRouter from './src/routes/racing.js';

const app = express();

// Security & middleware
app.use(helmet());
app.use(cors({ origin: '*', methods: ['GET', 'POST'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());
app.use(morgan('combined'));

// Static uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'backend', 'uploads')));
// Static games (HTML5) served under /games/<id>/index.html
app.use('/games', express.static(path.join(process.cwd(), 'backend', 'public', 'games')));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// Root route (useful for human checks on the base URL)
app.get('/', (req, res) => {
  res.send('Social Gaming API is running. Try GET /health');
});

// Routes
app.use('/auth', authRouter);
app.use('/wallet', walletRouter);
app.use('/match', matchRouter);
app.use('/games', gamesRouter);
app.use('/profile', profileRouter);
app.use('/', postsRouter); // posts & feed routes
app.use('/', followersRouter);
app.use('/', uploadRouter);
app.use('/', adminRouter);
app.use('/tournaments', tournamentsRouter);
app.use('/game', gameRouter);
app.use('/racing', racingRouter);

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);
initLobbyWSS(server);
initDMWSS(server);
initGameWSS(server);
server.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});