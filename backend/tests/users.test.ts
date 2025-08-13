import request from 'supertest';
import { app } from '../src/app.js';

async function login() {
  const res = await request(app).post('/api/auth/login').send({
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_PASSWORD || 'admin123456',
  });
  return res.body.data.token as string;
}

describe('Users', () => {
  it('lists users', async () => {
    const token = await login();
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });
});
