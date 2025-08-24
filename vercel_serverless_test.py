#!/usr/bin/env python3
"""
Vercel Serverless Configuration Test Suite
Tests the serverless deployment configuration for the Italian Real Estate API
"""

import sys
import os
import json
import importlib.util
from pathlib import Path

class VercelServerlessConfigTester:
    def __init__(self):
        self.tests_run = 0
        self.tests_passed = 0
        self.errors = []
        
    def log_test(self, name, success, message=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}: PASSED {message}")
        else:
            self.errors.append(f"{name}: {message}")
            print(f"❌ {name}: FAILED {message}")
        return success

    def test_vercel_json_configuration(self):
        """Test 1: Verify root vercel.json configuration"""
        print("\n🔍 Testing Vercel Configuration...")
        
        try:
            vercel_path = Path("/app/vercel.json")
            if not vercel_path.exists():
                return self.log_test("Vercel Config Exists", False, "vercel.json not found")
            
            with open(vercel_path, 'r') as f:
                config = json.load(f)
            
            # Check version
            if config.get("version") != 2:
                return self.log_test("Vercel Version", False, f"Expected version 2, got {config.get('version')}")
            
            # Check builds configuration
            builds = config.get("builds", [])
            if not builds:
                return self.log_test("Builds Config", False, "No builds configuration found")
            
            build = builds[0]
            if build.get("src") != "backend/api/index.js":
                return self.log_test("Build Source", False, f"Expected 'backend/api/index.js', got '{build.get('src')}'")
            
            if build.get("use") != "@vercel/node":
                return self.log_test("Build Runtime", False, f"Expected '@vercel/node', got '{build.get('use')}'")
            
            # Check routes configuration
            routes = config.get("routes", [])
            if not routes:
                return self.log_test("Routes Config", False, "No routes configuration found")
            
            route = routes[0]
            if route.get("dest") != "/backend/api/index.js":
                return self.log_test("Route Destination", False, f"Expected '/backend/api/index.js', got '{route.get('dest')}'")
            
            self.log_test("Vercel Configuration", True, "All configuration checks passed")
            return True
            
        except Exception as e:
            return self.log_test("Vercel Configuration", False, f"Error reading config: {str(e)}")

    def test_no_conflicting_configs(self):
        """Test 2: Ensure no conflicting vercel.json files"""
        print("\n🔍 Testing for Conflicting Configurations...")
        
        backend_vercel = Path("/app/backend/vercel.json")
        if backend_vercel.exists():
            return self.log_test("No Backend vercel.json", False, "Conflicting vercel.json found in backend directory")
        
        return self.log_test("No Conflicting Configs", True, "No conflicting vercel.json files found")

    def test_serverless_handler_exists(self):
        """Test 3: Verify serverless handler file exists"""
        print("\n🔍 Testing Serverless Handler File...")
        
        handler_path = Path("/app/backend/api/index.js")
        if not handler_path.exists():
            return self.log_test("Handler File Exists", False, "Serverless handler /app/backend/api/index.js not found")
        
        return self.log_test("Handler File Exists", True, "Serverless handler file found")

    def test_serverless_handler_structure(self):
        """Test 4: Verify serverless handler structure"""
        print("\n🔍 Testing Serverless Handler Structure...")
        
        try:
            handler_path = Path("/app/backend/api/index.js")
            with open(handler_path, 'r') as f:
                content = f.read()
            
            # Check for required imports
            required_imports = [
                "import express from 'express'",
                "import serverless from 'serverless-http'",
                "import cors from 'cors'"
            ]
            
            for import_stmt in required_imports:
                if import_stmt not in content:
                    return self.log_test("Required Imports", False, f"Missing import: {import_stmt}")
            
            # Check for Express app creation
            if "const app = express()" not in content and "app = express()" not in content:
                return self.log_test("Express App Creation", False, "Express app not created")
            
            # Check for serverless export
            if "export default serverless(app)" not in content:
                return self.log_test("Serverless Export", False, "Missing serverless export")
            
            # Check for POST /api/blog endpoint
            if "app.post('/api/blog'" not in content:
                return self.log_test("Blog Endpoint", False, "POST /api/blog endpoint not found")
            
            # Check for CORS configuration
            if "app.use(cors(" not in content:
                return self.log_test("CORS Configuration", False, "CORS middleware not configured")
            
            # Check for JSON body parsing
            if "express.json(" not in content:
                return self.log_test("JSON Body Parsing", False, "JSON body parsing not configured")
            
            self.log_test("Handler Structure", True, "All structure checks passed")
            return True
            
        except Exception as e:
            return self.log_test("Handler Structure", False, f"Error reading handler: {str(e)}")

    def test_blog_endpoint_logic(self):
        """Test 5: Verify blog endpoint logic"""
        print("\n🔍 Testing Blog Endpoint Logic...")
        
        try:
            handler_path = Path("/app/backend/api/index.js")
            with open(handler_path, 'r') as f:
                content = f.read()
            
            # Check for authorization check
            if "req.headers.authorization" not in content:
                return self.log_test("Authorization Check", False, "No authorization header check found")
            
            # Check for 401 response
            if "res.status(401)" not in content:
                return self.log_test("401 Response", False, "No 401 Unauthorized response found")
            
            # Check for Bearer token check
            if "Bearer" not in content:
                return self.log_test("Bearer Token Check", False, "No Bearer token validation found")
            
            # Check for 200 success response
            if "res.status(200)" not in content:
                return self.log_test("200 Success Response", False, "No 200 success response found")
            
            self.log_test("Blog Endpoint Logic", True, "All endpoint logic checks passed")
            return True
            
        except Exception as e:
            return self.log_test("Blog Endpoint Logic", False, f"Error analyzing endpoint: {str(e)}")

    def test_express_middleware_configuration(self):
        """Test 6: Verify Express middleware configuration"""
        print("\n🔍 Testing Express Middleware Configuration...")
        
        try:
            handler_path = Path("/app/backend/api/index.js")
            with open(handler_path, 'r') as f:
                content = f.read()
            
            # Check for security middleware
            if "helmet(" not in content:
                return self.log_test("Security Middleware", False, "Helmet security middleware not found")
            
            # Check for compression
            if "compression(" not in content:
                return self.log_test("Compression Middleware", False, "Compression middleware not found")
            
            # Check for logging
            if "morgan(" not in content:
                return self.log_test("Logging Middleware", False, "Morgan logging middleware not found")
            
            # Check for trust proxy setting
            if "trust proxy" not in content:
                return self.log_test("Trust Proxy", False, "Trust proxy setting not found")
            
            # Check for error handler
            if "app.use((err" not in content:
                return self.log_test("Error Handler", False, "Error handling middleware not found")
            
            # Check for 404 handler
            if "res.status(404)" not in content:
                return self.log_test("404 Handler", False, "404 handler not found")
            
            self.log_test("Express Middleware", True, "All middleware checks passed")
            return True
            
        except Exception as e:
            return self.log_test("Express Middleware", False, f"Error checking middleware: {str(e)}")

    def test_health_endpoints(self):
        """Test 7: Verify health check endpoints"""
        print("\n🔍 Testing Health Check Endpoints...")
        
        try:
            handler_path = Path("/app/backend/api/index.js")
            with open(handler_path, 'r') as f:
                content = f.read()
            
            # Check for /health endpoint
            if "app.get('/health'" not in content:
                return self.log_test("Health Endpoint", False, "/health endpoint not found")
            
            # Check for /api/health endpoint
            if "app.get('/api/health'" not in content:
                return self.log_test("API Health Endpoint", False, "/api/health endpoint not found")
            
            # Check for root endpoint
            if "app.get('/', " not in content:
                return self.log_test("Root Endpoint", False, "Root endpoint not found")
            
            self.log_test("Health Endpoints", True, "All health endpoints found")
            return True
            
        except Exception as e:
            return self.log_test("Health Endpoints", False, f"Error checking endpoints: {str(e)}")

    def run_all_tests(self):
        """Run all configuration tests"""
        print("🚀 Starting Vercel Serverless Configuration Tests")
        print("=" * 60)
        
        # Run all tests
        self.test_vercel_json_configuration()
        self.test_no_conflicting_configs()
        self.test_serverless_handler_exists()
        self.test_serverless_handler_structure()
        self.test_blog_endpoint_logic()
        self.test_express_middleware_configuration()
        self.test_health_endpoints()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.errors:
            print("\n❌ Failed Tests:")
            for error in self.errors:
                print(f"   • {error}")
        
        if self.tests_passed == self.tests_run:
            print("\n🎉 All tests passed! Serverless configuration is ready for deployment.")
            return 0
        else:
            print(f"\n⚠️  {len(self.errors)} test(s) failed. Please fix the issues before deployment.")
            return 1

def main():
    """Main test runner"""
    tester = VercelServerlessConfigTester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())