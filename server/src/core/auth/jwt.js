const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'super-secret-key';

function sign(payload, options = {}) {
  return jwt.sign(payload, SECRET, { expiresIn: '8h', ...options });
}

function verify(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (e) {
    return null;
  }
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.slice(7);
  const data = verify(token);
  if (!data) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  req.user = data;
  next();
}

module.exports = { sign, verify, authMiddleware };