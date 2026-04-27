// Add this to your Vercel app to debug
console.log('🔍 Vercel Debug Information');
console.log('📡 VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('🌐 Current Origin:', window.location.origin);
console.log('📧 Environment Variables:', {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    NODE_ENV: import.meta.env.NODE_ENV
});

// Test API call with detailed logging
const testAPI = async () => {
    try {
        console.log('\n📤 Testing API Call...');
        console.log('📡 Full URL:', `${import.meta.env.VITE_API_URL}/api/auth/send-otp`);
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/send-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: 'Debug Test',
                email: 'debug@farmstay.com',
                phone: '1234567890'
            })
        });
        
        const data = await response.json();
        console.log('✅ Response Status:', response.status);
        console.log('✅ Response Data:', data);
        
    } catch (error) {
        console.error('❌ Error Details:');
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
    }
};

// Auto-run test
testAPI();
