#!/usr/bin/env python3
"""
Dashboard Integration Testing
Tests the specific API endpoints used by the Italian Real Estate Dashboard
"""

import requests
import json
from datetime import datetime

class DashboardIntegrationTester:
    def __init__(self, base_url="https://domy-backend.vercel.app"):
        self.base_url = base_url
        self.api_base = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")

    def make_request(self, method: str, endpoint: str, data=None, use_auth=False):
        """Make HTTP request"""
        url = f"{self.api_base}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if use_auth and self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            
            return response.status_code, response.json() if response.content else {}
        except Exception as e:
            return 0, {"error": str(e)}

    def test_authentication_flow(self):
        """Test the authentication flow used by the dashboard"""
        print("\n🔐 Testing Authentication Flow...")
        
        # Test login
        login_data = {"email": "admin@example.com", "password": "admin123456"}
        status, response = self.make_request('POST', 'auth/login', data=login_data)
        
        if status == 200 and response.get('success') and 'data' in response:
            self.token = response['data'].get('token')
            self.log_test("Admin Login", True)
            
            # Test /auth/me endpoint
            status, response = self.make_request('GET', 'auth/me', use_auth=True)
            success = status == 200 and response.get('success')
            self.log_test("Get Current User (/auth/me)", success)
            
            if success:
                user_data = response.get('data', {})
                print(f"   User: {user_data.get('name')} ({user_data.get('email')})")
                print(f"   Role: {user_data.get('role')}")
            
            return True
        else:
            self.log_test("Admin Login", False, f"Status: {status}, Response: {response}")
            return False

    def test_dashboard_data_endpoints(self):
        """Test the endpoints used by the dashboard"""
        print("\n📊 Testing Dashboard Data Endpoints...")
        
        if not self.token:
            print("❌ No authentication token - skipping dashboard tests")
            return
        
        # Test dashboard endpoint (primary)
        status, response = self.make_request('GET', 'dashboard', use_auth=True)
        if status == 200 and response.get('success'):
            self.log_test("Dashboard Endpoint", True)
            
            data = response.get('data', {})
            stats = data.get('stats', {})
            activity = data.get('activity', {})
            
            print(f"   📈 Stats:")
            print(f"     - Total Properties: {stats.get('propertiesCount', 0)}")
            print(f"     - Active Properties: {stats.get('activePropertiesCount', 0)}")
            print(f"     - Draft Posts: {stats.get('draftsCount', 0)}")
            print(f"     - Inquiries (Week): {stats.get('inquiriesWeekCount', 0)}")
            
            print(f"   🏛️ Activity:")
            print(f"     - Properties: {len(activity.get('properties', []))}")
            print(f"     - Blog Posts: {len(activity.get('blog', []))}")
            print(f"     - Inquiries: {len(activity.get('inquiries', []))}")
            
            # Check for Italian property data
            properties = activity.get('properties', [])
            italian_cities = ['rome', 'milan', 'florence', 'umbria', 'cinque terre']
            italian_properties = []
            
            for prop in properties:
                city = prop.get('city', '').lower()
                title = prop.get('title', '').lower()
                if any(italian_city in city or italian_city in title for italian_city in italian_cities):
                    italian_properties.append(f"{prop.get('title')} in {prop.get('city')}")
            
            if italian_properties:
                print(f"   🇮🇹 Italian Properties Found:")
                for prop in italian_properties:
                    print(f"     - {prop}")
                self.log_test("Italian Property Data", True)
            else:
                self.log_test("Italian Property Data", False, "No Italian cities found in properties")
                
        else:
            self.log_test("Dashboard Endpoint", False, f"Status: {status}")
            
            # Test fallback endpoints (what dashboard uses as fallback)
            print("   🔄 Testing fallback endpoints...")
            
            # Test properties endpoint (fallback)
            status, response = self.make_request('GET', 'properties?limit=5')
            if status == 200 and response.get('success'):
                self.log_test("Properties Fallback", True)
                
                properties = response.get('data', {}).get('items', [])
                print(f"     - Found {len(properties)} properties")
                
                # Check for Italian content
                italian_found = False
                for prop in properties:
                    city = prop.get('city', '').lower()
                    title = prop.get('title', '').lower()
                    if any(city_name in city or city_name in title for city_name in ['rome', 'milan', 'florence']):
                        italian_found = True
                        print(f"     - Italian property: {prop.get('title')} in {prop.get('city')}")
                
                self.log_test("Italian Properties in Fallback", italian_found)
            else:
                self.log_test("Properties Fallback", False, f"Status: {status}")

    def test_cors_and_frontend_integration(self):
        """Test CORS configuration for frontend integration"""
        print("\n🌐 Testing CORS and Frontend Integration...")
        
        # Test CORS preflight for the frontend origin
        try:
            headers = {
                'Origin': 'http://localhost:5173',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type,Authorization'
            }
            response = requests.options(f"{self.api_base}/auth/login", headers=headers, timeout=10)
            
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
            }
            
            success = response.status_code in [200, 204] and cors_headers['Access-Control-Allow-Origin']
            self.log_test("CORS Configuration", success)
            
            if success:
                print(f"   Origin: {cors_headers['Access-Control-Allow-Origin']}")
                print(f"   Methods: {cors_headers['Access-Control-Allow-Methods']}")
                print(f"   Headers: {cors_headers['Access-Control-Allow-Headers']}")
            
        except Exception as e:
            self.log_test("CORS Configuration", False, str(e))

    def run_dashboard_tests(self):
        """Run all dashboard integration tests"""
        print("🚀 Starting Dashboard Integration Tests")
        print(f"📍 Testing API at: {self.base_url}")
        print("=" * 60)
        
        # Test authentication first
        auth_success = self.test_authentication_flow()
        
        if auth_success:
            # Test dashboard data endpoints
            self.test_dashboard_data_endpoints()
        
        # Test CORS (doesn't require auth)
        self.test_cors_and_frontend_integration()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 DASHBOARD INTEGRATION TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("\n🎉 All dashboard integration tests passed!")
            print("✅ The Italian Real Estate Dashboard should work correctly")
        else:
            print(f"\n⚠️ {self.tests_run - self.tests_passed} tests failed")
            print("❌ Dashboard may have integration issues")
        
        return self.tests_passed == self.tests_run

def main():
    tester = DashboardIntegrationTester()
    success = tester.run_dashboard_tests()
    return 0 if success else 1

if __name__ == "__main__":
    exit(main())