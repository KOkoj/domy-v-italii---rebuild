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
    console.log('API Request:', req.method, req.url);
    
    // Set CORS headers first
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Initialize the app and handler if not already done
    if (!handler) {
      console.log('Initializing Express app and database...');
      
      // Initialize Prisma
      prisma = new PrismaClient();
      
      // Create Express app
      app = express();
      
      // Basic middleware
      app.use(cors());
      app.use(express.json());
      
      // Health check endpoints
      app.get('/', (req, res) => {
        res.json({
          success: true,
          message: 'Italian Real Estate API',
          version: '1.0.0',
          timestamp: new Date().toISOString()
        });
      });
      
      app.get('/health', (req, res) => {
        res.json({
          success: true,
          message: 'API is healthy',
          timestamp: new Date().toISOString(),
          env: process.env.NODE_ENV || 'production'
        });
      });
      
      app.get('/api/health', (req, res) => {
        res.json({ ok: true });
      });
      
      // Properties endpoint with database
      app.get('/api/properties', async (req, res) => {
        try {
          const properties = await prisma.property.findMany({
            take: 10,
            include: {
              images: true,
              _count: {
                select: { inquiries: true }
              }
            }
          });
          
          res.json({
            success: true,
            data: {
              items: properties,
              total: properties.length
            }
          });
        } catch (error) {
          console.error('Properties error:', error);
          res.status(500).json({
            success: false,
            error: 'Failed to fetch properties',
            message: error.message
          });
        }
      });
      
      // Auth login endpoint
      app.post('/api/auth/login', async (req, res) => {
        try {
          const { email, password } = req.body;
          
          if (!email || !password) {
            return res.status(400).json({
              success: false,
              error: 'Email and password required'
            });
          }
          
          // Find user
          const user = await prisma.user.findUnique({
            where: { email }
          });
          
          if (!user) {
            return res.status(401).json({
              success: false,
              error: 'Invalid credentials'
            });
          }
          
          // For demo, just return success (you can add bcrypt later)
          const { password: _, ...safeUser } = user;
          
          res.json({
            success: true,
            data: {
              user: safeUser,
              token: 'demo-token-' + Date.now()
            }
          });
        } catch (error) {
          console.error('Login error:', error);
          res.status(500).json({
            success: false,
            error: 'Login failed',
            message: error.message
          });
        }
      });
      
      // Error handler
      app.use((error, req, res, next) => {
        console.error('Express error:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          message: error.message
        });
      });
      
      // Create serverless handler
      handler = serverless(app);
      console.log('Express app initialized successfully');
    }
    
    // Handle the request with the full Express app
    return handler(req, res);
    
  } catch (error) {
    console.error('API Error:', error);
    
    return res.status(500).json({
      error: 'Backend initialization error',
      message: error.message,
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};