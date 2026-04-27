const crypto = require('crypto');
const { sendOTP } = require('../utils/sendOTP.js');

// In-memory store for OTPs (in production, use Redis or database)
const otpStore = new Map();

/**
 * Generate and send OTP to user's email
 * @param {string} email - User's email address
 * @param {number} length - OTP length (default: 6)
 * @param {number} expiryMinutes - OTP expiry time in minutes (default: 10)
 * @returns {Promise<Object>} - Returns success status and OTP ID
 */
const generateAndSendOTP = async (email, length = 6, expiryMinutes = 10) => {
    try {
        // Generate random OTP
        const otp = crypto.randomInt(
            Math.pow(10, length - 1), 
            Math.pow(10, length) - 1
        ).toString();
        
        // Generate unique OTP ID
        const otpId = crypto.randomUUID();
        
        // Calculate expiry time
        const expiryTime = new Date(Date.now() + expiryMinutes * 60 * 1000);
        
        // Store OTP with metadata
        otpStore.set(otpId, {
            email: email.toLowerCase(), // Normalize email
            otp,
            createdAt: new Date(),
            expiryTime,
            attempts: 0,
            maxAttempts: 3
        });
        
        // Send OTP email
        const emailSent = await sendOTP(email, otp);
        
        if (!emailSent) {
            // Remove OTP from store if email failed
            otpStore.delete(otpId);
            throw new Error('Failed to send OTP email');
        }
        
        // Clean up expired OTPs periodically
        cleanupExpiredOTPs();
        
        return {
            success: true,
            otpId,
            message: 'OTP sent successfully',
            expiresIn: expiryMinutes * 60 // Return in seconds
        };
        
    } catch (error) {
        console.error('Error generating OTP:', error);
        return {
            success: false,
            message: error.message || 'Failed to generate OTP'
        };
    }
};

/**
 * Verify OTP
 * @param {string} otpId - OTP ID received during generation
 * @param {string} userInputOTP - OTP entered by user
 * @returns {Promise<Object>} - Returns verification result
 */
const verifyOTP = async (otpId, userInputOTP) => {
    try {
        const otpData = otpStore.get(otpId);
        
        if (!otpData) {
            return {
                success: false,
                message: 'Invalid or expired OTP'
            };
        }
        
        // Check if OTP has expired
        if (new Date() > otpData.expiryTime) {
            otpStore.delete(otpId);
            return {
                success: false,
                message: 'OTP has expired'
            };
        }
        
        // Check maximum attempts
        if (otpData.attempts >= otpData.maxAttempts) {
            otpStore.delete(otpId);
            return {
                success: false,
                message: 'Maximum attempts exceeded. Please request a new OTP'
            };
        }
        
        // Increment attempt counter
        otpData.attempts++;
        
        // Verify OTP
        if (otpData.otp !== userInputOTP) {
            const remainingAttempts = otpData.maxAttempts - otpData.attempts;
            
            if (remainingAttempts <= 0) {
                otpStore.delete(otpId);
                return {
                    success: false,
                    message: 'Maximum attempts exceeded. Please request a new OTP'
                };
            }
            
            return {
                success: false,
                message: `Invalid OTP. ${remainingAttempts} attempts remaining`
            };
        }
        
        // OTP is correct - remove from store
        otpStore.delete(otpId);
        
        return {
            success: true,
            message: 'OTP verified successfully',
            email: otpData.email
        };
        
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return {
            success: false,
            message: 'Failed to verify OTP'
        };
    }
};

/**
 * Clean up expired OTPs from memory store
 */
const cleanupExpiredOTPs = () => {
    const now = new Date();
    let cleanedCount = 0;
    
    for (const [otpId, otpData] of otpStore.entries()) {
        if (now > otpData.expiryTime) {
            otpStore.delete(otpId);
            cleanedCount++;
        }
    }
    
    if (cleanedCount > 0) {
        console.log(`🧹 Cleaned up ${cleanedCount} expired OTPs`);
    }
};

/**
 * Get OTP status (for debugging/admin purposes)
 * @param {string} otpId - OTP ID
 * @returns {Object|null} - OTP data or null if not found
 */
const getOTPStatus = (otpId) => {
    const otpData = otpStore.get(otpId);
    
    if (!otpData) {
        return null;
    }
    
    const now = new Date();
    const isExpired = now > otpData.expiryTime;
    const timeRemaining = Math.max(0, Math.floor((otpData.expiryTime - now) / 1000));
    
    return {
        email: otpData.email,
        createdAt: otpData.createdAt,
        expiryTime: otpData.expiryTime,
        isExpired,
        timeRemaining,
        attempts: otpData.attempts,
        maxAttempts: otpData.maxAttempts
    };
};

/**
 * Resend OTP (generates new OTP for same email)
 * @param {string} otpId - Previous OTP ID
 * @returns {Promise<Object>} - Returns new OTP generation result
 */
const resendOTP = async (otpId) => {
    try {
        const otpData = otpStore.get(otpId);
        
        if (!otpData) {
            return {
                success: false,
                message: 'Invalid session. Please request a new OTP'
            };
        }
        
        const email = otpData.email;
        
        // Remove old OTP
        otpStore.delete(otpId);
        
        // Generate new OTP
        return await generateAndSendOTP(email);
        
    } catch (error) {
        console.error('Error resending OTP:', error);
        return {
            success: false,
            message: 'Failed to resend OTP'
        };
    }
};

// Clean up expired OTPs every 5 minutes
setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);

module.exports = {
    generateAndSendOTP,
    verifyOTP,
    getOTPStatus,
    resendOTP,
    cleanupExpiredOTPs
};
