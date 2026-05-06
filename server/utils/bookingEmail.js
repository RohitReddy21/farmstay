const nodemailer = require('nodemailer');

const getTransporterConfigs = () => {
    if (process.env.SMTP_PORT) {
        return [{
            label: `smtp-${process.env.SMTP_PORT}`,
            transporter: createTransporter()
        }];
    }

    return [
        {
            label: 'gmail-465',
            transporter: createTransporter({ port: 465, secure: true })
        },
        {
            label: 'gmail-587',
            transporter: createTransporter({ port: 587, secure: false })
        }
    ];
};

const createTransporter = (overrides = {}) => {
    const port = Number(overrides.port || process.env.SMTP_PORT || 465);
    const secure = overrides.secure ?? (process.env.SMTP_SECURE === 'false' ? false : port === 465);

    return nodemailer.createTransport({
        service: 'gmail',
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port,
        secure,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000
    });
};

const sendMailWithFallback = async (mailOptions) => {
    let lastError;

    for (const { label, transporter } of getTransporterConfigs()) {
        try {
            const info = await transporter.sendMail(mailOptions);
            return { info, transport: label };
        } catch (error) {
            lastError = error;
            console.error('Booking confirmation email transport failed:', {
                transport: label,
                code: error.code,
                command: error.command,
                responseCode: error.responseCode,
                message: error.message
            });
        }
    }

    throw lastError;
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

const getBookingTotal = (booking) => Number(booking.totalPrice || 0) + Number(booking.tax || 0);

const buildBookingEmail = (booking, user = {}) => {
    const guestName = booking.guestDetails?.name || user.name || 'Guest';
    const propertyTitle = booking.propertyTitle || booking.property?.title || 'Brown Cows Farm Stay';
    const dates = `${formatDate(booking.startDate)} to ${formatDate(booking.endDate)}`;
    const guests = getGuestCount(booking.guests);
    const amount = getBookingTotal(booking);
    const payment = getPaymentLabel(booking);
    const bookingId = String(booking._id || booking.id || '-');

    const text = [
        `Hi ${guestName},`,
        '',
        'Your Brown Cows Dairy booking request has been received and is pending admin approval.',
        '',
        `Booking ID: ${bookingId}`,
        `Stay: ${propertyTitle}`,
        `Dates: ${dates}`,
        `Guests: ${guests}`,
        `Amount: Rs ${amount}`,
        `Payment: ${payment}`,
        `Status: Pending admin approval`,
        '',
        'You can view the latest status in My Bookings.',
        '',
        'Brown Cows Organic Dairy'
    ].join('\n');

    const html = `
        <div style="margin:0;padding:24px;background:#f7efe2;font-family:Arial,sans-serif;color:#211b14;">
            <div style="max-width:620px;margin:0 auto;background:#fffaf1;border:1px solid #ead7b8;border-radius:18px;overflow:hidden;">
                <div style="padding:24px;background:#8b5e34;color:#fff;">
                    <div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">Brown Cows Dairy</div>
                    <h1 style="margin:10px 0 0;font-size:26px;line-height:1.2;">Booking Received</h1>
                </div>
                <div style="padding:24px;">
                    <p style="margin:0 0 14px;">Hi <strong>${guestName}</strong>,</p>
                    <p style="margin:0 0 20px;color:#645747;">Your booking request has been received and is pending admin approval.</p>
                    <table style="width:100%;border-collapse:collapse;background:#f8efdf;border:1px solid #ead7b8;border-radius:14px;overflow:hidden;">
                        <tbody>
                            ${[
                                ['Booking ID', bookingId],
                                ['Stay', propertyTitle],
                                ['Dates', dates],
                                ['Guests', guests],
                                ['Amount', `Rs ${amount}`],
                                ['Payment', payment],
                                ['Status', 'Pending admin approval']
                            ].map(([label, value]) => `
                                <tr>
                                    <td style="padding:12px 14px;border-bottom:1px solid #ead7b8;color:#645747;font-size:14px;">${label}</td>
                                    <td style="padding:12px 14px;border-bottom:1px solid #ead7b8;text-align:right;font-weight:700;">${value}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <p style="margin:20px 0 0;color:#645747;font-size:14px;">You can view the latest status in My Bookings.</p>
                    <p style="margin:20px 0 0;font-size:14px;">Brown Cows Organic Dairy</p>
                </div>
            </div>
        </div>
    `;

    return { subject: `Brown Cows Dairy booking received - ${propertyTitle}`, text, html };
};

const sendBookingConfirmationEmail = async (booking, user = {}) => {
    const to = booking.guestDetails?.email || user.email;
    const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

    if (!to || !from || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('Booking confirmation email skipped:', {
            bookingId: String(booking._id || booking.id),
            to,
            emailConfigured: Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS)
        });
        return { skipped: true };
    }

    const email = buildBookingEmail(booking, user);

    try {
        const { info, transport } = await sendMailWithFallback({
            from: {
                name: 'Brown Cows Dairy',
                address: from
            },
            to,
            subject: email.subject,
            text: email.text,
            html: email.html
        });

        console.log('Booking confirmation email sent:', {
            bookingId: String(booking._id || booking.id),
            to,
            messageId: info.messageId,
            transport
        });
        return { success: true, info };
    } catch (error) {
        console.error('Booking confirmation email failed:', {
            bookingId: String(booking._id || booking.id),
            to,
            code: error.code,
            command: error.command,
            responseCode: error.responseCode,
            message: error.message
        });
        return { success: false, error };
    }
};

module.exports = {
    sendBookingConfirmationEmail
};
