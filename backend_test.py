#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Italian Real Estate Application
Tests all major API endpoints including authentication, properties, and health checks.
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

class ItalianRealEstateAPITester:
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

    def test_swagger_docs(self):
        """Test Swagger documentation endpoint"""
        print("\n🔍 Testing API Documentation...")
        
        success, _ = self.make_request('GET', 'docs', expected_status=200)
        self.log_test("Swagger Documentation (/api/docs)", success)

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

        # Test refresh token if available
        if self.refresh_token:
            refresh_data = {"refreshToken": self.refresh_token}
            success, _ = self.make_request('POST', 'auth/refresh', data=refresh_data, expected_status=200)
            self.log_test("Token Refresh", success)

    def test_properties_endpoints(self):
        """Test properties CRUD operations"""
        print("\n🔍 Testing Properties Endpoints...")
        
        # Test list properties (public endpoint)
        success, response = self.make_request('GET', 'properties', expected_status=200)
        self.log_test("List Properties (Public)", success)
        
        # Test list properties with pagination
        success, _ = self.make_request('GET', 'properties?page=1&limit=5', expected_status=200)
        self.log_test("List Properties with Pagination", success)
        
        # Test list properties with filters
        success, _ = self.make_request('GET', 'properties?status=ACTIVE', expected_status=200)
        self.log_test("List Properties with Status Filter", success)
        
        # Test search properties
        success, _ = self.make_request('GET', 'properties?search=apartment', expected_status=200)
        self.log_test("Search Properties", success)

        # Get a property ID for further testing
        property_id = None
        if success and response and 'data' in response and 'properties' in response['data']:
            properties = response['data']['properties']
            if properties and len(properties) > 0:
                property_id = properties[0].get('id')

        # Test get single property (public)
        if property_id:
            success, _ = self.make_request('GET', f'properties/{property_id}', expected_status=200)
            self.log_test("Get Single Property (Public)", success)

        # Test protected endpoints (require authentication)
        if self.token:
            # Test create property
            new_property = {
                "title": "Test Property",
                "description": "A beautiful test property in Italy",
                "priceEuro": 250000,
                "type": "apartment",
                "status": "ACTIVE",
                "address": "Via Test 123",
                "city": "Rome",
                "region": "Lazio",
                "postalCode": "00100",
                "bedrooms": 2,
                "bathrooms": 1,
                "area": 80,
                "features": ["balcony", "parking"]
            }
            
            success, create_response = self.make_request('POST', 'properties', 
                                                       data=new_property, 
                                                       expected_status=201, 
                                                       use_auth=True)
            self.log_test("Create Property (Protected)", success)
            
            # Get created property ID for update/delete tests
            created_property_id = None
            if success and create_response and 'data' in create_response:
                created_property_id = create_response['data'].get('id')
            
            # Test update property
            if created_property_id:
                update_data = {
                    "title": "Updated Test Property",
                    "priceEuro": 275000
                }
                success, _ = self.make_request('PUT', f'properties/{created_property_id}', 
                                             data=update_data, 
                                             expected_status=200, 
                                             use_auth=True)
                self.log_test("Update Property (Protected)", success)
                
                # Test delete property
                success, _ = self.make_request('DELETE', f'properties/{created_property_id}', 
                                             expected_status=200, 
                                             use_auth=True)
                self.log_test("Delete Property (Protected)", success)

    def test_other_endpoints(self):
        """Test other API endpoints"""
        print("\n🔍 Testing Other Endpoints...")
        
        # Test users endpoint (protected)
        if self.token:
            success, _ = self.make_request('GET', 'users', use_auth=True, expected_status=200)
            self.log_test("List Users (Protected)", success)
        
        # Test dashboard endpoint (protected)
        if self.token:
            success, _ = self.make_request('GET', 'dashboard/stats', use_auth=True, expected_status=200)
            self.log_test("Dashboard Stats (Protected)", success)
        
        # Test blog endpoint (public)
        success, _ = self.make_request('GET', 'blog', expected_status=200)
        self.log_test("List Blog Posts (Public)", success)
        
        # Test inquiries endpoint (protected)
        if self.token:
            success, _ = self.make_request('GET', 'inquiries', use_auth=True, expected_status=200)
            self.log_test("List Inquiries (Protected)", success)

    def test_error_handling(self):
        """Test error handling"""
        print("\n🔍 Testing Error Handling...")
        
        # Test 404 for non-existent property
        success, _ = self.make_request('GET', 'properties/non-existent-id', expected_status=404)
        self.log_test("404 Error Handling", success)
        
        # Test unauthorized access
        success, _ = self.make_request('POST', 'properties', 
                                     data={"title": "test"}, 
                                     expected_status=401, 
                                     use_auth=False)
        self.log_test("Unauthorized Access Handling", success)
        
        # Test invalid login
        invalid_login = {
            "email": "invalid@example.com",
            "password": "wrongpassword"
        }
        success, _ = self.make_request('POST', 'auth/login', 
                                     data=invalid_login, 
                                     expected_status=401)
        self.log_test("Invalid Login Handling", success)

    def test_cors_configuration(self):
        """Test CORS configuration"""
        print("\n🔍 Testing CORS Configuration...")
        
        try:
            # Test preflight request
            headers = {
                'Origin': 'http://localhost:5173',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            }
            response = requests.options(f"{self.api_base}/auth/login", headers=headers, timeout=10)
            
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
            }
            
            success = response.status_code in [200, 204] and cors_headers['Access-Control-Allow-Origin']
            self.log_test("CORS Preflight Request", success, f"Headers: {cors_headers}")
            
        except Exception as e:
            self.log_test("CORS Preflight Request", False, str(e))

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting Italian Real Estate API Tests")
        print(f"📍 Testing API at: {self.base_url}")
        print("=" * 60)
        
        # Run test suites
        self.test_health_endpoints()
        self.test_swagger_docs()
        self.test_authentication()
        self.test_properties_endpoints()
        self.test_other_endpoints()
        self.test_error_handling()
        self.test_cors_configuration()
        
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
    tester = ItalianRealEstateAPITester()
    
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