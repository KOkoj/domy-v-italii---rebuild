import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/db/prisma.js';
import { hashPassword } from '../src/utils/password.js';

const request = supertest(app);

describe('Properties Endpoints', () => {
  let adminToken: string;
  let managerToken: string;
  let employeeToken: string;
  let testAdmin: any;
  let testManager: any;
  let testEmployee: any;
  let testProperty: any;

  beforeAll(async () => {
    // Create test users
    testAdmin = await prisma.user.create({
      data: {
        email: 'test-admin@example.com',
        name: 'Test Admin',
        password: await hashPassword('password123'),
        role: 'ADMIN',
        isActive: true,
      },
    });

    testManager = await prisma.user.create({
      data: {
        email: 'test-manager@example.com',
        name: 'Test Manager',
        password: await hashPassword('password123'),
        role: 'MANAGER',
        isActive: true,
      },
    });

    testEmployee = await prisma.user.create({
      data: {
        email: 'test-employee@example.com',
        name: 'Test Employee',
        password: await hashPassword('password123'),
        role: 'EMPLOYEE',
        isActive: true,
      },
    });

    // Get auth tokens
    const adminLogin = await request
      .post('/api/auth/login')
      .send({
        email: 'test-admin@example.com',
        password: 'password123',
      });
    adminToken = adminLogin.body.data.token;

    const managerLogin = await request
      .post('/api/auth/login')
      .send({
        email: 'test-manager@example.com',
        password: 'password123',
      });
    managerToken = managerLogin.body.data.token;

    const employeeLogin = await request
      .post('/api/auth/login')
      .send({
        email: 'test-employee@example.com',
        password: 'password123',
      });
    employeeToken = employeeLogin.body.data.token;
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.property.deleteMany({
      where: { title: { contains: 'Test Property' } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-' } },
    });
  });

  describe('GET /api/properties', () => {
    it('should list properties without authentication', async () => {
      const response = await request
        .get('/api/properties')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.items)).toBe(true);
    });

    it('should support pagination and filters', async () => {
      const response = await request
        .get('/api/properties?page=1&limit=5&type=apartment&status=ACTIVE')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(5);
    });

    it('should support search', async () => {
      const response = await request
        .get('/api/properties?search=Florence')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.items)).toBe(true);
    });
  });

  describe('POST /api/properties', () => {
    const validPropertyData = {
      title: 'Test Property for Creation',
      description: 'A beautiful test property in Italy.',
      priceEuro: 250000,
      type: 'apartment',
      address: 'Via Test 123',
      city: 'Test City',
      region: 'Test Region',
      postalCode: '12345',
      bedrooms: 2,
      bathrooms: 1,
      area: 90,
      features: ['balcony', 'parking'],
      images: ['https://example.com/image1.jpg'],
    };

    it('should create property as admin', async () => {
      const response = await request
        .post('/api/properties')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validPropertyData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(validPropertyData.title);
      expect(response.body.data.priceEuro).toBe(validPropertyData.priceEuro);
      expect(response.body.data).toHaveProperty('slug');

      testProperty = response.body.data;
    });

    it('should create property as manager', async () => {
      const managerPropertyData = {
        ...validPropertyData,
        title: 'Test Property by Manager',
      };

      const response = await request
        .post('/api/properties')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(managerPropertyData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(managerPropertyData.title);
    });

    it('should reject creation by employee', async () => {
      const response = await request
        .post('/api/properties')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send(validPropertyData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('permissions');
    });

    it('should reject creation without authentication', async () => {
      const response = await request
        .post('/api/properties')
        .send(validPropertyData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        title: '',
        priceEuro: -1000,
      };

      const response = await request
        .post('/api/properties')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
    });
  });

  describe('GET /api/properties/:id', () => {
    it('should get property by ID without authentication', async () => {
      if (!testProperty) {
        // Create a test property if it doesn't exist
        const createResponse = await request
          .post('/api/properties')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            title: 'Test Property for GET',
            description: 'Test description',
            priceEuro: 200000,
            type: 'house',
            address: 'Via Test 456',
            city: 'Test City',
            region: 'Test Region',
            postalCode: '54321',
            bedrooms: 3,
            bathrooms: 2,
            area: 120,
          });
        testProperty = createResponse.body.data;
      }

      const response = await request
        .get(`/api/properties/${testProperty.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testProperty.id);
      expect(response.body.data.title).toBe(testProperty.title);
    });

    it('should return 404 for non-existent property', async () => {
      const response = await request
        .get('/api/properties/clnonexistent1234567890')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should validate property ID format', async () => {
      const response = await request
        .get('/api/properties/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('validation');
    });
  });

  describe('PUT /api/properties/:id', () => {
    it('should update property as admin', async () => {
      const updateData = {
        title: 'Updated Test Property Title',
        priceEuro: 300000,
      };

      const response = await request
        .put(`/api/properties/${testProperty.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.priceEuro).toBe(updateData.priceEuro);
    });

    it('should update property as manager', async () => {
      const updateData = {
        description: 'Updated by manager',
      };

      const response = await request
        .put(`/api/properties/${testProperty.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe(updateData.description);
    });

    it('should reject update by employee', async () => {
      const response = await request
        .put(`/api/properties/${testProperty.id}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ title: 'Should not work' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/properties/:id', () => {
    it('should delete property as admin', async () => {
      const response = await request
        .delete(`/api/properties/${testProperty.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testProperty.id);

      // Verify property is deleted
      const getResponse = await request
        .get(`/api/properties/${testProperty.id}`)
        .expect(404);
    });

    it('should reject deletion by employee', async () => {
      // Create a new property for deletion test
      const createResponse = await request
        .post('/api/properties')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Property for Delete Test',
          description: 'Test',
          priceEuro: 150000,
          type: 'apartment',
          address: 'Via Delete 1',
          city: 'Delete City',
          region: 'Delete Region',
          postalCode: '99999',
          bedrooms: 1,
          bathrooms: 1,
          area: 50,
        });

      const propertyToDelete = createResponse.body.data;

      const response = await request
        .delete(`/api/properties/${propertyToDelete.id}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});
