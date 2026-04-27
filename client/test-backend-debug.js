import axios from 'axios';

const API_URL = 'https://farmstay-backend.onrender.com';

async function debugBackend() {
    console.log('🔍 Debugging Backend API...');
    console.log('📡 API_URL:', API_URL);
    
    try {
        // Test 1: Health endpoint
        console.log('\n🏥 Test 1: Health Endpoint');
        const healthResponse = await axios.get(`${API_URL}/api/health`);
        console.log('✅ Health Response:', healthResponse.data);
        
        // Test 2: List all available routes
        console.log('\n🛣️ Test 2: Available Routes');
        const routesResponse = await axios.get(`${API_URL}/`);
        console.log('✅ Root Response:', routesResponse.data);
        
        // Test 3: Try different auth endpoints
        console.log('\n🔐 Test 3: Auth Endpoints');
        
        try {
            const registerResponse = await axios.post(`${API_URL}/api/auth/register`, {
                name: 'Test',
                email: 'test@example.com',
                phone: '1234567890',
                password: 'password123',
                otp: '123456'
            });
            console.log('✅ Register Endpoint: Available');
        } catch (err) {
            console.log('❌ Register Endpoint:', err.response?.status, err.response?.data?.message || err.message);
        }
        
        try {
            const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
                email: 'test@example.com',
                password: 'password123'
            });
            console.log('✅ Login Endpoint: Available');
        } catch (err) {
            console.log('❌ Login Endpoint:', err.response?.status, err.response?.data?.message || err.message);
        }
        
        // Test 4: OTP endpoint (the failing one)
        console.log('\n📧 Test 4: OTP Endpoint');
        console.log('📤 Sending to:', `${API_URL}/api/auth/send-otp`);
        
        const otpResponse = await axios.post(`${API_URL}/api/auth/send-otp`, {
            name: 'Debug Test',
            email: 'debug@farmstay.com',
            phone: '1234567890'
        });
        
        console.log('✅ OTP Success! Response:', otpResponse.data);
        console.log('📊 Status:', otpResponse.status);
        
    } catch (error) {
        console.log('\n❌ ERROR DETAILS:');
        console.log('Status:', error.response?.status);
        console.log('Status Text:', error.response?.statusText);
        console.log('Response Data:', error.response?.data);
        console.log('Request URL:', error.config?.url);
        console.log('Request Method:', error.config?.method);
        console.log('Request Headers:', error.config?.headers);
        console.log('Request Body:', error.config?.data);
        
        if (error.response?.status === 404) {
            console.log('\n🚨 404 ERROR ANALYSIS:');
            console.log('1. Endpoint path might be wrong');
            console.log('2. Route might not be properly registered');
            console.log('3. Server might need restart after env var changes');
        }
    }
}

debugBackend();
