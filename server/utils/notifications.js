const nodemailer = require('nodemailer');
const twilio = require('twilio');

const sendBookingNotification = async (booking) => {
    // Email Setup (using Nodemailer with SendGrid or Gmail)
    // For now, we'll log it if keys are missing
    if (process.env.SENDGRID_API_KEY) {
        const transporter = nodemailer.createTransport({
            service: 'SendGrid',
            auth: {
                user: 'apikey',
                pass: process.env.SENDGRID_API_KEY
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: process.env.OWNER_EMAIL, // Notify owner
            subject: 'New Farm Booking Confirmed!',
            text: `New booking for farm ID: ${booking.farm} from ${booking.startDate} to ${booking.endDate}. Total: $${booking.totalPrice}`
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log('Email sent');
        } catch (error) {
            console.error('Email error:', error);
        }
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
