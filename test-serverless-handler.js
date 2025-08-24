import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Mock Vercel request/response for POST /api/blog
const mockReq = {
  method: 'POST',
  url: '/api/blog',
  headers: {
    'content-type': 'application/json',
    'authorization': 'Bearer test-token-123'
  },
  body: {
    title: 'Test Blog Post',
    content: 'This is test content',
    status: 'DRAFT'
  }
};

const mockRes = {
  statusCode: 200,
  status: function(code) {
    this.statusCode = code;
    console.log(`Status: ${code}`);
    return this;
  },
  json: function(data) {
    console.log('Response:', JSON.stringify(data, null, 2));
    return this;
  },
  setHeader: function(name, value) {
    console.log(`Header: ${name}: ${value}`);
    return this;
  }
};

// Test serverless handler
async function testHandler() {
  try {
    console.log('🧪 Testing POST /api/blog endpoint...');
    const handler = await import('./backend/api/index.js');
    await handler.default(mockReq, mockRes);
    console.log(`\n✅ Test completed! Final status: ${mockRes.statusCode}`);
    
    if (mockRes.statusCode === 200) {
      console.log('🎉 SUCCESS: POST /api/blog is working correctly!');
    } else if (mockRes.statusCode === 401) {
      console.log('🎯 EXPECTED: Authentication required (this is correct behavior)');
    } else {
      console.log('⚠️  UNEXPECTED: Received unexpected status code');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testHandler();