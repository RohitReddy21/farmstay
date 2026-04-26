const axios = require('axios');

async function testEndpoints() {
    try {
        // We need a token. Let's try to login as admin.
        console.log('Testing endpoints...');
        const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'admin@farmstay.com',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        console.log('Login successful');

        const analyticsRes = await axios.get('http://localhost:5001/api/analytics/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Analytics Response:', analyticsRes.status);

        const dbRes = await axios.get('http://localhost:5001/api/db/view', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('DB Viewer Response:', dbRes.status);

    } catch (error) {
        if (error.response) {
            console.error('Error Status:', error.response.status);
            console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

testEndpoints();
