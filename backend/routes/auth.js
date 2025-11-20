import express from 'express';
import { body } from 'express-validator';
import { handleValidation } from '../middleware/validation.js';
import { sendOtp, verifyOtp } from '../controllers/authController.js';
import jwt from 'jsonwebtoken';
import { pool } from '../db/index.js';

export const router = express.Router();

router.post('/otp',
  body('phone').matches(/^\+[1-9]\d{1,14}$/).withMessage('Phone must be E.164 format'),
  body('deviceId').isString().isLength({ min: 4, max: 128 }),
  handleValidation,
  sendOtp,
);

router.post('/verify',
  body('phone').matches(/^\+[1-9]\d{1,14}$/),
  body('token').isString().isLength({ min: 4, max: 12 }),
  body('deviceId').optional().isString(),
  handleValidation,
  verifyOtp,
);

// Local dev login (dummy JWT): creates user if not exists
router.post('/login',
  body('username').isString().isLength({ min: 3, max: 32 }),
  handleValidation,
  async (req, res, next) => {
    try {
      const { username } = req.body;
      // Find or create user
      const findSql = 'SELECT * FROM users WHERE username = $1';
      let { rows } = await pool.query(findSql, [username]);
      let user = rows[0];
      if (!user) {
        const idSql = 'SELECT gen_random_uuid() as id';
        const idRows = await pool.query(idSql);
        const id = idRows.rows[0].id;
        const insSql = 'INSERT INTO users (id, username, created_at, updated_at) VALUES ($1, $2, now(), now()) RETURNING *';
        ({ rows } = await pool.query(insSql, [id, username]));
        user = rows[0];
        // create wallet for dev user
        await pool.query(
          `INSERT INTO wallets (user_id, earned_chips, purchased_chips, diamonds)
           SELECT $1, 0, 0, 0 WHERE NOT EXISTS (SELECT 1 FROM wallets WHERE user_id = $1)`,
          [user.id]
        );
      }
      // ensure wallet exists for existing users as well (dev convenience)
      await pool.query(
        `INSERT INTO wallets (user_id, earned_chips, purchased_chips, diamonds)
         SELECT $1, 0, 0, 0 WHERE NOT EXISTS (SELECT 1 FROM wallets WHERE user_id = $1)`,
        [user.id]
      );
      if (user.banned) return res.status(403).json({ error: 'User banned' });
      const token = jwt.sign({ sub: user.id, username, aud: 'authenticated' }, process.env.JWT_SECRET, { algorithm: 'HS256' });
      res.json({ token, user });
    } catch (e) { next(e); }
  },
);