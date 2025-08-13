import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/db/prisma.js';
import { hashPassword } from '../src/utils/password.js';

const request = supertest(app);

describe('Dashboard Endpoints', () => {
  let adminToken: string;
  let employeeToken: string;
  let testAdmin: any;
  let testEmployee: any;

  beforeAll(async () => {
    // Create test users
    testAdmin = await prisma.user.create({
      data: {
        email: 'test-dash-admin@example.com',
        name: 'Dashboard Test Admin',
        password: await hashPassword('password123'),
        role: 'ADMIN',
        isActive: true,
      },
    });

    testEmployee = await prisma.user.create({
      data: {
        email: 'test-dash-employee@example.com',
        name: 'Dashboard Test Employee',
        password: await hashPassword('password123'),
        role: 'EMPLOYEE',
        isActive: true,
      },
    });

    // Get auth tokens
    const adminLogin = await request
      .post('/api/auth/login')
      .send({
        email: 'test-dash-admin@example.com',
        password: 'password123',
      });
    adminToken = adminLogin.body.data.token;

    const employeeLogin = await request
      .post('/api/auth/login')
      .send({
        email: 'test-dash-employee@example.com',
        password: 'password123',
      });
    employeeToken = employeeLogin.body.data.token;
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-dash-' } },
    });
  });

  describe('GET /api/dashboard', () => {
    it('should return dashboard data for authenticated admin', async () => {
      const response = await request
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('stats');
      expect(response.body.data).toHaveProperty('activity');

      // Verify stats structure
      const stats = response.body.data.stats;
      expect(stats).toHaveProperty('propertiesCount');
      expect(stats).toHaveProperty('draftsCount');
      expect(stats).toHaveProperty('inquiriesTodayCount');
      expect(stats).toHaveProperty('inquiriesWeekCount');
      expect(typeof stats.propertiesCount).toBe('number');
      expect(typeof stats.draftsCount).toBe('number');
      expect(typeof stats.inquiriesTodayCount).toBe('number');
      expect(typeof stats.inquiriesWeekCount).toBe('number');

      // Verify activity structure
      const activity = response.body.data.activity;
      expect(activity).toHaveProperty('properties');
      expect(activity).toHaveProperty('blog');
      expect(activity).toHaveProperty('inquiries');
      expect(Array.isArray(activity.properties)).toBe(true);
      expect(Array.isArray(activity.blog)).toBe(true);
      expect(Array.isArray(activity.inquiries)).toBe(true);
    });

    it('should return dashboard data for authenticated employee', async () => {
      const response = await request
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('stats');
      expect(response.body.data).toHaveProperty('activity');
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request
        .get('/api/dashboard')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Unauthorized');
    });

    it('should reject invalid token', async () => {
      const response = await request
        .get('/api/dashboard')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/dashboard/stats', () => {
    it('should return only stats for authenticated user', async () => {
      const response = await request
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('propertiesCount');
      expect(response.body.data).toHaveProperty('draftsCount');
      expect(response.body.data).toHaveProperty('inquiriesTodayCount');
      expect(response.body.data).toHaveProperty('inquiriesWeekCount');
      expect(response.body.data).not.toHaveProperty('activity');
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request
        .get('/api/dashboard/stats')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/dashboard/activity', () => {
    it('should return only activity for authenticated user', async () => {
      const response = await request
        .get('/api/dashboard/activity')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('properties');
      expect(response.body.data).toHaveProperty('blog');
      expect(response.body.data).toHaveProperty('inquiries');
      expect(response.body.data).not.toHaveProperty('propertiesCount');

      // Verify activity items have expected structure
      if (response.body.data.properties.length > 0) {
        const property = response.body.data.properties[0];
        expect(property).toHaveProperty('id');
        expect(property).toHaveProperty('title');
        expect(property).toHaveProperty('slug');
        expect(property).toHaveProperty('createdAt');
      }

      if (response.body.data.blog.length > 0) {
        const blogPost = response.body.data.blog[0];
        expect(blogPost).toHaveProperty('id');
        expect(blogPost).toHaveProperty('title');
        expect(blogPost).toHaveProperty('slug');
        expect(blogPost).toHaveProperty('author');
      }

      if (response.body.data.inquiries.length > 0) {
        const inquiry = response.body.data.inquiries[0];
        expect(inquiry).toHaveProperty('id');
        expect(inquiry).toHaveProperty('name');
        expect(inquiry).toHaveProperty('email');
        expect(inquiry).toHaveProperty('status');
      }
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request
        .get('/api/dashboard/activity')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
