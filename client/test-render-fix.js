// Test Render backend after fixing trust proxy issue
import axios from 'axios';

const RENDER_BACKEND_URL = 'https://farmstay-backend.onrender.com';

async function testRenderBackend() {
    console.log('🧪 Testing Render backend after trust proxy fix...');
    
    try {
        // Test basic health endpoint
        console.log('📡 Testing health endpoint...');
        const healthResponse = await axios.get(`${RENDER_BACKEND_URL}/api/auth/health`, {
            timeout: 10000
        });
        console.log('✅ Health endpoint:', healthResponse.status, healthResponse.data);
        
        // Test OTP endpoint (this should trigger rate limiting if working)
        console.log('📧 Testing OTP endpoint...');
        const otpResponse = await axios.post(`${RENDER_BACKEND_URL}/api/auth/send-otp`, {
            name: 'Test User',
            email: 'test@example.com',
            phone: '1234567890'
        }, {
            timeout: 15000
        });
        console.log('✅ OTP endpoint:', otpResponse.status, otpResponse.data);
        
        console.log('🎉 Render backend is working correctly!');
        
    } catch (error) {
        console.error('❌ Error testing Render backend:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else if (error.request) {
            console.error('No response received:', error.message);
        } else {
            console.error('Request setup error:', error.message);
        }
    }
}

testRenderBackend();
