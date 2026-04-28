// Test Google OAuth Configuration
console.log('🔍 Testing Google OAuth Configuration...');

// Check environment variables
console.log('📡 VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
console.log('📡 Client ID exists:', !!import.meta.env.VITE_GOOGLE_CLIENT_ID);
console.log('📡 Client ID length:', import.meta.env.VITE_GOOGLE_CLIENT_ID?.length);

// Check if it's the placeholder
const isPlaceholder = import.meta.env.VITE_GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE';
console.log('📡 Is placeholder:', isPlaceholder);

// Expected client ID
const expectedClientId = '1040977362540-mga2krg3jei6brli0fb4eks98vv0n8le.apps.googleusercontent.com';
console.log('📡 Expected Client ID:', expectedClientId);
console.log('📡 Matches expected:', import.meta.env.VITE_GOOGLE_CLIENT_ID === expectedClientId);

// Check Google OAuth Provider availability
try {
    const { GoogleOAuthProvider } = require('@react-oauth/google');
    console.log('✅ GoogleOAuthProvider imported successfully');
} catch (error) {
    console.error('❌ GoogleOAuthProvider import failed:', error.message);
}

// Test GoogleLogin component
try {
    const { GoogleLogin } = require('@react-oauth/google');
    console.log('✅ GoogleLogin component imported successfully');
} catch (error) {
    console.error('❌ GoogleLogin component import failed:', error.message);
}

console.log('🎯 Google OAuth Configuration Test Complete');
