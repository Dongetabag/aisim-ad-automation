#!/usr/bin/env node

/**
 * AISim Automated Ad System - Comprehensive Stress Test
 * Tests all components, APIs, and integrations
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Test configuration
const CONFIG = {
  backendUrl: 'http://localhost:3000',
  frontendUrl: 'http://localhost:3001',
  timeout: 10000,
  retries: 3
};

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
  warnings: [],
  performance: {}
};

// Utility functions
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const retryRequest = async (fn, retries = CONFIG.retries) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(1000 * (i + 1));
    }
  }
};

// Test functions
const testEnvironmentSetup = () => {
  log('Testing environment setup...');
  
  // Check if .env file exists
  if (!fs.existsSync('.env')) {
    testResults.failed++;
    testResults.errors.push('❌ .env file not found');
    return false;
  }
  
  // Check if node_modules exist
  if (!fs.existsSync('backend/node_modules')) {
    testResults.failed++;
    testResults.errors.push('❌ Backend node_modules not found');
    return false;
  }
  
  if (!fs.existsSync('frontend/node_modules')) {
    testResults.failed++;
    testResults.errors.push('❌ Frontend node_modules not found');
    return false;
  }
  
  testResults.passed++;
  log('Environment setup OK', 'success');
  return true;
};

const testBackendHealth = async () => {
  log('Testing backend health...');
  
  try {
    const startTime = Date.now();
    const response = await retryRequest(() => 
      axios.get(`${CONFIG.backendUrl}/health`, { timeout: CONFIG.timeout })
    );
    const responseTime = Date.now() - startTime;
    
    if (response.status === 200) {
      testResults.passed++;
      testResults.performance.backendHealth = responseTime;
      log(`Backend health check passed (${responseTime}ms)`, 'success');
      return true;
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`❌ Backend health check failed: ${error.message}`);
    return false;
  }
};

const testGoogleAPI = async () => {
  log('Testing Google API integration...');
  
  try {
    const startTime = Date.now();
    const response = await retryRequest(() => 
      axios.get(`${CONFIG.backendUrl}/api/intake/validate-google`, { timeout: CONFIG.timeout })
    );
    const responseTime = Date.now() - startTime;
    
    if (response.status === 200 && response.data.valid) {
      testResults.passed++;
      testResults.performance.googleAPI = responseTime;
      log(`Google API validation passed (${responseTime}ms)`, 'success');
      return true;
    } else {
      throw new Error(`API validation failed: ${response.data.error || 'Unknown error'}`);
    }
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`❌ Google API test failed: ${error.message}`);
    return false;
  }
};

const testGooglePlacesAPI = async () => {
  log('Testing Google Places API...');
  
  try {
    const startTime = Date.now();
    const response = await retryRequest(() => 
      axios.post(`${CONFIG.backendUrl}/api/intake/google-leads`, {
        industry: 'technology',
        location: 'San Francisco, CA',
        radius: 10000
      }, { timeout: CONFIG.timeout })
    );
    const responseTime = Date.now() - startTime;
    
    if (response.status === 200 && response.data.success) {
      testResults.passed++;
      testResults.performance.googlePlaces = responseTime;
      log(`Google Places API test passed (${responseTime}ms) - Found ${response.data.leads?.length || 0} leads`, 'success');
      return true;
    } else {
      throw new Error(`Places API failed: ${response.data.error || 'Unknown error'}`);
    }
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`❌ Google Places API test failed: ${error.message}`);
    return false;
  }
};

const testYouTubeAPI = async () => {
  log('Testing YouTube API...');
  
  try {
    const startTime = Date.now();
    const response = await retryRequest(() => 
      axios.post(`${CONFIG.backendUrl}/api/intake/ad-inspiration`, {
        industry: 'technology',
        keywords: ['marketing', 'advertising']
      }, { timeout: CONFIG.timeout })
    );
    const responseTime = Date.now() - startTime;
    
    if (response.status === 200 && response.data.success) {
      testResults.passed++;
      testResults.performance.youtubeAPI = responseTime;
      log(`YouTube API test passed (${responseTime}ms) - Found ${response.data.videos?.length || 0} videos`, 'success');
      return true;
    } else {
      throw new Error(`YouTube API failed: ${response.data.error || 'Unknown error'}`);
    }
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`❌ YouTube API test failed: ${error.message}`);
    return false;
  }
};

const testAdGeneration = async () => {
  log('Testing AI ad generation...');
  
  try {
    const startTime = Date.now();
    const response = await retryRequest(() => 
      axios.post(`${CONFIG.backendUrl}/api/intake/generate-ad`, {
        companyName: 'TestCorp',
        industry: 'technology',
        targetAudience: 'developers',
        keyMessage: 'Innovative solutions for modern problems',
        tone: 'professional',
        callToAction: 'Learn More'
      }, { timeout: CONFIG.timeout })
    );
    const responseTime = Date.now() - startTime;
    
    if (response.status === 200 && response.data.success) {
      testResults.passed++;
      testResults.performance.adGeneration = responseTime;
      log(`AI ad generation test passed (${responseTime}ms)`, 'success');
      return true;
    } else {
      throw new Error(`Ad generation failed: ${response.data.error || 'Unknown error'}`);
    }
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`❌ AI ad generation test failed: ${error.message}`);
    return false;
  }
};

const testFrontendAccess = async () => {
  log('Testing frontend access...');
  
  try {
    const startTime = Date.now();
    const response = await retryRequest(() => 
      axios.get(`${CONFIG.frontendUrl}/`, { timeout: CONFIG.timeout })
    );
    const responseTime = Date.now() - startTime;
    
    if (response.status === 200) {
      testResults.passed++;
      testResults.performance.frontendAccess = responseTime;
      log(`Frontend access test passed (${responseTime}ms)`, 'success');
      return true;
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`❌ Frontend access test failed: ${error.message}`);
    return false;
  }
};

const testDatabaseConnection = async () => {
  log('Testing database connection...');
  
  try {
    const startTime = Date.now();
    const response = await retryRequest(() => 
      axios.get(`${CONFIG.backendUrl}/api/analytics/dashboard`, { timeout: CONFIG.timeout })
    );
    const responseTime = Date.now() - startTime;
    
    if (response.status === 200) {
      testResults.passed++;
      testResults.performance.databaseConnection = responseTime;
      log(`Database connection test passed (${responseTime}ms)`, 'success');
      return true;
    } else {
      throw new Error(`Database test failed: ${response.status}`);
    }
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`❌ Database connection test failed: ${error.message}`);
    return false;
  }
};

const testLoadPerformance = async () => {
  log('Testing load performance...');
  
  const concurrentRequests = 10;
  const requests = [];
  
  for (let i = 0; i < concurrentRequests; i++) {
    requests.push(
      axios.get(`${CONFIG.backendUrl}/health`, { timeout: CONFIG.timeout })
        .catch(err => ({ error: err.message }))
    );
  }
  
  const startTime = Date.now();
  const results = await Promise.all(requests);
  const totalTime = Date.now() - startTime;
  
  const successful = results.filter(r => !r.error).length;
  const failed = results.filter(r => r.error).length;
  
  testResults.performance.loadTest = {
    totalTime,
    successful,
    failed,
    averageResponseTime: totalTime / concurrentRequests
  };
  
  if (successful >= concurrentRequests * 0.8) { // 80% success rate
    testResults.passed++;
    log(`Load test passed: ${successful}/${concurrentRequests} successful (${totalTime}ms total)`, 'success');
    return true;
  } else {
    testResults.failed++;
    testResults.errors.push(`❌ Load test failed: ${successful}/${concurrentRequests} successful`);
    return false;
  }
};

// Main test runner
const runStressTest = async () => {
  console.log('🧪 AISim Automated Ad System - Comprehensive Stress Test');
  console.log('=' .repeat(60));
  
  const startTime = Date.now();
  
  // Run all tests
  await testEnvironmentSetup();
  await sleep(1000);
  
  await testBackendHealth();
  await sleep(1000);
  
  await testGoogleAPI();
  await sleep(1000);
  
  await testGooglePlacesAPI();
  await sleep(1000);
  
  await testYouTubeAPI();
  await sleep(1000);
  
  await testAdGeneration();
  await sleep(1000);
  
  await testFrontendAccess();
  await sleep(1000);
  
  await testDatabaseConnection();
  await sleep(1000);
  
  await testLoadPerformance();
  
  const totalTime = Date.now() - startTime;
  
  // Generate report
  console.log('\n' + '=' .repeat(60));
  console.log('📊 STRESS TEST RESULTS');
  console.log('=' .repeat(60));
  
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`⏱️  Total Time: ${totalTime}ms`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    testResults.errors.forEach(error => console.log(`  ${error}`));
  }
  
  if (testResults.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    testResults.warnings.forEach(warning => console.log(`  ${warning}`));
  }
  
  console.log('\n📈 PERFORMANCE METRICS:');
  Object.entries(testResults.performance).forEach(([test, metrics]) => {
    if (typeof metrics === 'number') {
      console.log(`  ${test}: ${metrics}ms`);
    } else {
      console.log(`  ${test}:`, metrics);
    }
  });
  
  const successRate = (testResults.passed / (testResults.passed + testResults.failed)) * 100;
  console.log(`\n🎯 Overall Success Rate: ${successRate.toFixed(1)}%`);
  
  if (successRate >= 80) {
    console.log('🎉 System is ready for production!');
    process.exit(0);
  } else {
    console.log('⚠️  System needs attention before production deployment.');
    process.exit(1);
  }
};

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the stress test
runStressTest().catch(error => {
  console.error('❌ Stress test failed:', error);
  process.exit(1);
});
