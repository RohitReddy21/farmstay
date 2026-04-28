const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const OtpVerification = require('../models/OtpVerification');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { verifyToken } = require('../middleware/authMiddleware');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const normalizeEmail = (email = '') => email.toLowerCase().trim();
const normalizePhone = (phone = '') => phone.replace(/[^\d+]/g, '').trim();
const hashOtp = (otp) => crypto.createHash('sha256').update(String(otp)).digest('hex');
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

const createEmailTransporter = () => {
    const sendgridApiKey = getEnv('SENDGRID_API_KEY', 'SENDGRID_KEY');
    const smtpHost = getEnv('SMTP_HOST');
    const smtpUser = getEnv('SMTP_USER');
    const smtpPass = getEnv('SMTP_PASS');
    const emailUser = getEnv('EMAIL_USER', 'EMAIL_ID', 'Email_id', 'email_id');
    const emailPass = getEnv('EMAIL_PASS', 'EMAIL_PASSWORD', 'Email_pass', 'email_pass');

    if (emailUser && emailPass) {
        return nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: emailUser,
                pass: emailPass
            }
        });
    }

    const effectiveSendgridKey = sendgridApiKey || (emailPass?.startsWith('SG.') ? emailPass : undefined);

    if (effectiveSendgridKey) {
        return nodemailer.createTransport({
            service: 'SendGrid',
            auth: {
                user: 'apikey',
                pass: effectiveSendgridKey
            }
        });
    }

    if (smtpHost && smtpUser && smtpPass) {
        return nodemailer.createTransport({
            host: smtpHost,
            port: Number(process.env.SMTP_PORT || 587),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: smtpUser,
                pass: smtpPass
            }
        });
    }

    return null;
};

const sendEmailOtp = async (email, otp) => {
    const transporter = createEmailTransporter();

    if (!transporter) {
        throw new Error('Email OTP is not configured. Add SENDGRID_API_KEY, SMTP settings, or EMAIL_USER/EMAIL_PASS on the server.');
    }

    await transporter.verify();
    await transporter.sendMail({
        from: getEnv('EMAIL_FROM', 'SMTP_FROM', 'EMAIL_USER', 'EMAIL_ID', 'Email_id', 'email_id', 'SMTP_USER'),
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
    });
};

// @route   GET /api/auth/health
// @desc    Verify auth routes are mounted
router.get('/health', (req, res) => {
    res.json({
        message: 'Auth routes are working',
        timestamp: new Date().toISOString()
    });
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

// @route   POST /api/auth/send-otp
// @desc    Send email OTP before signup
router.post('/send-otp', async (req, res) => {
    try {
        if (!isDatabaseConnected()) {
            return res.status(503).json({ message: 'Database is still connecting. Please try again in a few seconds.' });
        }

        const normalizedEmail = normalizeEmail(req.body.email);

        if (!normalizedEmail) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await OtpVerification.deleteMany({ email: normalizedEmail });

        await OtpVerification.create({
            email: normalizedEmail,
            otpHash: hashOtp(otp),
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });

        try {
            await sendEmailOtp(normalizedEmail, otp);
        } catch (emailError) {
            await OtpVerification.deleteMany({ email: normalizedEmail });
            throw emailError;
        }

        res.json({ message: 'OTP sent to your email address.' });
    } catch (error) {
        console.error('Send OTP Error:', error);
        if (error.name?.includes('Mongo') || error.message?.includes('buffering timed out')) {
            return res.status(503).json({ message: 'Database is not connected. Please restart the server or check MONGO_URI.' });
        }

        res.status(500).json({
            message: 'Unable to send OTP. Please check the email sender configuration.',
            error: process.env.NODE_ENV === 'production' ? undefined : error.message,
            code: error.code || error.responseCode || error.name
        });
    }
});

// @route   POST /api/auth/register
// @desc    Register user after email OTP verification
router.post('/register', async (req, res) => {
    try {
        if (!isDatabaseConnected()) {
            return res.status(503).json({ message: 'Database is still connecting. Please try again in a few seconds.' });
        }

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

        const otpRecord = await OtpVerification.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });
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

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (user.isEmailVerified === false) {
            return res.status(403).json({ message: 'Please verify your email before logging in.' });
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
