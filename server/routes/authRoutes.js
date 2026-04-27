const express = require('express');
const router = express.Router();
const User = require('../models/User');
const OtpVerification = require('../models/OtpVerification');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { verifyToken } = require('../middleware/authMiddleware');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Health check to verify auth routes are loaded
router.get('/health', (req, res) => {
    console.log('🏥 Auth routes health check called');
    res.json({ 
        message: 'Auth routes are working',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

const normalizeEmail = (email = '') => email.toLowerCase().trim();
const normalizePhone = (phone = '') => phone.replace(/[^\d+]/g, '').trim();
const hashOtp = (otp) => crypto.createHash('sha256').update(String(otp)).digest('hex');

const createToken = (user) => jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
});

const authPayload = (user, token) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    isEmailVerified: user.isEmailVerified,
    role: user.role,
    token
});

const getEmailTransporter = () => {
    console.log('🔧 Creating email transporter...');
    console.log('🔧 Checking email configuration options...');
    
    if (process.env.SENDGRID_API_KEY) {
        console.log('📧 Using SendGrid configuration');
        return nodemailer.createTransport({
            service: 'SendGrid',
            auth: {
                user: 'apikey',
                pass: process.env.SENDGRID_API_KEY
            }
        });
    }

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        console.log('📧 Using custom SMTP configuration');
        console.log('🔧 SMTP Host:', process.env.SMTP_HOST);
        console.log('🔧 SMTP Port:', process.env.SMTP_PORT || 587);
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        console.log('📧 Using Gmail SMTP configuration');
        console.log('🔧 EMAIL_USER:', process.env.EMAIL_USER);
        console.log('🔧 EMAIL_PASS length:', process.env.EMAIL_PASS.length);
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        console.log('✅ Gmail transporter created successfully');
        return transporter;
    }

    console.log('❌ No email configuration found');
    return null;
};

const sendEmailOtp = async (email, otp) => {
    console.log('📧 sendEmailOtp function called');
    console.log('📧 Email to:', email);
    console.log('📧 OTP:', otp);
    
    const transporter = getEmailTransporter();

    if (!transporter) {
        console.log('❌ No transporter created');
        throw new Error('Email OTP is not configured. Add SENDGRID_API_KEY, SMTP settings, or EMAIL_USER/EMAIL_PASS on the server.');
    }

    console.log('✅ Transporter created, preparing email...');
    
    const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.SMTP_USER,
        to: email,
        subject: 'Your Brown Cows Dairy signup OTP',
        html: `
            <div style="font-family:Arial,sans-serif;color:#211b14;line-height:1.6">
                <h2>Brown Cows Dairy email verification</h2>
                <p>Your signup OTP is:</p>
                <p style="font-size:28px;font-weight:700;letter-spacing:6px;color:#7a5527">${otp}</p>
                <p>This code expires in 10 minutes.</p>
            </div>
        `
    };
    
    console.log('📧 Mail options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
    });

    try {
        console.log('� Verifying transporter connection...');
        await transporter.verify();
        console.log('✅ Transporter connection verified');
        
        console.log('�📧 Sending email...');
        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully!');
        console.log('📧 SendMail result:', result);
        return { sent: true, result };
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error message:', error.message);
        console.error('❌ Full error:', error);
        
        // Add specific Gmail error handling
        if (error.code === 'EAUTH') {
            console.error('🔧 Gmail authentication failed - check EMAIL_USER and EMAIL_PASS');
            console.error('🔧 Make sure EMAIL_PASS is a Gmail App Password, not regular password');
        } else if (error.code === 'ECONNECTION') {
            console.error('🔧 Gmail connection failed - check network and Gmail settings');
        }
        
        throw error;
    }
};

