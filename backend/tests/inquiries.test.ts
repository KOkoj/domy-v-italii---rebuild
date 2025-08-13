import request from 'supertest';
import { app } from '../src/app.js';

describe('Inquiries', () => {
  it('accepts public inquiry', async () => {
    const res = await request(app).post('/api/inquiries').send({
      name: 'Mario Rossi',
      email: 'mario@example.com',
      message: 'I am interested.',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
