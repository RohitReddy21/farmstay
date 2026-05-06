const axios = require('axios');

const FAST2SMS_URL = 'https://www.fast2sms.com/dev/bulkV2';

const normalizeIndianPhone = (phone = '') => {
    const digits = String(phone).replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
    if (digits.length === 10) return digits;
    return '';
};

const sendSMS = async (phone, message) => {
    const numbers = normalizeIndianPhone(phone);

    if (!process.env.SMS_API_KEY) {
        console.log('SMS skipped: SMS_API_KEY is not configured.');
        return { skipped: true };
    }

    if (!numbers) {
        console.log('SMS skipped: invalid Indian phone number.', { phone });
        return { skipped: true };
    }

    if (!message || !String(message).trim()) {
        console.log('SMS skipped: message is empty.', { phone: numbers });
        return { skipped: true };
    }

    try {
        const { data } = await axios.post(
            FAST2SMS_URL,
            {
                route: 'q',
                message: String(message).trim(),
                language: 'english',
                numbers
            },
            {
                headers: {
                    authorization: process.env.SMS_API_KEY,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );

        console.log('SMS sent successfully:', {
            phone: numbers,
            response: data
        });
        return { success: true, data };
    } catch (error) {
        console.error('SMS sending failed:', {
            phone: numbers,
            message: error.response?.data?.message || error.message,
            response: error.response?.data
        });
        return { success: false, error };
    }
};

const formatDate = (date) => date
    ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    : '-';

const getGuestCount = (guests = {}) => {
    if (typeof guests === 'number') return guests;
    const adults = Number(guests.adults || 0);
    const children = Number(guests.children || 0);
    return Math.max(1, adults + children);
};

const buildBookingSMSMessage = (booking) => {
    const amount = Number(booking.totalPrice || 0) + Number(booking.tax || 0);
    const payment = String(booking.paymentMethod || '').toLowerCase() === 'cod'
        ? 'COD'
        : 'Paid online';

    return [
        'Brown Cows Dairy: Booking received.',
        `ID: ${String(booking._id || booking.id || '-')}`,
        `Stay: ${booking.propertyTitle || 'Farm Stay'}`,
        `Dates: ${formatDate(booking.startDate)} to ${formatDate(booking.endDate)}`,
        `Guests: ${getGuestCount(booking.guests)}`,
        `Amount: Rs ${amount}`,
        `Payment: ${payment}`,
        'Status: Pending approval.'
    ].join(' ');
};

const sendBookingSMSConfirmation = async (booking) => (
    sendSMS(booking.guestDetails?.phone, buildBookingSMSMessage(booking))
);

module.exports = {
    sendSMS,
    sendBookingSMSConfirmation
};
