const express = require('express');
const nodemailer = require('nodemailer');
const Lead = require('../models/Lead');

const router = express.Router();
const getPhoneDigits = (phone = '') => String(phone).replace(/\D/g, '');

const sendLeadEmail = async (lead) => {
    const to = process.env.OWNER_EMAIL || process.env.EMAIL_FROM;
    if (!to || !process.env.EMAIL_FROM) {
        console.log('Lead email notification skipped:', lead.email);
        return;
    }

    let transporter;
    if (process.env.SENDGRID_API_KEY) {
        transporter = nodemailer.createTransport({
            service: 'SendGrid',
            auth: {
                user: 'apikey',
                pass: process.env.SENDGRID_API_KEY
            }
        });
    } else if (process.env.SMTP_HOST) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: process.env.SMTP_SECURE === 'true',
            auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            } : undefined
        });
    }

    if (!transporter) {
        console.log('No email transport configured for lead:', lead.email);
        return;
    }

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
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

router.post('/', async (req, res) => {
    try {
        const { name, email, phone, guests, source, retreatName } = req.body;

        if (!name || !email || !phone) {
            return res.status(400).json({ message: 'Name, email, and phone are required.' });
        }

        const phoneDigits = getPhoneDigits(phone);
        if (phoneDigits.length !== 10) {
            return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });
        }

        const lead = await Lead.create({
            name,
            email,
            phone: phoneDigits,
            guests: Math.max(1, Number(guests) || 1),
            source,
            retreatName
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

module.exports = router;