// @route   POST /api/auth/google
// @desc    Google Login/Register
router.post('/google', async (req, res) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const { name, email, picture } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (!user) {
            // Create new user
            // Generate a random password since they use Google
            const randomPassword = crypto.randomBytes(16).toString('hex');
            user = await User.create({
                name,
                email,
                password: randomPassword,
                isEmailVerified: true,
                role: 'user'
            });
        }

        const jwtToken = createToken(user);

        res.json(authPayload(user, jwtToken));
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401).json({ message: 'Google Authentication Failed' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
router.get('/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/auth/send-otp
// @desc    Send email OTP before signup
router.post('/send-otp', async (req, res) => {
    console.log('📧 Send OTP route called');
    console.log('📤 Request body:', req.body);
    
    // Debug environment variables
    console.log('🔧 EMAIL_USER:', process.env.EMAIL_USER);
    console.log('🔧 EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
    console.log('🔧 EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);
    console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
    
    try {
        const { name, email, phone } = req.body;
        const normalizedEmail = normalizeEmail(email);
        const normalizedPhone = normalizePhone(phone);
        
        console.log('📧 Normalized data:', { name, normalizedEmail, normalizedPhone });

        if (!name?.trim() || !normalizedEmail || !normalizedPhone) {
            return res.status(400).json({ message: 'Name, email, and mobile number are required.' });
        }

        const userExists = await User.findOne({
            $or: [
                { email: normalizedEmail },
                { phone: normalizedPhone }
            ]
        });

        if (userExists) {
            return res.status(400).json({ message: 'An account already exists with this email or mobile number.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log('🔢 OTP generated:', otp);
        
        await OtpVerification.deleteMany({ email: normalizedEmail });
        console.log('🗑️ Old OTPs deleted for:', normalizedEmail);

        await OtpVerification.create({
            email: normalizedEmail,
            otpHash: hashOtp(otp),
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });
        console.log('💾 New OTP saved to database');

        try {
            console.log('📧 Starting email send process...');
            const emailResult = await sendEmailOtp(normalizedEmail, otp);
            console.log('✅ Email sent successfully:', emailResult);
            const response = {
                message: 'OTP sent to your email address.'
            };
            res.json(response);
        } catch (emailError) {
            console.error('Email sending failed:', emailError.message);
            // Still return success but with a different message for development
            if (process.env.NODE_ENV === 'development') {
                res.status(500).json({ 
                    message: 'Email configuration error: ' + emailError.message,
                    debug: {
                        email_user_set: !!process.env.EMAIL_USER,
                        email_pass_set: !!process.env.EMAIL_PASS,
                        smtp_user_set: !!process.env.SMTP_USER,
                        smtp_pass_set: !!process.env.SMTP_PASS,
                        sendgrid_set: !!process.env.SENDGRID_API_KEY
                    }
                });
            } else {
                // In production, don't expose configuration details
                res.status(500).json({ 
                    message: 'Unable to send OTP. Please contact support.'
                });
            }
        }
    } catch (error) {
        console.error('Send OTP Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/auth/register
// @desc    Register user
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password, otp } = req.body;
        const normalizedEmail = normalizeEmail(email);
        const normalizedPhone = normalizePhone(phone);

        if (!name?.trim() || !normalizedEmail || !normalizedPhone || !password || !otp) {
            return res.status(400).json({ message: 'Name, email, mobile number, password, and OTP are required.' });
        }

        const userExists = await User.findOne({
            $or: [
                { email: normalizedEmail },
                { phone: normalizedPhone }
            ]
        });
        if (userExists) {
            return res.status(400).json({ message: 'An account already exists with this email or mobile number.' });
        }

        const otpRecord = await OtpVerification.findOne({
            email: normalizedEmail
        }).sort({ createdAt: -1 });

        if (!otpRecord || otpRecord.expiresAt < new Date()) {
            return res.status(400).json({ message: 'OTP is invalid or expired. Please request a new OTP.' });
        }

        if (otpRecord.attempts >= 5) {
            await OtpVerification.deleteOne({ _id: otpRecord._id });
            return res.status(429).json({ message: 'Too many invalid OTP attempts. Please request a new OTP.' });
        }

        if (hashOtp(otp) !== otpRecord.otpHash) {
            otpRecord.attempts += 1;
            await otpRecord.save();
            return res.status(400).json({ message: 'Invalid OTP. Please check the code and try again.' });
        }

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            phone: normalizedPhone,
            password,
            isEmailVerified: true
        });

        await OtpVerification.deleteMany({ email: normalizedEmail });

        const token = createToken(user);

        res.status(201).json(authPayload(user, token));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = normalizeEmail(email);
        console.log('Login attempt:', normalizedEmail);

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            console.log('User not found:', normalizedEmail);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        console.log('User found, comparing password...');
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Password mismatch for:', normalizedEmail);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        console.log('Password match, signing token...');
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined in environment');
        }

        const token = createToken(user);

        console.log('Login successful:', normalizedEmail);
        res.json(authPayload(user, token));
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'No account found with that email' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        // In production, send email with reset link
        // For now, return the token (for development)
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        console.log('Password Reset URL:', resetUrl);

        res.json({
            message: 'Password reset link sent to your email',
            resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { password } = req.body;
        const resetTokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: resetTokenHash,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Debug routes for troubleshooting 404 error
router.get('/test-route', (req, res) => {
    console.log('🧪 Test route called successfully');
    res.json({ 
        message: 'Auth routes are working!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        email_configured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
    });
});

router.post('/test-post', (req, res) => {
    console.log('🧪 Test POST route called');
    console.log('📤 Request body:', req.body);
    res.json({ 
        message: 'POST routes are working!',
        received: req.body,
        timestamp: new Date().toISOString()
    });
});

router.get('/test-env', (req, res) => {
    console.log('🔍 Environment check called');
    res.json({
        email_user_set: !!process.env.EMAIL_USER,
        email_pass_set: !!process.env.EMAIL_PASS,
        client_url: process.env.CLIENT_URL,
        node_env: process.env.NODE_ENV,
        all_env_keys: Object.keys(process.env).filter(key => 
            key.includes('EMAIL') || key.includes('CLIENT') || key.includes('NODE')
        )
    });
});

// Test email configuration endpoint
router.post('/test-email-config', async (req, res) => {
    console.log('🧪 Test email configuration endpoint called');
    
    // Log all environment variables
    console.log('🔧 EMAIL_USER:', process.env.EMAIL_USER);
    console.log('🔧 EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
    console.log('🔧 EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);
    console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
    console.log('🔧 All email-related env vars:', Object.keys(process.env).filter(k => k.includes('EMAIL')));
    
    try {
        // Test transporter creation
        console.log('🔧 Creating email transporter...');
        const transporter = require('nodemailer').createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        console.log('✅ Transporter created');
        
        // Test connection
        console.log('🔧 Verifying connection...');
        await transporter.verify();
        console.log('✅ Connection verified');
        
        res.json({
            success: true,
            message: 'Email configuration is working',
            email_user: process.env.EMAIL_USER,
            email_pass_set: !!process.env.EMAIL_PASS,
            email_pass_length: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0
        });
        
    } catch (error) {
        console.error('❌ Email configuration test failed:', error);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error message:', error.message);
        
        res.json({
            success: false,
            message: 'Email configuration failed',
            error: error.message,
            error_code: error.code,
            email_user: process.env.EMAIL_USER,
            email_pass_set: !!process.env.EMAIL_PASS,
            email_pass_length: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0
        });
    }
});

module.exports = router;
