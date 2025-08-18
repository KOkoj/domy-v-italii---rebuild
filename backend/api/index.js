// Italian Real Estate API - Step 1: Add Express back
import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';

let handler;
let app;

export default async (req, res) => {
  console.log('Request:', req.method, req.url);
  
  // Set CORS headers first
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Initialize Express app if not already done
  if (!handler) {
    console.log('Initializing Express app...');
    
    app = express();
    app.use(cors());
    app.use(express.json());
    
    // Health endpoints
    app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Italian Real Estate API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        framework: 'Express + serverless-http'
      });
    });
    
    app.get('/api/health', (req, res) => {
      res.json({ 
        ok: true,
        message: 'Express API working',
        timestamp: new Date().toISOString()
      });
    });
    
    // Properties endpoint with test data
    app.get('/api/properties', (req, res) => {
      const testProperties = [
        {
          id: 'test-1',
          title: 'Beautiful Villa in Rome',
          price: 850000,
          location: 'Rome, Italy',
          bedrooms: 4,
          bathrooms: 3,
          area: 250
        },
        {
          id: 'test-2', 
          title: 'Modern Apartment in Milan',
          price: 650000,
          location: 'Milan, Italy',
          bedrooms: 2,
          bathrooms: 2,
          area: 120
        },
        {
          id: 'test-3',
          title: 'Luxury Penthouse in Florence',
          price: 1200000,
          location: 'Florence, Italy',
          bedrooms: 3,
          bathrooms: 2,
          area: 180
        }
      ];
      
      res.json({
        success: true,
        data: {
          items: testProperties,
          total: testProperties.length,
          note: 'Test data from Express - no database yet'
        },
        timestamp: new Date().toISOString()
      });
    });
    
    // Auth endpoint with test response
    app.post('/api/auth/login', (req, res) => {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password required'
        });
      }
      
      // Test credentials
      if (email === 'admin@example.com' && password === 'admin123456') {
        return res.json({
          success: true,
          data: {
            user: {
              id: 'test-admin-1',
              email: 'admin@example.com',
              name: 'Test Admin',
              role: 'admin'
            },
            token: 'test-jwt-token-' + Date.now()
          },
          note: 'Test authentication - no database yet',
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Try admin@example.com / admin123456'
      });
    });
    
    // Default handler
    app.use('*', (req, res) => {
      res.json({
        message: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
      });
    });
    
    // Create serverless handler
    handler = serverless(app);
    console.log('Express app initialized successfully');
  }
  
  // Handle with Express
  return handler(req, res);
};