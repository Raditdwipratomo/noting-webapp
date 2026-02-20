
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testAnakAPI() {
    try {
        // 1. Login to get token
        console.log('Logging in...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'test@example.com', // Need to ensure this user exists or register one
            password: 'password123'
        });
        const token = loginResponse.data.data.token;
        console.log('Login successful. Token:', token);

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        // 2. Get All Anak
        console.log('Testing GET /api/anak...');
        const getAllResponse = await axios.get(`${BASE_URL}/anak`, config);
        console.log('GET /api/anak status:', getAllResponse.status);
        console.log('Data:', JSON.stringify(getAllResponse.data, null, 2));

    } catch (error) {
        console.error('Error testing API:', error.response ? error.response.data : error.message);
    }
}

// Ensure server is running first!
testAnakAPI();
