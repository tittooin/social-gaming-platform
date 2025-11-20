import { pool } from '../db/index.js';
import { sendPhoneOtp, verifyPhoneOtp } from '../services/supabaseService.js';
import { ensureUser } from '../services/userService.js';

export async function sendOtp(req, res, next) {
  try {
    const { phone, deviceId } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
    await sendPhoneOtp(phone);
    await pool.query(
      `INSERT INTO auth_otplogs (phone, device_id, status, ip_address) VALUES ($1, $2, 'sent', $3)`,
      [phone, deviceId, ip],
    );
    return res.json({ success: true });
  } catch (err) {
    await pool.query(
      `INSERT INTO auth_otplogs (phone, device_id, status) VALUES ($1, $2, 'error')`,
      [req.body.phone, req.body.deviceId],
    );
    return next(err);
  }
}

export async function verifyOtp(req, res, next) {
  try {
    const { phone, token, deviceId } = req.body;
    const data = await verifyPhoneOtp({ phone, token });
    const user = data?.user;
    const session = data?.session;
    if (!user || !session) throw new Error('Invalid OTP: no session');

    await ensureUser({ id: user.id, phone, deviceId });
    // Return Supabase session tokens to client
    return res.json({
      user: { id: user.id, phone },
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      token_type: 'bearer',
      expires_in: session.expires_in,
    });
  } catch (err) {
    return next(err);
  }
}