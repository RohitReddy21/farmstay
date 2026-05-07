const { Resend } = require('resend');

const DEFAULT_FROM = 'Brown Cows Dairy <bookings@browncowsorganicfarms.com>';

const getResendClient = () => {
    const apiKey = process.env.RESEND_API_KEY?.trim();

    if (!apiKey) {
        return null;
    }

    return new Resend(apiKey);
};

const sendResendEmail = async ({ to, subject, html, text, replyTo }) => {
    try {
        if (!to) {
            console.error('Email missing, skipping email send');
            return false;
        }

        const resend = getResendClient();
        if (!resend) {
            console.error('RESEND_API_KEY missing, skipping email send', { to, subject });
            return false;
        }

        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM?.trim() || DEFAULT_FROM,
            to,
            subject,
            html,
            text,
            replyTo
        });

        if (error) {
            console.error('Resend error', {
                to,
                subject,
                error
            });
            return false;
        }

        console.log('Email sent', {
            to,
            subject,
            id: data?.id
        });
        return true;
    } catch (error) {
        console.error('Resend error', {
            to,
            subject,
            message: error.message,
            error
        });
        return false;
    }
};

const sendEmail = async (email, otp) => {
    try {
        if (!email) {
            console.error('Email missing');
            return false;
        }

        const html = `
            <div style="font-family:Arial,sans-serif;line-height:1.5;color:#211b14;">
                <h2>Your OTP is: ${otp}</h2>
                <p>This OTP is valid for 5 minutes.</p>
                <p>If you did not request this code, please ignore this email.</p>
            </div>
        `;

        const success = await sendResendEmail({
            to: email,
            subject: 'Your OTP Code',
            html,
            text: `Your OTP is: ${otp}. This OTP is valid for 5 minutes.`
        });

        if (success) {
            console.log('Email sent');
        }

        return success;
    } catch (error) {
        console.error('Resend error', error);
        return false;
    }
};

module.exports = {
    sendEmail,
    sendResendEmail
};
