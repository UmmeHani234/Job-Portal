const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const hashPassword = async (plain) => bcrypt.hash(plain, 10);
const comparePassword = async (plain, hash) => bcrypt.compare(plain, hash);

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

module.exports = { hashPassword, comparePassword, signToken, verifyToken };
