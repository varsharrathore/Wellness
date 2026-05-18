const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Returns the authenticated user or throws — use inside serverless handlers
async function getAuthUser(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) throw { status: 401, message: 'No token provided' };
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId);
  if (!user || !user.isActive) throw { status: 401, message: 'Invalid token' };
  return user;
}

async function requireAdmin(req) {
  const user = await getAuthUser(req);
  if (user.role !== 'admin') throw { status: 403, message: 'Admin access required' };
  return user;
}

// Wraps a serverless handler with error handling
function withErrorHandler(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      const status = err.status || 500;
      const message = err.message || 'Server error';
      res.status(status).json({ message });
    }
  };
}

module.exports = { getAuthUser, requireAdmin, withErrorHandler };
