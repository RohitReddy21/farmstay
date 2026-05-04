const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { verifyToken } = require('../middleware/authMiddleware');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const normalizeEmail = (email = '') => email.toLowerCase().trim();
const normalizePhone = (phone = '') => phone.replace(/[^\d+]/g, '').trim();
const getPhoneDigits = (phone = '') => String(phone).replace(/\D/g, '');
const isDatabaseConnected = () => mongoose.connection.readyState === 1;
const getEnv = (...keys) => {
    for (const key of keys) {
        const value = process.env[key];
        if (typeof value === 'string' && value.trim()) {
            return value.trim();
        }
    }
    return undefined;
};

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

let cachedTransporter = null;

const getEmailProvider = () => {
    if (getEnv('EMAIL_USER', 'EMAIL_ID', 'Email_id', 'email_id') && getEnv('EMAIL_PASS', 'EMAIL_PASSWORD', 'Email_pass', 'email_pass')) return 'gmail-smtp';
    return null;
};

const createEmailTransporter = () => {
    if (cachedTransporter) {
        return cachedTransporter;
    }

    const emailUser = getEnv('EMAIL_USER', 'EMAIL_ID', 'Email_id', 'email_id');
    const emailPass = getEnv('EMAIL_PASS', 'EMAIL_PASSWORD', 'Email_pass', 'email_pass');

    if (emailUser && emailPass) {
        cachedTransporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: emailUser,
                pass: emailPass
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        return cachedTransporter;
    }

    return null;
};

// @route   GET /api/auth/health
// @desc    Verify auth routes are mounted
router.get('/health', (req, res) => {
    res.json({
        message: 'Auth routes are working',
        timestamp: new Date().toISOString(),
        emailConfigured: !!getEmailProvider(),
        emailProvider: getEmailProvider(),
        emailFromConfigured: !!getEnv('EMAIL_FROM', 'EMAIL_USER', 'EMAIL_ID', 'Email_id', 'email_id'),
        env: process.env.NODE_ENV
    });
});

// @route   GET /api/auth/test-email
// @desc    Test email configuration (Diagnostics)
router.get('/test-email', async (req, res) => {
    try {
        const provider = getEmailProvider();
        if (!provider) {
            return res.status(503).json({ 
                success: false, 
                message: 'No email transporter configured. Check environment variables.' 
            });
        }

        const transporter = createEmailTransporter();

        const fromAddress = getEnv('EMAIL_USER', 'EMAIL_ID', 'Email_id', 'email_id');
        
        // Try to verify connection
        await transporter.verify();
        
        res.json({ 
            success: true, 
            message: 'Email transporter is connected and verified!',
            from: fromAddress,
            transporterType: transporter.options.service || 'gmail-smtp'
        });
    } catch (error) {
        console.error('Email Test Failed:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Email verification failed', 
            error: error.message,
            code: error.code
        });
    }
});

// @route   POST /api/auth/google
// @desc    Google Login/Register
router.post('/google', async (req, res) => {
    try {
        if (!process.env.GOOGLE_CLIENT_ID) {
            return res.status(500).json({ message: 'Google OAuth is not configured' });
        }

        const { token } = req.body;
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const { name, email } = ticket.getPayload();

        let user = await User.findOne({ email: normalizeEmail(email) });

        if (!user) {
            const randomPassword = crypto.randomBytes(16).toString('hex');
            user = await User.create({
                name,
                email: normalizeEmail(email),
                password: randomPassword,
                isEmailVerified: true,
                role: 'user'
            });
        } else if (!user.isEmailVerified) {
            user.isEmailVerified = true;
            await user.save();
        }

        const jwtToken = createToken(user);
        res.json(authPayload(user, jwtToken));
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401).json({ message: 'Google Authentication Failed' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user without surfacing stale-token 401s during app boot
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.json(null);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id).select('-password');
        if (!user) {
            return res.json(null);
        }

        res.json(user);
    } catch (error) {
        res.json(null);
    }
});

// @route   POST /api/auth/register
// @desc    Register user
router.post('/register', async (req, res) => {
    try {
        if (!isDatabaseConnected()) {
            return res.status(503).json({ message: 'Database is still connecting. Please try again in a few seconds.' });
        }

        const { name, email, phone, password } = req.body;
        const normalizedEmail = normalizeEmail(email);
        const normalizedPhone = normalizePhone(phone);

        if (!name?.trim() || !normalizedEmail || !normalizedPhone || !password) {
            return res.status(400).json({ message: 'Name, email, mobile number, and password are required.' });
        }

        if (getPhoneDigits(normalizedPhone).length !== 10) {
            return res.status(400).json({ message: 'Mobile number must be exactly 10 digits.' });
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

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            phone: normalizedPhone,
            password,
            isEmailVerified: true
        });

        const token = createToken(user);
        res.status(201).json(authPayload(user, token));
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = normalizeEmail(email);

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = createToken(user);
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
        const normalizedEmail = normalizeEmail(email);

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({ message: 'No account found with that email' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
        await user.save();

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

module.exports = router;
