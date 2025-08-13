import request from 'supertest';
import { app } from '../src/app.js';

describe('Auth', () => {
  it('logs in with seeded admin', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: process.env.ADMIN_PASSWORD || 'admin123456',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeTruthy();
    expect(res.body.data.refreshToken).toBeTruthy();
  });
});
