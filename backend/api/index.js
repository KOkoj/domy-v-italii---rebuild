// Full Italian Real Estate API - Serverless Function
import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

let handler;
let app;
let prisma;

export default async (req, res) => {
  try {
    console.log('=== API Request ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    // Set CORS headers first
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      console.log('Handling OPTIONS request');
      return res.status(200).end();
    }
    
    // Initialize the app and handler if not already done
    if (!handler) {
      console.log('=== Initializing Express app and database ===');
      
      // Check database URL
      if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL not found in environment variables');
        return res.status(500).json({
          error: 'Database configuration missing',
          message: 'DATABASE_URL environment variable not set',
          timestamp: new Date().toISOString()
        });
      }
      
      console.log('DATABASE_URL found, initializing Prisma...');
      
      // Initialize Prisma with error handling
      try {
        prisma = new PrismaClient();
        console.log('Prisma initialized successfully');
        
        // Test database connection
        await prisma.$connect();
        console.log('Database connection successful');
      } catch (dbError) {
        console.error('Database connection failed:', dbError);
        return res.status(500).json({
          error: 'Database connection failed',
          message: dbError.message,
          timestamp: new Date().toISOString()
        });
      }
      
      // Create Express app
      console.log('Creating Express app...');
      app = express();
      
      // Basic middleware
      app.use(cors());
      app.use(express.json());
      
      // Health check endpoints
      app.get('/', (req, res) => {
        console.log('Root endpoint accessed');
        res.json({
          success: true,
          message: 'Italian Real Estate API',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          database: !!process.env.DATABASE_URL
        });
      });
      
      app.get('/health', (req, res) => {
        console.log('Health endpoint accessed');
        res.json({
          success: true,
          message: 'API is healthy',
          timestamp: new Date().toISOString(),
          env: process.env.NODE_ENV || 'production',
          database: !!process.env.DATABASE_URL
        });
      });
      
      app.get('/api/health', (req, res) => {
        console.log('API health endpoint accessed');
        res.json({ 
          ok: true,
          database: !!prisma,
          timestamp: new Date().toISOString()
        });
      });
      
      // Properties endpoint with database
      app.get('/api/properties', async (req, res) => {
        console.log('=== Properties endpoint accessed ===');
        try {
          if (!prisma) {
            throw new Error('Prisma not initialized');
          }
          
          console.log('Querying properties from database...');
          const properties = await prisma.property.findMany({
            take: 10,
            include: {
              images: true,
              _count: {
                select: { inquiries: true }
              }
            }
          });
          
          console.log(`Found ${properties.length} properties`);
          
          res.json({
            success: true,
            data: {
              items: properties,
              total: properties.length
            },
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Properties error:', error);
          res.status(500).json({
            success: false,
            error: 'Failed to fetch properties',
            message: error.message,
            timestamp: new Date().toISOString()
          });
        }
      });
      
      // Auth login endpoint
      app.post('/api/auth/login', async (req, res) => {
        console.log('=== Login endpoint accessed ===');
        try {
          const { email, password } = req.body;
          console.log('Login attempt for email:', email);
          
          if (!email || !password) {
            return res.status(400).json({
              success: false,
              error: 'Email and password required'
            });
          }
          
          if (!prisma) {
            throw new Error('Prisma not initialized');
          }
          
          // Find user
          console.log('Searching for user in database...');
          const user = await prisma.user.findUnique({
            where: { email }
          });
          
          if (!user) {
            console.log('User not found');
            return res.status(401).json({
              success: false,
              error: 'Invalid credentials'
            });
          }
          
          console.log('User found:', user.email);
          
          // For demo, just return success (you can add bcrypt later)
          const { password: _, ...safeUser } = user;
          
          res.json({
            success: true,
            data: {
              user: safeUser,
              token: 'demo-token-' + Date.now()
            },
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Login error:', error);
          res.status(500).json({
            success: false,
            error: 'Login failed',
            message: error.message,
            timestamp: new Date().toISOString()
          });
        }
      });
      
      // Error handler
      app.use((error, req, res, next) => {
        console.error('Express error:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      });
      
      // Create serverless handler
      console.log('Creating serverless handler...');
      handler = serverless(app);
      console.log('=== Express app initialized successfully ===');
    }
    
    console.log('Handling request with Express app...');
    // Handle the request with the full Express app
    return handler(req, res);
    
  } catch (error) {
    console.error('=== API Error ===', error);
    
    return res.status(500).json({
      error: 'Backend initialization error',
      message: error.message,
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};