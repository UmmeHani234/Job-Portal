process.env.JWT_SECRET = 'test_secret';

const request = require('supertest');
const app = require('../src/app');

describe('GET /health', () => {
  test('returns 200 and ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('ok');
  });
});

describe('Unknown route', () => {
  test('returns 404 with a JSON error body', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/auth/register validation', () => {
  test('rejects a request missing required fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'a@b.com' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('rejects an invalid role', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'a@b.com', password: 'secret123', role: 'ADMIN' });
    expect(res.status).toBe(400);
  });
});
