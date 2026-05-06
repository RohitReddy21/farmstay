const twilio = require('twilio');
const { sendResendEmail } = require('./email');

const sendBookingNotification = async (booking) => {
    if (process.env.OWNER_EMAIL) {
        await sendResendEmail({
            to: process.env.OWNER_EMAIL,
            subject: 'New Farm Booking Confirmed!',
            text: `New booking for farm ID: ${booking.farm || booking.property} from ${booking.startDate} to ${booking.endDate}. Total: ${booking.totalPrice}`
        });
    } else {
        console.log('Simulating Email Notification:', `Booking ${booking._id} confirmed.`);
    }

    // SMS Setup (Twilio)
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

        try {
            await client.messages.create({
                body: `New Booking! Farm: ${booking.farm}, Dates: ${booking.startDate}-${booking.endDate}`,
                to: process.env.OWNER_PHONE,
                from: process.env.TWILIO_PHONE_NUMBER
            });
            console.log('SMS sent');
        } catch (error) {
            console.error('SMS error:', error);
        }
    } else {
        console.log('Simulating SMS Notification:', `Booking ${booking._id} confirmed.`);
    }
};

module.exports = { sendBookingNotification };
