const { verifyToken } = require('../utils/authUtils');
const { User, Role } = require('../models');

// Verifies JWT and attaches req.user = { id, role }
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = verifyToken(token);

    const user = await User.findByPk(decoded.id, { include: Role });
    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'Invalid or inactive user' });
    }

    req.user = { id: user.id, role: user.Role.name, email: user.email };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

// Usage: authorize('ADMIN', 'EMPLOYER')
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
