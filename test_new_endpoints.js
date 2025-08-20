#!/usr/bin/env node

import handler from './backend/api/index.js';

// Mock request and response objects
const createMockReq = (method, url, body = {}) => ({
  method,
  url,
  body: JSON.stringify(body)
});

const createMockRes = () => {
  const res = {
    status: (code) => {
      res.statusCode = code;
      return res;
    },
    json: (data) => {
      res.data = data;
      return res;
    },
    setHeader: () => res,
    end: () => res
  };
  return res;
};

// Test function
const testEndpoint = async (method, url, body = {}) => {
  const req = createMockReq(method, url, body);
  const res = createMockRes();
  
  try {
    await handler(req, res);
    return { status: res.statusCode, data: res.data };
  } catch (error) {
    return { status: 500, error: error.message };
  }
};

// Run tests
const runTests = async () => {
  console.log('🧪 Testing New Endpoints Implementation');
  console.log('=====================================');
  
  // Test Blog endpoints
  console.log('\n📖 Testing Blog Endpoints:');
  const blogList = await testEndpoint('GET', '/api/blog?page=1&limit=10');
  console.log(`GET /api/blog -> ${blogList.status} ${blogList.data?.success ? '✅' : '❌'}`);
  
  // Test Inquiries endpoints
  console.log('\n📨 Testing Inquiries Endpoints:');
  const inquiriesList = await testEndpoint('GET', '/api/inquiries?page=1&limit=10');
  console.log(`GET /api/inquiries -> ${inquiriesList.status} ${inquiriesList.data?.success ? '✅' : '❌'}`);
  
  // Test Settings endpoints
  console.log('\n⚙️ Testing Settings Endpoints:');
  const settingsGet = await testEndpoint('GET', '/api/settings');
  console.log(`GET /api/settings -> ${settingsGet.status} ${settingsGet.data?.success ? '✅' : '❌'}`);
  
  const settingsUpdate = await testEndpoint('PUT', '/api/settings', {
    siteName: 'Italian Real Estate',
    currency: 'EUR'
  });
  console.log(`PUT /api/settings -> ${settingsUpdate.status} ${settingsUpdate.data?.success ? '✅' : '❌'}`);
  
  // Test Root endpoint
  console.log('\n🏠 Testing Root Endpoint:');
  const root = await testEndpoint('GET', '/api');
  console.log(`GET /api -> ${root.status} ${root.data?.success ? '✅' : '❌'}`);
  console.log(`Version: ${root.data?.version}`);
  console.log(`Endpoints: ${root.data?.endpoints?.join(', ')}`);
  
  console.log('\n✨ All endpoint tests completed!');
};

runTests().catch(console.error);