const express = require('express');
const Lead = require('../models/Lead');
const { sendResendEmail } = require('../utils/email');

const router = express.Router();
const getPhoneDigits = (phone = '') => String(phone).replace(/\D/g, '');

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
