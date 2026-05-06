const https = require('https');

const isWhatsAppConfigured = () => Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN &&
    process.env.WHATSAPP_PHONE_NUMBER_ID &&
    process.env.WHATSAPP_ENABLED !== 'false'
);

const postJson = (url, payload, headers = {}) => new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const request = https.request(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
            ...headers
        }
    }, (response) => {
        let data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });
        response.on('end', () => {
            let parsed = {};
            try {
                parsed = data ? JSON.parse(data) : {};
            } catch (error) {
                parsed = { raw: data };
            }

            if (response.statusCode >= 200 && response.statusCode < 300) {
                resolve(parsed);
                return;
            }

            const error = new Error(parsed?.error?.message || `WhatsApp API failed with status ${response.statusCode}`);
            error.statusCode = response.statusCode;
            error.details = parsed;
            reject(error);
        });
    });

    request.on('error', reject);
    request.write(body);
    request.end();
});

const toWhatsAppPhone = (phone = '') => {
    const digits = String(phone).replace(/\D/g, '');
    if (digits.length === 10) return `91${digits}`;
    return digits;
};

const formatDate = (date) => date
    ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '-';

const getGuestCount = (guests = {}) => {
    if (typeof guests === 'number') return guests;
    const adults = Number(guests.adults || 0);
    const children = Number(guests.children || 0);
    return Math.max(1, adults + children);
};

const getPaymentLabel = (booking) => (
    String(booking.paymentMethod || '').toLowerCase() === 'cod'
        ? 'COD / Pay at Farm'
        : 'Razorpay Online'
);

const buildBookingMessage = (booking) => {
    const bookingId = String(booking._id || booking.id || '-');
    const propertyTitle = booking.propertyTitle || booking.property?.title || 'Brown Cows Farm Stay';
    const amount = Number(booking.totalPrice || 0) + Number(booking.tax || 0);

    return [
        `Hi ${booking.guestDetails?.name || 'Guest'},`,
        '',
        'Your Brown Cows Dairy booking request has been received.',
        '',
        `Booking ID: ${bookingId}`,
        `Stay: ${propertyTitle}`,
        `Dates: ${formatDate(booking.startDate)} to ${formatDate(booking.endDate)}`,
        `Guests: ${getGuestCount(booking.guests)}`,
        `Amount: Rs ${amount}`,
        `Payment: ${getPaymentLabel(booking)}`,
        'Status: Pending admin approval',
        '',
        'We will update you after the host reviews your booking.'
    ].join('\n');
};

const buildTemplatePayload = (booking, to) => {
    const templateName = process.env.WHATSAPP_BOOKING_TEMPLATE_NAME || process.env.WHATSAPP_TEMPLATE_NAME;
    if (!templateName) return null;

    const bookingId = String(booking._id || booking.id || '-');
    const propertyTitle = booking.propertyTitle || booking.property?.title || 'Brown Cows Farm Stay';
    const amount = Number(booking.totalPrice || 0) + Number(booking.tax || 0);

    return {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
            name: templateName,
            language: {
                code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en_US'
            },
            components: [{
                type: 'body',
                parameters: [
                    { type: 'text', text: booking.guestDetails?.name || 'Guest' },
                    { type: 'text', text: bookingId },
                    { type: 'text', text: propertyTitle },
                    { type: 'text', text: `${formatDate(booking.startDate)} to ${formatDate(booking.endDate)}` },
                    { type: 'text', text: String(getGuestCount(booking.guests)) },
                    { type: 'text', text: `Rs ${amount}` },
                    { type: 'text', text: getPaymentLabel(booking) },
                    { type: 'text', text: 'Pending admin approval' }
                ]
            }]
        }
    };
};

const sendBookingWhatsAppConfirmation = async (booking) => {
    if (!isWhatsAppConfigured()) {
        console.log('WhatsApp booking confirmation skipped: API is not configured.');
        return { skipped: true };
    }

    const to = toWhatsAppPhone(booking.guestDetails?.phone);
    if (!to) {
        console.log('WhatsApp booking confirmation skipped: booking phone is missing.');
        return { skipped: true };
    }

    const graphVersion = process.env.WHATSAPP_GRAPH_VERSION || 'v21.0';
    const url = `https://graph.facebook.com/${graphVersion}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const payload = buildTemplatePayload(booking, to) || {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: {
            preview_url: false,
            body: buildBookingMessage(booking)
        }
    };

    try {
        const response = await postJson(url, payload, {
            Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`
        });
        console.log('WhatsApp booking confirmation sent:', {
            bookingId: String(booking._id || booking.id),
            to,
            messageId: response?.messages?.[0]?.id
        });
        return { success: true, response };
    } catch (error) {
        console.error('WhatsApp booking confirmation failed:', {
            bookingId: String(booking._id || booking.id),
            to,
            message: error.message,
            details: error.details
        });
        return { success: false, error };
    }
};

module.exports = {
    sendBookingWhatsAppConfirmation
};
