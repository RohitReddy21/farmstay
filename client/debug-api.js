// Debug script to test the exact API call
import axios from 'axios';

const API_URL = 'http://localhost:5001';

async function debugAPI() {
    console.log('🔍 Debugging API call...');
    console.log('📡 API_URL:', API_URL);
    
    try {
        console.log('📤 Sending request to:', `${API_URL}/api/auth/send-otp`);
        
        const response = await axios.post(`${API_URL}/api/auth/send-otp`, {
            name: 'Debug Test',
            email: 'debug@example.com',
            phone: '1234567890'
        });
        
        console.log('✅ Success! Response:', response.data);
        console.log('📊 Status:', response.status);
        
    } catch (error) {
        console.log('❌ Error Details:');
        console.log('Status:', error.response?.status);
        console.log('Status Text:', error.response?.statusText);
        console.log('Response Data:', error.response?.data);
        console.log('Request URL:', error.config?.url);
        console.log('Full Error:', error.message);
        
        if (error.response?.status === 404) {
            console.log('🚨 404 - Endpoint not found!');
            console.log('🔧 Check if server is running and routes are properly configured');
        }
    }
}

// Run the debug
debugAPI();
