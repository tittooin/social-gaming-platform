import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Unauthorized: missing bearer token' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'JWT secret not configured' });
    }

    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
    if (!decoded || !decoded.sub) {
      return res.status(401).json({ error: 'Unauthorized: invalid token' });
    }

    // Basic audience check for Supabase
    if (decoded.aud && decoded.aud !== 'authenticated') {
      return res.status(401).json({ error: 'Unauthorized: invalid audience' });
    }

    req.user = {
      id: decoded.sub,
      phone: decoded.phone || null,
      role: decoded.role || 'user',
      token,
    };
    return next();
  } catch (err) {
    console.error('Auth error', err);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}