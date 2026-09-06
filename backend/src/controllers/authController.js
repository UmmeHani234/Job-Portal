const crypto = require('crypto');
const { User, Role } = require('../models');
const { hashPassword, comparePassword, signToken } = require('../utils/authUtils');

// POST /auth/register
// body: { name, email, password, role: 'CANDIDATE' | 'EMPLOYER' }
async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'name, email, password and role are required' });
    }

    const allowedSelfRoles = ['CANDIDATE', 'EMPLOYER']; // ADMIN cannot self-register
    if (!allowedSelfRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'role must be CANDIDATE or EMPLOYER' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const roleRow = await Role.findOne({ where: { name: role } });
    if (!roleRow) return res.status(400).json({ success: false, message: 'Invalid role' });

    const password_hash = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      password_hash,
      role_id: roleRow.id,
    });

    const token = signToken({ id: user.id, role: role });

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role },
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /auth/login
// body: { email, password }
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'email and password are required' });
    }

    const user = await User.findOne({ where: { email }, include: Role });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const match = await comparePassword(password, user.password_hash);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const token = signToken({ id: user.id, role: user.Role.name });

    return res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.Role.name },
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /auth/forgot-password  (optional module)
// body: { email }
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    // Always respond 200 to avoid leaking which emails are registered
    if (!user) {
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.reset_token = resetToken;
    user.reset_token_expiry = new Date(Date.now() + 1000 * 60 * 30); // 30 min
    await user.save();

    // In production this would be emailed via nodemailer (see utils/mailer.js)
    return res.json({
      success: true,
      message: 'Reset link generated',
      // exposed only for local/dev testing - remove in production
      dev_reset_token: process.env.NODE_ENV === 'development' ? resetToken : undefined,
    });
  } catch (err) {
    next(err);
  }
}

// POST /auth/reset-password
// body: { email, token, newPassword }
async function resetPassword(req, res, next) {
  try {
    const { email, token, newPassword } = req.body;
    const user = await User.findOne({ where: { email, reset_token: token } });

    if (!user || !user.reset_token_expiry || user.reset_token_expiry < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password_hash = await hashPassword(newPassword);
    user.reset_token = null;
    user.reset_token_expiry = null;
    await user.save();

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, forgotPassword, resetPassword };
