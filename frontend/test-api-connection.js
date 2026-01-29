const axios = require('axios');

const API_BASE_URL = 'http://10.0.244.132:3001/api';

async function testAPIConnection() {
  console.log('Testing API connection...');
  console.log('API Base URL:', API_BASE_URL);
  
  try {
    // Test 1: Health check
    console.log('\n1. Testing health check...');
    const healthResponse = await axios.get(`${API_BASE_URL.replace('/api', '')}/api/health`);
    console.log('✅ Health check:', healthResponse.data.data.status);
    
    // Test 2: Auth endpoints info
    console.log('\n2. Testing auth endpoints...');
    const authResponse = await axios.get(`${API_BASE_URL}/auth`);
    console.log('✅ Auth endpoints available:', Object.keys(authResponse.data.endpoints).length);
    
    // Test 3: Test register (with a test user)
    console.log('\n3. Testing register...');
    const testUser = {
      username: 'mobiletest',
      email: 'mobiletest@example.com',
      password: 'password123',
      fullName: 'Mobile Test User',
      phoneNumber: '0123456789'
    };
    
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
      console.log('✅ Register successful:', registerResponse.data.message);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('⚠️ Register (user exists):', error.response.data.message);
      } else {
        throw error;
      }
    }
    
    // Test 4: Test login
    console.log('\n4. Testing login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      emailOrUsername: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful:', loginResponse.data.data.user.fullName);
    console.log('✅ Session ID:', loginResponse.data.data.session.sessionId);
    
    // Test 5: Test login with username
    console.log('\n5. Testing login with username...');
    const loginUsernameResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      emailOrUsername: testUser.username,
      password: testUser.password
    });
    console.log('✅ Login with username successful:', loginUsernameResponse.data.data.user.fullName);
    
    console.log('\n🎉 All API tests passed! React Native app should work correctly.');
    
  } catch (error) {
    console.error('\n❌ API Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data?.message || error.message);
    } else if (error.request) {
      console.error('Network Error: Cannot connect to API server');
      console.error('Make sure GroupAPI_MySQL server is running on port 3001');
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAPIConnection();