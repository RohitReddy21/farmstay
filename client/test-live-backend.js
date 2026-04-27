import axios from 'axios';

const API_URL = 'https://farmstay-backend.onrender.com';

async function testLiveBackend() {
    console.log('🌐 Testing Live Backend...');
    console.log('📡 API_URL:', API_URL);
    
    try {
        // Test health endpoint
        console.log('\n🏥 Testing Health Endpoint...');
        const healthResponse = await axios.get(`${API_URL}/api/health`);
        console.log('✅ Health:', healthResponse.data);
        
        // Test OTP endpoint
        console.log('\n📧 Testing OTP Endpoint...');
        const otpResponse = await axios.post(`${API_URL}/api/auth/send-otp`, {
            name: 'Live Test',
            email: 'test@farmstay.com',
            phone: '1234567890'
        });
        console.log('✅ OTP:', otpResponse.data);
        
        console.log('\n🎉 All endpoints working!');
        
    } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
        console.log('Status:', error.response?.status);
    }
}

testLiveBackend();
