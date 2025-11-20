export function requireAdmin(req, res, next) {
  const key = req.headers['x-admin-key'];
  const expected = process.env.ADMIN_KEY || 'local_admin_key';
  if (!key || key !== expected) {
    return res.status(403).json({ error: 'Forbidden: admin key invalid' });
  }
  return next();
}