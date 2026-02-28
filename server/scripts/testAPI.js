#!/usr/bin/env node

/**
 * API Testing Script - Tests all endpoints and features
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
let testResults = { passed: 0, failed: 0, errors: [] };

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    testResults.passed++;
  } catch (err) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${err.message}`);
    testResults.failed++;
    testResults.errors.push({ test: name, error: err.message });
  }
}

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`${res.statusCode}: ${json.error || 'Unknown error'}`));
          } else {
            resolve(json);
          }
        } catch (e) {
          reject(new Error(`Invalid JSON response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting API Tests...\n');

  let testToken = null;
  let testRestaurantId = null;
  let testStaffId = null;
  let testRequestId = null;

  // ====== PUBLIC ENDPOINTS ======
  console.log('\n📋 --- PUBLIC ENDPOINTS ---');

  await test('GET /health', async () => {
    const data = await request('GET', '/health');
    if (data.status !== 'ok') throw new Error('Health check failed');
  });

  await test('GET /api/public/restaurants', async () => {
    const data = await request('GET', '/api/public/restaurants');
    if (!Array.isArray(data)) throw new Error('Not an array');
  });

  // ====== ONBOARDING ENDPOINTS ======
  console.log('\n🏢 --- ONBOARDING ENDPOINTS ---');

  await test('POST /api/onboarding/request (new request)', async () => {
    const result = await request('POST', '/api/onboarding/request', {
      name: `Test Restaurant ${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      phone: '555-1234',
      address: '123 Main St',
      city: 'Test City',
      owner_name: 'Test Owner'
    });
    testRequestId = result.requestId;
    if (!result.requestId) throw new Error('No request ID returned');
  });

  await test('GET /api/onboarding/request/status/:id', async () => {
    if (!testRequestId) throw new Error('No test request ID');
    const data = await request('GET', `/api/onboarding/request/status/${testRequestId}`);
    if (data.status !== 'pending') throw new Error('Wrong status');
  });

  // ====== AUTH ENDPOINTS ======
  console.log('\n🔐 --- AUTHENTICATION ---');

  await test('POST /api/auth/login (owner)', async () => {
    const result = await request('POST', '/api/auth/login', {
      username: 'owner1',
      password: 'password123'
    });
    if (!result.token) throw new Error('No token received');
    testToken = result.token;
  });

  // ====== PROTECTED ENDPOINTS (with auth) ======
  console.log('\n🔒 --- PROTECTED ENDPOINTS ---');

  await test('GET /api/onboarding/admin/requests (authenticated)', async () => {
    const data = await request('GET', '/api/onboarding/admin/requests', null, testToken);
    if (!Array.isArray(data)) throw new Error('Not an array');
  });

  await test('GET /api/staff/staff (list staff)', async () => {
    const data = await request('GET', '/api/staff/staff', null, testToken);
    if (!Array.isArray(data)) throw new Error('Not an array');
  });

  // ====== STAFF CRUD ======
  console.log('\n👥 --- STAFF MANAGEMENT CRUD ---');

  await test('POST /api/staff/staff (create staff)', async () => {
    const result = await request('POST', '/api/staff/staff', {
      name: 'John Doe',
      email: `john${Date.now()}@example.com`,
      phone: '555-1111',
      role: 'waiter',
      salary: 2000,
      hired_date: '2026-01-01'
    }, testToken);
    testStaffId = result.staffId;
    if (!result.staffId) throw new Error('No staff ID returned');
    if (!result.username) throw new Error('No username returned');
    if (!result.tempPassword) throw new Error('No temp password returned');
  });

  await test('GET /api/staff/staff/:id/salary (get staff salary)', async () => {
    if (!testStaffId) throw new Error('No test staff ID');
    const data = await request('GET', `/api/staff/staff/${testStaffId}/salary`, null, testToken);
    if (!Array.isArray(data)) throw new Error('Not an array');
  });

  await test('POST /api/staff/salary (create salary record)', async () => {
    if (!testStaffId) throw new Error('No test staff ID');
    const today = new Date();
    const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
    const result = await request('POST', '/api/staff/salary', {
      staff_id: testStaffId,
      month,
      base_salary: 2000,
      bonus: 200,
      deductions: 100
    }, testToken);
    if (!result.id) throw new Error('No salary record ID returned');
  });

  await test('PUT /api/staff/staff/:id (update staff)', async () => {
    if (!testStaffId) throw new Error('No test staff ID');
    const result = await request('PUT', `/api/staff/staff/${testStaffId}`, {
      name: 'John Updated',
      email: `john${Date.now()}@example.com`,
      phone: '555-2222',
      role: 'manager',
      salary: 3000,
      status: 'active'
    }, testToken);
    if (result.name !== 'John Updated') throw new Error('Update failed');
  });

  // ====== POS ENDPOINTS ======
  console.log('\n🍽️ --- POS/MENU ENDPOINTS ---');

  await test('GET /api/pos/restaurant (get restaurant info)', async () => {
    const result = await request('GET', '/api/pos/restaurant', null, testToken);
    if (!result.id) throw new Error('No restaurant ID');
    testRestaurantId = result.id;
  });

  // ====== SUMMARY ======
  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 TEST RESULTS: ${testResults.passed} passed, ${testResults.failed} failed\n`);
  
  if (testResults.failed > 0) {
    console.log('❌ Failed Tests:');
    testResults.errors.forEach(e => {
      console.log(`   - ${e.test}: ${e.error}`);
    });
  }
  
  process.exit(testResults.failed > 0 ? 1 : 0);
}

runTests();
