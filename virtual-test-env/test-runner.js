#!/usr/bin/env node

/**
 * AISim Automated Ad System - Virtual Testing Environment
 * Quick testing and validation of all system components
 */

const { spawn } = require('child_process');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Test configuration
const CONFIG = {
  frontendPorts: [3040, 3050, 3060, 3070, 3080, 3090, 3100, 3110, 3120, 3130],
  backendPort: 3000,
  testTimeout: 30000,
  retryAttempts: 3
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

const retryRequest = async (fn, retries = CONFIG.retryAttempts) => {
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
const testFrontendAccess = async (port) => {
  log(`Testing frontend on port ${port}...`);
  
  try {
    const startTime = Date.now();
    const response = await retryRequest(() => 
      axios.get(`http://localhost:${port}/`, { timeout: 5000 })
    );
    const responseTime = Date.now() - startTime;
    
    if (response.status === 200) {
      testResults.passed++;
      testResults.performance[`frontend_${port}`] = responseTime;
      log(`Frontend port ${port} accessible (${responseTime}ms)`, 'success');
      return { port, accessible: true, responseTime };
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`❌ Frontend port ${port} failed: ${error.message}`);
    return { port, accessible: false, error: error.message };
  }
};

const testBackendHealth = async () => {
  log('Testing backend health...');
  
  try {
    const startTime = Date.now();
    const response = await retryRequest(() => 
      axios.get(`http://localhost:${CONFIG.backendPort}/health`, { timeout: 5000 })
    );
    const responseTime = Date.now() - startTime;
    
    if (response.status === 200) {
      testResults.passed++;
      testResults.performance.backend = responseTime;
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
      axios.get(`http://localhost:${CONFIG.backendPort}/api/intake/validate-google`, { timeout: 10000 })
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

const testAdGeneration = async () => {
  log('Testing AI ad generation...');
  
  try {
    const startTime = Date.now();
    const response = await retryRequest(() => 
      axios.post(`http://localhost:${CONFIG.backendPort}/api/intake/generate-ad`, {
        companyName: 'TestCorp',
        industry: 'technology',
        targetAudience: 'developers',
        keyMessage: 'Innovative solutions for modern problems',
        tone: 'professional',
        callToAction: 'Learn More'
      }, { timeout: 15000 })
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

const testLeadGeneration = async () => {
  log('Testing lead generation...');
  
  try {
    const startTime = Date.now();
    const response = await retryRequest(() => 
      axios.post(`http://localhost:${CONFIG.backendPort}/api/intake/google-leads`, {
        industry: 'technology',
        location: 'San Francisco, CA',
        radius: 10000
      }, { timeout: 15000 })
    );
    const responseTime = Date.now() - startTime;
    
    if (response.status === 200 && response.data.success) {
      testResults.passed++;
      testResults.performance.leadGeneration = responseTime;
      log(`Lead generation test passed (${responseTime}ms) - Found ${response.data.leads?.length || 0} leads`, 'success');
      return true;
    } else {
      throw new Error(`Lead generation failed: ${response.data.error || 'Unknown error'}`);
    }
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`❌ Lead generation test failed: ${error.message}`);
    return false;
  }
};

const testPaymentProcessing = async () => {
  log('Testing payment processing...');
  
  try {
    const startTime = Date.now();
    const response = await retryRequest(() => 
      axios.post(`http://localhost:${CONFIG.backendPort}/api/intake/payment-intent`, {
        packageId: 'starter',
        amount: 50000,
        currency: 'usd'
      }, { timeout: 10000 })
    );
    const responseTime = Date.now() - startTime;
    
    if (response.status === 200 && response.data.success) {
      testResults.passed++;
      testResults.performance.paymentProcessing = responseTime;
      log(`Payment processing test passed (${responseTime}ms)`, 'success');
      return true;
    } else {
      throw new Error(`Payment processing failed: ${response.data.error || 'Unknown error'}`);
    }
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`❌ Payment processing test failed: ${error.message}`);
    return false;
  }
};

const testLoadPerformance = async (frontendPort) => {
  log(`Testing load performance on port ${frontendPort}...`);
  
  const concurrentRequests = 5;
  const requests = [];
  
  for (let i = 0; i < concurrentRequests; i++) {
    requests.push(
      axios.get(`http://localhost:${frontendPort}/`, { timeout: 5000 })
        .catch(err => ({ error: err.message }))
    );
  }
  
  const startTime = Date.now();
  const results = await Promise.all(requests);
  const totalTime = Date.now() - startTime;
  
  const successful = results.filter(r => !r.error).length;
  const failed = results.filter(r => r.error).length;
  
  testResults.performance[`load_${frontendPort}`] = {
    totalTime,
    successful,
    failed,
    averageResponseTime: totalTime / concurrentRequests
  };
  
  if (successful >= concurrentRequests * 0.8) { // 80% success rate
    testResults.passed++;
    log(`Load test on port ${frontendPort} passed: ${successful}/${concurrentRequests} successful (${totalTime}ms total)`, 'success');
    return true;
  } else {
    testResults.failed++;
    testResults.errors.push(`❌ Load test on port ${frontendPort} failed: ${successful}/${concurrentRequests} successful`);
    return false;
  }
};

// Main test runner
const runVirtualTests = async () => {
  console.log('🧪 AISim Automated Ad System - Virtual Testing Environment');
  console.log('=' .repeat(60));
  
  const startTime = Date.now();
  
  // Test all frontend ports
  log('Testing all frontend ports...');
  const frontendResults = [];
  for (const port of CONFIG.frontendPorts) {
    const result = await testFrontendAccess(port);
    frontendResults.push(result);
    await sleep(500); // Small delay between tests
  }
  
  // Find working frontend port
  const workingFrontend = frontendResults.find(r => r.accessible);
  if (workingFrontend) {
    log(`Found working frontend on port ${workingFrontend.port}`, 'success');
    
    // Test backend if available
    await testBackendHealth();
    await sleep(1000);
    
    // Test API integrations
    await testGoogleAPI();
    await sleep(1000);
    
    await testLeadGeneration();
    await sleep(1000);
    
    await testAdGeneration();
    await sleep(1000);
    
    await testPaymentProcessing();
    await sleep(1000);
    
    // Test load performance
    await testLoadPerformance(workingFrontend.port);
  } else {
    log('No working frontend ports found', 'error');
  }
  
  const totalTime = Date.now() - startTime;
  
  // Generate report
  console.log('\n' + '=' .repeat(60));
  console.log('📊 VIRTUAL TESTING RESULTS');
  console.log('=' .repeat(60));
  
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`⏱️  Total Time: ${totalTime}ms`);
  
  if (workingFrontend) {
    console.log(`\n🎯 Working Frontend: http://localhost:${workingFrontend.port}`);
    console.log(`📈 Response Time: ${workingFrontend.responseTime}ms`);
  }
  
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
  
  if (successRate >= 70) {
    console.log('🎉 Virtual testing environment is ready for development!');
    if (workingFrontend) {
      console.log(`\n🚀 Open your browser to: http://localhost:${workingFrontend.port}`);
    }
  } else {
    console.log('⚠️  Virtual testing environment needs attention.');
  }
  
  return { workingFrontend, successRate };
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

// Run the virtual tests
runVirtualTests().catch(error => {
  console.error('❌ Virtual testing failed:', error);
  process.exit(1);
});
