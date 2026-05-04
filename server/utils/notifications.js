const nodemailer = require('nodemailer');
const twilio = require('twilio');

const sendBookingNotification = async (booking) => {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_FROM && process.env.OWNER_EMAIL) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
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
