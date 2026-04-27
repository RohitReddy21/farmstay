const { sendOTP } = require('./sendOTP.js');
const crypto = require('crypto');

/**
 * Test function to demonstrate OTP sending functionality
 */
export const testEmailOTP = async (email) => {
    try {
        // Generate a 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        
        console.log(`🔢 Generated OTP: ${otp}`);
        console.log(`📧 Sending to: ${email}`);
        
        // Send the OTP email
        const success = await sendOTP(email, otp);
        
        if (success) {
            console.log('✅ Test email sent successfully!');
            console.log('📱 Check your email inbox for the OTP.');
        } else {
            console.log('❌ Failed to send test email.');
        }
        
        return { success, otp };
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        return { success: false, error: error.message };
    }
};

// Example usage:
// testEmailOTP('your-test-email@example.com');

module.exports = { testEmailOTP };
