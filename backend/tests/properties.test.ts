import request from 'supertest';
import { app } from '../src/app.js';

async function login() {
  const res = await request(app).post('/api/auth/login').send({
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_PASSWORD || 'admin123456',
  });
  return res.body.data.token as string;
}

describe('Properties', () => {
  it('creates, reads, updates, deletes a property', async () => {
    const token = await login();

    // Create
    const create = await request(app)
      .post('/api/properties')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Property',
        description: 'Nice place',
        priceEuro: 123456,
        type: 'apartment',
        address: 'Via Roma 1',
        city: 'Rome',
        region: 'Lazio',
        postalCode: '00100',
        bedrooms: 2,
        bathrooms: 1,
        area: 80,
        images: [],
        features: ['balcony']
      });
    expect(create.status).toBe(200);
    const id = create.body.data.id as string;

    // Read
    const read = await request(app).get(`/api/properties/${id}`);
    expect(read.status).toBe(200);
    expect(read.body.data.title).toBe('Test Property');

    // Update
    const update = await request(app)
      .put(`/api/properties/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ bedrooms: 3 });
    expect(update.status).toBe(200);
    expect(update.body.data.bedrooms).toBe(3);

    // Delete
    const del = await request(app)
      .delete(`/api/properties/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(200);
  });
});
