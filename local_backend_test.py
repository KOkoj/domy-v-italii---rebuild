#!/usr/bin/env python3
"""
Local Backend API Testing for Italian Real Estate Application
Tests all major API endpoints including the newly implemented blog, inquiries, and settings endpoints.
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

class LocalItalianRealEstateAPITester:
    def __init__(self, base_url="http://localhost:3001"):
        self.base_url = base_url
        self.api_base = f"{base_url}/api"
        self.token = None
        self.refresh_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "name": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    expected_status: int = 200, use_auth: bool = False) -> tuple[bool, Dict]:
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
                return False, {"error": f"Unsupported method: {method}"}

            success = response.status_code == expected_status
            
            try:
                response_data = response.json()
            except:
                response_data = {"text": response.text, "status_code": response.status_code}

            if not success:
                print(f"   Status: {response.status_code} (expected {expected_status})")
                print(f"   Response: {json.dumps(response_data, indent=2)}")

            return success, response_data

        except requests.exceptions.RequestException as e:
            return False, {"error": str(e)}

    def test_health_endpoints(self):
        """Test health check endpoints"""
        print("\n🔍 Testing Health Endpoints...")
        
        # Test root health endpoint
        success, _ = self.make_request('GET', f"{self.base_url}/health", expected_status=200)
        self.log_test("Root Health Check (/health)", success)
        
        # Test API health endpoint
        success, _ = self.make_request('GET', 'health', expected_status=200)
        self.log_test("API Health Check (/api/health)", success)
        
        # Test root endpoint
        success, _ = self.make_request('GET', f"{self.base_url}/", expected_status=200)
        self.log_test("Root Endpoint (/)", success)

    def test_authentication(self):
        """Test authentication endpoints"""
        print("\n🔍 Testing Authentication...")
        
        # Test login with admin credentials
        login_data = {
            "email": "admin@example.com",
            "password": "admin123456"
        }
        
        success, response = self.make_request('POST', 'auth/login', data=login_data, expected_status=200)
        
        if success and 'data' in response:
            data = response['data']
            if 'token' in data:
                self.token = data['token']
                if 'refreshToken' in data:
                    self.refresh_token = data['refreshToken']
                self.log_test("Admin Login", True)
            else:
                self.log_test("Admin Login", False, "No token in response")
        else:
            self.log_test("Admin Login", False, f"Login failed: {response}")

        # Test /me endpoint if we have a token
        if self.token:
            success, response = self.make_request('GET', 'auth/me', use_auth=True, expected_status=200)
            self.log_test("Get Current User (/auth/me)", success)

    def test_dashboard_endpoints(self):
        """Test dashboard endpoints"""
        print("\n🔍 Testing Dashboard Endpoints...")
        
        if self.token:
            success, response = self.make_request('GET', 'dashboard/stats', use_auth=True, expected_status=200)
            self.log_test("Dashboard Stats", success)
            
            if success and response:
                print(f"   Dashboard data: {json.dumps(response, indent=2)}")

    def test_properties_endpoints(self):
        """Test properties endpoints"""
        print("\n🔍 Testing Properties Endpoints...")
        
        # Test list properties (public endpoint)
        success, response = self.make_request('GET', 'properties', expected_status=200)
        self.log_test("List Properties (Public)", success)
        
        if success and response:
            print(f"   Properties count: {len(response.get('data', {}).get('properties', []))}")

    def test_blog_endpoints(self):
        """Test blog endpoints - these should now work"""
        print("\n🔍 Testing Blog Endpoints...")
        
        # Test list blog posts (public)
        success, response = self.make_request('GET', 'blog', expected_status=200)
        self.log_test("List Blog Posts (Public)", success)
        
        if success and response:
            print(f"   Blog posts: {json.dumps(response, indent=2)}")
        
        # Test create blog post (protected)
        if self.token:
            blog_data = {
                "title": "Test Blog Post",
                "content": "This is a test blog post content",
                "excerpt": "Test excerpt",
                "status": "PUBLISHED"
            }
            success, response = self.make_request('POST', 'blog', data=blog_data, expected_status=201, use_auth=True)
            self.log_test("Create Blog Post (Protected)", success)

    def test_inquiries_endpoints(self):
        """Test inquiries endpoints - these should now work"""
        print("\n🔍 Testing Inquiries Endpoints...")
        
        # Test list inquiries (protected)
        if self.token:
            success, response = self.make_request('GET', 'inquiries', use_auth=True, expected_status=200)
            self.log_test("List Inquiries (Protected)", success)
            
            if success and response:
                print(f"   Inquiries: {json.dumps(response, indent=2)}")
        
        # Test create inquiry (public)
        inquiry_data = {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "+39 123 456 7890",
            "message": "I'm interested in your properties",
            "propertyId": None
        }
        success, response = self.make_request('POST', 'inquiries', data=inquiry_data, expected_status=201)
        self.log_test("Create Inquiry (Public)", success)

    def test_settings_endpoints(self):
        """Test settings endpoints - these should now work"""
        print("\n🔍 Testing Settings Endpoints...")
        
        if self.token:
            # Test get settings
            success, response = self.make_request('GET', 'settings', use_auth=True, expected_status=200)
            self.log_test("Get Settings (Protected)", success)
            
            if success and response:
                print(f"   Settings: {json.dumps(response, indent=2)}")
            
            # Test update settings
            settings_data = {
                "siteName": "Italian Real Estate Test",
                "siteDescription": "Test description",
                "contactEmail": "test@example.com",
                "contactPhone": "+39 123 456 7890"
            }
            success, response = self.make_request('PUT', 'settings', data=settings_data, expected_status=200, use_auth=True)
            self.log_test("Update Settings (Protected)", success)

    def test_users_endpoints(self):
        """Test users endpoints"""
        print("\n🔍 Testing Users Endpoints...")
        
        if self.token:
            success, response = self.make_request('GET', 'users', use_auth=True, expected_status=200)
            self.log_test("List Users (Protected)", success)

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting Local Italian Real Estate API Tests")
        print(f"📍 Testing API at: {self.base_url}")
        print("=" * 60)
        
        # Run test suites
        self.test_health_endpoints()
        self.test_authentication()
        self.test_dashboard_endpoints()
        self.test_properties_endpoints()
        self.test_blog_endpoints()
        self.test_inquiries_endpoints()
        self.test_settings_endpoints()
        self.test_users_endpoints()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Print failed tests
        failed_tests = [test for test in self.test_results if not test['success']]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"  - {test['name']}: {test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = LocalItalianRealEstateAPITester()
    
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