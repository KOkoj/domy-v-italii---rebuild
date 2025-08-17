// Simplified Italian Real Estate API - Serverless Function
import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

let handler;
let app;
let prisma;

export default async (req, res) => {
  try {
    console.log('Request:', req.method, req.url);
    
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
      console.log('Initializing app...');
      
      // Check for DATABASE_URL
      const hasDatabase = !!process.env.DATABASE_URL;
      console.log('Database URL present:', hasDatabase);
      
      // Initialize Prisma only if DATABASE_URL exists
      if (hasDatabase) {
        try {
          prisma = new PrismaClient({
            datasources: {
              db: {
                url: process.env.DATABASE_URL,
              },
            },
          });
          console.log('Prisma initialized');
        } catch (err) {
          console.error('Prisma init error:', err.message);
          prisma = null;
        }
      }
      
      // Create Express app
      app = express();
      app.use(cors());
      app.use(express.json());
      
      // Simple endpoints without database dependency
      app.get('/', (req, res) => {
        res.json({
          success: true,
          message: 'Italian Real Estate API',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          database: hasDatabase
        });
      });
      
      app.get('/api/health', (req, res) => {
        res.json({ 
          ok: true,
          database: hasDatabase,
          timestamp: new Date().toISOString()
        });
      });
      
      // Properties endpoint with timeout
      app.get('/api/properties', async (req, res) => {
        if (!prisma) {
          return res.json({
            success: true,
            data: {
              items: [],
              total: 0,
              note: 'Database not configured'
            },
            timestamp: new Date().toISOString()
          });
        }
        
        try {
          // Add timeout to prevent hanging
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Database query timeout')), 5000);
          });
          
          const queryPromise = prisma.property.findMany({
            take: 5, // Reduce to 5 for faster response
            select: {
              id: true,
              title: true,
              slug: true,
              price: true,
              isActive: true
            }
          });
          
          const properties = await Promise.race([queryPromise, timeoutPromise]);
          
          res.json({
            success: true,
            data: {
              items: properties,
              total: properties.length
            },
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Properties error:', error.message);
          res.json({
            success: true,
            data: {
              items: [],
              total: 0,
              error: error.message
            },
            timestamp: new Date().toISOString()
          });
        }
      });
      
      // Simple auth endpoint
      app.post('/api/auth/login', async (req, res) => {
        const { email, password } = req.body;
        
        if (!email || !password) {
          return res.status(400).json({
            success: false,
            error: 'Email and password required'
          });
        }
        
        if (!prisma) {
          return res.json({
            success: false,
            error: 'Database not configured'
          });
        }
        
        try {
          // Add timeout
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Auth query timeout')), 3000);
          });
          
          const userPromise = prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              name: true,
              isActive: true
            }
          });
          
          const user = await Promise.race([userPromise, timeoutPromise]);
          
          if (!user) {
            return res.status(401).json({
              success: false,
              error: 'Invalid credentials'
            });
          }
          
          res.json({
            success: true,
            data: {
              user,
              token: 'demo-token-' + Date.now()
            }
          });
        } catch (error) {
          console.error('Auth error:', error.message);
          res.status(500).json({
            success: false,
            error: 'Authentication failed',
            message: error.message
          });
        }
      });
      
      // Create serverless handler
      handler = serverless(app);
      console.log('App initialized');
    }
    
    // Handle the request
    return handler(req, res);
    
  } catch (error) {
    console.error('API Error:', error.message);
    
    return res.status(500).json({
      error: 'Backend error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};