const express = require('express');
const crypto = require('crypto');
const Lead = require('../models/Lead');
const { sendResendEmail } = require('../utils/email');
const { sendSMS } = require('../utils/sms');

const router = express.Router();
const getPhoneDigits = (phone = '') => String(phone).replace(/\D/g, '');
const phoneOtpStore = new Map();

const createPhoneOtp = () => String(crypto.randomInt(100000, 999999));
const cleanupPhoneOtps = () => {
    const now = Date.now();
    for (const [sessionId, entry] of phoneOtpStore.entries()) {
        if (entry.expiresAt <= now) phoneOtpStore.delete(sessionId);
    }
};

const sendLeadEmail = async (lead) => {
    const to = process.env.OWNER_EMAIL || process.env.ADMIN_EMAIL;
    if (!to) {
        console.log('Lead email notification skipped:', lead.email);
        return;
    }

    await sendResendEmail({
        replyTo: lead.email,
        to,
        subject: `New retreat brochure lead - ${lead.name}`,
        text: [
            `Name: ${lead.name}`,
            `Email: ${lead.email}`,
            `Phone: ${lead.phone}`,
            `Guests: ${lead.guests}`,
            `Source: ${lead.source}`,
            `Retreat: ${lead.retreatName || 'Learning Retreat'}`
        ].join('\n')
    });
};

const createLead = async ({ name, email, phone, guests, source, retreatName, marketingConsent = false, phoneVerified = false }) => {
    const phoneDigits = getPhoneDigits(phone);

    return Lead.create({
        name,
        email,
        phone: phoneDigits,
        guests: Math.max(1, Number(guests) || 1),
        source,
        retreatName,
        marketingConsent: Boolean(marketingConsent),
        phoneVerified: Boolean(phoneVerified)
    });
};

router.post('/', async (req, res) => {
    try {
        const { name, email, phone, guests, source, retreatName, marketingConsent } = req.body;

        if (!name || !email || !phone) {
            return res.status(400).json({ message: 'Name, email, and phone are required.' });
        }

        const phoneDigits = getPhoneDigits(phone);
        if (phoneDigits.length !== 10) {
            return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });
        }

        const lead = await createLead({
            name,
            email,
            phone: phoneDigits,
            guests,
            source,
            retreatName,
            marketingConsent
        });

        sendLeadEmail(lead).catch((error) => {
            console.error('Lead email notification failed:', error);
        });

        res.status(201).json({ success: true, leadId: lead._id });
    } catch (error) {
        console.error('Lead creation error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/send-phone-otp', async (req, res) => {
    try {
        const { name, email, phone, guests, source, retreatName, marketingConsent } = req.body;

        if (!name || !email || !phone) {
            return res.status(400).json({ message: 'Name, email, and phone are required.' });
        }

        const phoneDigits = getPhoneDigits(phone);
        if (phoneDigits.length !== 10) {
            return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });
        }

        const lead = await createLead({
            name,
            email,
            phone: phoneDigits,
            guests,
            source: source || 'phone-otp',
            retreatName,
            marketingConsent: marketingConsent !== false
        });

        sendLeadEmail(lead).catch((error) => {
            console.error('Lead email notification failed:', error);
        });

        cleanupPhoneOtps();
        const otp = createPhoneOtp();
        const otpSessionId = crypto.randomUUID();
        phoneOtpStore.set(otpSessionId, {
            phone: phoneDigits,
            leadId: String(lead._id),
            otp,
            attempts: 0,
            expiresAt: Date.now() + 5 * 60 * 1000
        });

        const smsResult = await sendSMS(phoneDigits, `Brown Cows Dairy OTP: ${otp}. Valid for 5 minutes.`);

        res.status(201).json({
            success: true,
            leadId: lead._id,
            otpSessionId,
            smsSkipped: Boolean(smsResult?.skipped),
            smsSent: Boolean(smsResult?.success)
        });
    } catch (error) {
        console.error('Lead phone OTP error:', error);
        res.status(500).json({ message: 'Could not send phone OTP.' });
    }
});

router.post('/verify-phone-otp', async (req, res) => {
    try {
        const { otpSessionId, phone, otp } = req.body;
        const phoneDigits = getPhoneDigits(phone);
        const entry = phoneOtpStore.get(otpSessionId);

        if (!entry || entry.phone !== phoneDigits) {
            return res.status(400).json({ message: 'Invalid or expired OTP session.' });
        }

        if (entry.expiresAt <= Date.now()) {
            phoneOtpStore.delete(otpSessionId);
            return res.status(400).json({ message: 'OTP has expired. Please resend OTP.' });
        }

        entry.attempts += 1;
        if (entry.attempts > 3) {
            phoneOtpStore.delete(otpSessionId);
            return res.status(400).json({ message: 'Too many invalid attempts. Please resend OTP.' });
        }

        if (String(otp).trim() !== entry.otp) {
            return res.status(400).json({ message: 'Invalid OTP.' });
        }

        await Lead.findByIdAndUpdate(entry.leadId, { phoneVerified: true });
        phoneOtpStore.delete(otpSessionId);

        res.json({ success: true });
    } catch (error) {
        console.error('Lead phone OTP verification error:', error);
        res.status(500).json({ message: 'Could not verify phone OTP.' });
    }
});

module.exports = router;
