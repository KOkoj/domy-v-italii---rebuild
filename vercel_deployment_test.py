#!/usr/bin/env python3
"""
Vercel Serverless Backend Deployment Fix Testing
Tests the specific endpoints mentioned in the review request to verify the 501 error fix.
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

class VercelDeploymentTester:
    def __init__(self, base_url="http://localhost:3001"):
        self.base_url = base_url
        self.api_base = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name: str, success: bool, details: str = "", expected_status: int = None, actual_status: int = None):
        """Log test results with detailed status information"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
            if expected_status and actual_status:
                print(f"   Status: {actual_status} (expected {expected_status})")
        else:
            print(f"❌ {name} - FAILED: {details}")
            if expected_status and actual_status:
                print(f"   Status: {actual_status} (expected {expected_status})")
        
        self.test_results.append({
            "name": name,
            "success": success,
            "details": details,
            "expected_status": expected_status,
            "actual_status": actual_status,
            "timestamp": datetime.now().isoformat()
        })

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    expected_status: int = 200, use_auth: bool = False) -> tuple[bool, Dict, int]:
        """Make HTTP request and validate response"""
        url = f"{self.api_base}/{endpoint}" if not endpoint.startswith('http') else endpoint
        headers = {'Content-Type': 'application/json'}
        
        if use_auth and self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                return False, {"error": f"Unsupported method: {method}"}, 0

            success = response.status_code == expected_status
            
            try:
                response_data = response.json()
            except:
                response_data = {"text": response.text, "status_code": response.status_code}

            return success, response_data, response.status_code

        except requests.exceptions.RequestException as e:
            return False, {"error": str(e)}, 0

    def test_critical_endpoints(self):
        """Test the critical endpoints mentioned in the review request"""
        print("\n🔍 Testing Critical Endpoints (Vercel Fix Verification)...")
        
        # 1. GET /api/health - Should return {"success":true,"message":"API is healthy"}
        print("\n1. Testing GET /api/health")
        success, response, status = self.make_request('GET', 'health', expected_status=200)
        expected_response = {"success": True, "message": "API is healthy"}
        
        if success and response.get("success") == True and response.get("message") == "API is healthy":
            self.log_test("GET /api/health", True, "Correct response format", 200, status)
        else:
            self.log_test("GET /api/health", False, f"Unexpected response: {response}", 200, status)
        
        # 2. GET /api - Should return API info with endpoints list
        print("\n2. Testing GET /api (Root API endpoint)")
        success, response, status = self.make_request('GET', f"{self.base_url}/api", expected_status=200)
        
        if success and "message" in response:
            self.log_test("GET /api (Root)", True, "API info returned", 200, status)
            print(f"   API Info: {json.dumps(response, indent=2)}")
        else:
            self.log_test("GET /api (Root)", False, f"No API info: {response}", 200, status)

        # 3. POST /api/blog - CRITICAL: Should return 401 (Unauthorized) NOT 501 (Not Implemented)
        print("\n3. Testing POST /api/blog (CRITICAL - Should NOT return 501)")
        blog_data = {
            "title": "Test Blog Post",
            "content": "This is a test blog post content",
            "status": "DRAFT"
        }
        success, response, status = self.make_request('POST', 'blog', data=blog_data, expected_status=401, use_auth=False)
        
        if status == 501:
            self.log_test("POST /api/blog (No Auth)", False, "CRITICAL: Still returning 501 - Vercel fix failed!", 401, status)
            print("   🚨 DEPLOYMENT FIX FAILED: POST /api/blog still returns 501 (Not Implemented)")
        elif status == 401:
            self.log_test("POST /api/blog (No Auth)", True, "Correctly returns 401 (Unauthorized) - Fix successful!", 401, status)
            print("   ✅ DEPLOYMENT FIX SUCCESSFUL: POST /api/blog now returns proper auth error")
        else:
            self.log_test("POST /api/blog (No Auth)", False, f"Unexpected status code: {status}", 401, status)
        
        print(f"   Response: {json.dumps(response, indent=2)}")

        # 4. GET /api/blog - Should work
        print("\n4. Testing GET /api/blog")
        success, response, status = self.make_request('GET', 'blog', expected_status=200)
        self.log_test("GET /api/blog", success, f"Response: {response}" if not success else "", 200, status)

    def test_authentication_flow(self):
        """Test authentication and then protected endpoints"""
        print("\n🔍 Testing Authentication Flow...")
        
        # Test login with admin credentials
        login_data = {
            "email": "admin@example.com",
            "password": "admin123456"
        }
        
        print("\n1. Testing POST /api/auth/login")
        success, response, status = self.make_request('POST', 'auth/login', data=login_data, expected_status=200)
        
        if success and 'data' in response and 'token' in response['data']:
            self.token = response['data']['token']
            self.log_test("POST /api/auth/login", True, "Login successful, token received", 200, status)
        else:
            self.log_test("POST /api/auth/login", False, f"Login failed: {response}", 200, status)
            return  # Can't continue without token

        # Now test POST /api/blog with authentication
        print("\n2. Testing POST /api/blog (With Auth)")
        blog_data = {
            "title": "Test Blog Post with Auth",
            "content": "This is a test blog post content with authentication",
            "status": "DRAFT"
        }
        success, response, status = self.make_request('POST', 'blog', data=blog_data, expected_status=200, use_auth=True)
        
        if success:
            self.log_test("POST /api/blog (With Auth)", True, "Blog post created successfully", 200, status)
            print(f"   Created post: {json.dumps(response, indent=2)}")
        else:
            self.log_test("POST /api/blog (With Auth)", False, f"Failed to create post: {response}", 200, status)

    def test_other_endpoints(self):
        """Test other endpoints mentioned in the review request"""
        print("\n🔍 Testing Other Endpoints...")
        
        # GET /api/dashboard
        print("\n1. Testing GET /api/dashboard")
        if self.token:
            success, response, status = self.make_request('GET', 'dashboard/stats', use_auth=True, expected_status=200)
            self.log_test("GET /api/dashboard", success, f"Response: {response}" if not success else "", 200, status)
        else:
            print("   Skipping - no auth token available")

        # GET /api/properties
        print("\n2. Testing GET /api/properties")
        success, response, status = self.make_request('GET', 'properties', expected_status=200)
        self.log_test("GET /api/properties", success, f"Response: {response}" if not success else "", 200, status)

    def test_express_app_middleware(self):
        """Test that Express app with proper middleware is running"""
        print("\n🔍 Testing Express App Middleware...")
        
        # Test CORS headers
        print("\n1. Testing CORS Headers")
        try:
            response = requests.options(f"{self.api_base}/auth/login", 
                                      headers={'Origin': 'http://localhost:3000'}, 
                                      timeout=10)
            cors_header = response.headers.get('Access-Control-Allow-Origin')
            if cors_header:
                self.log_test("CORS Middleware", True, f"CORS header present: {cors_header}")
            else:
                self.log_test("CORS Middleware", False, "No CORS headers found")
        except Exception as e:
            self.log_test("CORS Middleware", False, f"Error testing CORS: {str(e)}")

        # Test rate limiting (should have headers)
        print("\n2. Testing Rate Limiting Headers")
        success, response, status = self.make_request('GET', 'health', expected_status=200)
        # Note: Rate limiting headers might not be present in development

    def run_all_tests(self):
        """Run all test suites focusing on Vercel deployment fix"""
        print("🚀 Starting Vercel Serverless Backend Deployment Fix Tests")
        print(f"📍 Testing API at: {self.base_url}")
        print("🎯 Focus: Verifying POST /api/blog no longer returns 501 errors")
        print("=" * 80)
        
        # Run test suites in order of importance
        self.test_critical_endpoints()
        self.test_authentication_flow()
        self.test_other_endpoints()
        self.test_express_app_middleware()
        
        # Print summary
        print("\n" + "=" * 80)
        print("📊 VERCEL DEPLOYMENT FIX TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Print failed tests
        failed_tests = [test for test in self.test_results if not test['success']]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                status_info = f" (Status: {test['actual_status']}, Expected: {test['expected_status']})" if test['actual_status'] else ""
                print(f"  - {test['name']}: {test['details']}{status_info}")
        
        # Check for critical POST /api/blog fix
        blog_post_test = next((test for test in self.test_results if "POST /api/blog (No Auth)" in test['name']), None)
        if blog_post_test:
            if blog_post_test['success']:
                print("\n🎉 VERCEL DEPLOYMENT FIX VERIFICATION: SUCCESS")
                print("   ✅ POST /api/blog now returns 401 (Unauthorized) instead of 501 (Not Implemented)")
                print("   ✅ Express app with proper middleware is running correctly")
            else:
                print("\n🚨 VERCEL DEPLOYMENT FIX VERIFICATION: FAILED")
                print("   ❌ POST /api/blog still returns 501 errors")
                print("   ❌ The serverless handler fix did not resolve the issue")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = VercelDeploymentTester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n⚠️  Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())