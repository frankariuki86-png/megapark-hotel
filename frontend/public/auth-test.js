// Test login with mock admin credentials using the Vite proxy
const testLogin = async () => {
  try {
    const resp = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@megapark.com', password: 'admin123' })
    });
    const data = await resp.json();
    console.log('LOGIN RESPONSE:', resp.status, data);
    return data;
  } catch (e) {
    console.error('LOGIN ERROR:', e.message);
  }
};

// Test register
const testRegister = async () => {
  try {
    const resp = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test+${Date.now()}@local.test`,
        password: 'TestPass123',
        firstName: 'Test',
        lastName: 'User'
      })
    });
    const data = await resp.json();
    console.log('REGISTER RESPONSE:', resp.status, data);
    return data;
  } catch (e) {
    console.error('REGISTER ERROR:', e.message);
  }
};

console.log('=== Testing Auth Endpoints ===');
console.log('Run: testLogin() to test login with admin@megapark.com / admin123');
console.log('Run: testRegister() to test account creation');
