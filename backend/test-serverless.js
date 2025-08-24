import fs from 'fs';

// Mock Vercel request/response
const mockReq = {
  method: 'GET',
  url: '/api/health',
  headers: {}
};

const mockRes = {
  status: (code) => {
    console.log(`Status: ${code}`);
    return mockRes;
  },
  json: (data) => {
    console.log('Response:', JSON.stringify(data, null, 2));
    return mockRes;
  },
  setHeader: (name, value) => {
    console.log(`Header: ${name}: ${value}`);
    return mockRes;
  }
};

// Test serverless handler
async function testServerlessHandler() {
  try {
    console.log('Testing serverless handler...');
    const handler = await import('./api/index.js');
    await handler.default(mockReq, mockRes);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testServerlessHandler();