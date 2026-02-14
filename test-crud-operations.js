#!/usr/bin/env node

const BASE_URL = 'http://localhost:3000/api';
let authToken = null;
let testsPassed = 0;
let testsFailed = 0;

const log = (test, pass, msg) => {
  if (pass) {
    console.log(`✓ ${test}`);
    testsPassed++;
  } else {
    console.log(`✗ ${test}: ${msg}`);
    testsFailed++;
  }
};

async function request(method, endpoint, body = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };

  if (authToken) {
    options.headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(`${response.status}: ${data.error}`);
    }
    return data;
  } catch (err) {
    throw err;
  }
}

async function runTests() {
  console.log('\n=== MENU, HALLS & ROOMS CRUD TEST SUITE ===\n');

  try {
    // Login
    console.log('Authenticating...');
    const loginResult = await request('POST', '/auth/login', {
      email: 'admin@megapark.com',
      password: 'admin123'
    });
    authToken = loginResult.accessToken;
    console.log(`✓ Logged in as ${loginResult.user.email}\n`);

    // Menu Tests
    console.log('--- MENU ITEMS ---');
    let menuId = null;
    try {
      const created = await request('POST', '/menu', {
        name: 'Test Item',
        description: 'Test',
        category: 'mains',
        price: 1200,
        preparationTime: 20
      });
      menuId = created.id;
      log('POST /api/menu - Create', !!menuId, menuId ? '' : 'No ID');
    } catch (e) {
      log('POST /api/menu - Create', false, e.message);
    }

    try {
      const items = await request('GET', '/menu');
      log('GET /api/menu - Fetch all', Array.isArray(items), '');
    } catch (e) {
      log('GET /api/menu - Fetch all', false, e.message);
    }

    if (menuId) {
      try {
        const updated = await request('PUT', `/menu/${menuId}`, { price: 1500 });
        log('PUT /api/menu/:id - Update', updated.price === 1500, '');
      } catch (e) {
        log('PUT /api/menu/:id - Update', false, e.message);
      }

      try {
        await request('DELETE', `/menu/${menuId}`);
        log('DELETE /api/menu/:id - Delete', true, '');
      } catch (e) {
        log('DELETE /api/menu/:id - Delete', false, e.message);
      }
    }

    // Halls Tests
    console.log('\n--- HALLS ---');
    let hallId = null;
    try {
      const created = await request('POST', '/halls', {
        name: 'Test Hall',
        description: 'Test',
        capacity: 100,
        pricePerDay: 25000,
        amenities: ['WiFi']
      });
      hallId = created.id;
      log('POST /api/halls - Create', !!hallId, hallId ? '' : 'No ID');
    } catch (e) {
      log('POST /api/halls - Create', false, e.message);
    }

    try {
      const halls = await request('GET', '/halls');
      log('GET /api/halls - Fetch all', Array.isArray(halls), '');
    } catch (e) {
      log('GET /api/halls - Fetch all', false, e.message);
    }

    if (hallId) {
      try {
        const updated = await request('PUT', `/halls/${hallId}`, { pricePerDay: 30000 });
        log('PUT /api/halls/:id - Update', updated.pricePerDay === 30000, '');
      } catch (e) {
        log('PUT /api/halls/:id - Update', false, e.message);
      }

      try {
        await request('DELETE', `/halls/${hallId}`);
        log('DELETE /api/halls/:id - Delete', true, '');
      } catch (e) {
        log('DELETE /api/halls/:id - Delete', false, e.message);
      }
    }

    // Rooms Tests
    console.log('\n--- ROOMS ---');
    let roomId = null;
    try {
      const created = await request('POST', '/rooms', {
        roomNumber: '999',
        name: 'Test Room',
        type: 'standard',
        description: 'Test',
        pricePerNight: 8000,
        capacity: 2,
        amenities: ['WiFi']
      });
      roomId = created.id;
      log('POST /api/rooms - Create', !!roomId, roomId ? '' : 'No ID');
    } catch (e) {
      log('POST /api/rooms - Create', false, e.message);
    }

    try {
      const rooms = await request('GET', '/rooms');
      log('GET /api/rooms - Fetch all', Array.isArray(rooms), '');
    } catch (e) {
      log('GET /api/rooms - Fetch all', false, e.message);
    }

    if (roomId) {
      try {
        const updated = await request('PUT', `/rooms/${roomId}`, { pricePerNight: 10000 });
        log('PUT /api/rooms/:id - Update', updated.pricePerNight === 10000, '');
      } catch (e) {
        log('PUT /api/rooms/:id - Update', false, e.message);
      }

      try {
        await request('DELETE', `/rooms/${roomId}`);
        log('DELETE /api/rooms/:id - Delete', true, '');
      } catch (e) {
        log('DELETE /api/rooms/:id - Delete', false, e.message);
      }
    }

  } catch (err) {
    console.error(`\nFatal error: ${err.message}`);
    process.exit(1);
  }

  console.log(`\n=== RESULTS: ${testsPassed} passed, ${testsFailed} failed ===\n`);
  process.exit(testsFailed > 0 ? 1 : 0);
}

runTests();
