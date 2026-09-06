process.env.JWT_SECRET = 'test_secret';
process.env.JWT_EXPIRES_IN = '1h';

const { hashPassword, comparePassword, signToken, verifyToken } = require('../src/utils/authUtils');

describe('authUtils', () => {
  test('hashPassword produces a hash different from the plaintext', async () => {
    const hash = await hashPassword('MyPassword123');
    expect(hash).not.toBe('MyPassword123');
    expect(hash.length).toBeGreaterThan(20);
  });

  test('comparePassword returns true for the correct password', async () => {
    const hash = await hashPassword('MyPassword123');
    await expect(comparePassword('MyPassword123', hash)).resolves.toBe(true);
  });

  test('comparePassword returns false for an incorrect password', async () => {
    const hash = await hashPassword('MyPassword123');
    await expect(comparePassword('WrongPassword', hash)).resolves.toBe(false);
  });

  test('signToken + verifyToken round-trip the payload', () => {
    const token = signToken({ id: 'user-123', role: 'CANDIDATE' });
    const decoded = verifyToken(token);
    expect(decoded.id).toBe('user-123');
    expect(decoded.role).toBe('CANDIDATE');
  });

  test('verifyToken throws on a tampered token', () => {
    const token = signToken({ id: 'user-123', role: 'CANDIDATE' });
    const tampered = token.slice(0, -2) + 'xx';
    expect(() => verifyToken(tampered)).toThrow();
  });
});
