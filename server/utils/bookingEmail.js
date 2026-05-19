const { sendResendEmail } = require('./email');

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

const getBookingGrossTotal = (booking) => Number(booking.totalPrice || 0) + Number(booking.tax || 0);
const getBookingTotal = (booking) => Math.max(0, getBookingGrossTotal(booking) - Number(booking.discountAmount || 0));
const getBookingNumber = (booking) => String(booking.bookingCode || booking._id || booking.id || '-');
const WHATSAPP_NUMBER = '919989854411';
const WHATSAPP_DISPLAY = '+91 99898 54411';
const DEFAULT_OWNER_EMAIL = 'browncowsdairy@gmail.com';
const isOnlinePaidBooking = (booking) => (
    String(booking.paymentMethod || '').toLowerCase() === 'razorpay'
    || ['Authorized', 'Captured'].includes(booking.paymentStatus)
);

const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const getOwnerEmail = () => (
    process.env.BOOKING_NOTIFICATION_EMAIL
    || process.env.OWNER_EMAIL
    || process.env.ADMIN_EMAIL
    || DEFAULT_OWNER_EMAIL
);

const getBookingSupportNote = (booking) => (
    `For edit, reschedule, or cancellation requests, contact us on WhatsApp ${WHATSAPP_DISPLAY} with your booking number ${getBookingNumber(booking)}. Online payment refunds, when approved, are processed to the original payment method within 7 working days.`
);

const getBookingSupportWhatsAppUrl = (booking, propertyTitle, dates) => {
    const message = `Hi, I need help with my Brown Cows Dairy booking. Booking Number: ${getBookingNumber(booking)}. Stay: ${propertyTitle}. Dates: ${dates}.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

const buildBookingEmail = (booking, user = {}) => {
    const guestName = booking.guestDetails?.name || user.name || 'Guest';
    const propertyTitle = booking.propertyTitle || booking.property?.title || 'Brown Cows Farm Stay';
    const dates = `${formatDate(booking.startDate)} to ${formatDate(booking.endDate)}`;
    const guests = getGuestCount(booking.guests);
    const amount = getBookingTotal(booking);
    const payment = getPaymentLabel(booking);
    const bookingId = getBookingNumber(booking);
    const supportNote = getBookingSupportNote(booking);
    const supportWhatsAppUrl = getBookingSupportWhatsAppUrl(booking, propertyTitle, dates);

    const text = [
        `Hi ${guestName},`,
        '',
        'Your Brown Cows Dairy booking request has been received and is pending approval.',
        '',
        `Booking Number: ${bookingId}`,
        `Stay: ${propertyTitle}`,
        `Dates: ${dates}`,
        `Guests: ${guests}`,
        `Amount: Rs ${amount}`,
        `Payment: ${payment}`,
        `Status: Pending approval`,
        '',
        supportNote,
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
                    <p style="margin:0 0 20px;color:#645747;">Your booking request has been received and is pending approval.</p>
                    <div style="margin:0 0 20px;padding:16px;border:1px solid #e4c58f;background:#f8efdf;border-radius:14px;">
                        <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#8b5e34;font-weight:700;">Booking Number</div>
                        <div style="margin-top:6px;font-size:22px;line-height:1.2;font-weight:800;color:#211b14;">${bookingId}</div>
                    </div>
                    <table style="width:100%;border-collapse:collapse;background:#f8efdf;border:1px solid #ead7b8;border-radius:14px;overflow:hidden;">
                        <tbody>
                            ${[
                                ['Booking Number', bookingId],
                                ['Stay', propertyTitle],
                                ['Dates', dates],
                                ['Guests', guests],
                                ['Amount', `Rs ${amount}`],
                                ['Payment', payment],
                                ['Status', 'Pending approval']
                            ].map(([label, value]) => `
                                <tr>
                                    <td style="padding:12px 14px;border-bottom:1px solid #ead7b8;color:#645747;font-size:14px;">${label}</td>
                                    <td style="padding:12px 14px;border-bottom:1px solid #ead7b8;text-align:right;font-weight:700;">${value}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div style="margin:20px 0 0;padding:14px 16px;border:1px solid #ead7b8;background:#fff7e8;border-radius:14px;color:#645747;font-size:14px;line-height:1.5;">
                        <strong>Edit, reschedule, or cancel:</strong> ${supportNote}
                        <div style="margin-top:14px;">
                            <a href="${supportWhatsAppUrl}" style="display:inline-block;background:#25D366;color:#ffffff;text-decoration:none;font-weight:700;border-radius:999px;padding:10px 16px;">Contact on WhatsApp</a>
                        </div>
                    </div>
                    <p style="margin:20px 0 0;color:#645747;font-size:14px;">You can view the latest status in My Bookings.</p>
                    <p style="margin:20px 0 0;font-size:14px;">Brown Cows Organic Dairy</p>
                </div>
            </div>
        </div>
    `;

    return { subject: `Brown Cows Dairy booking received - ${propertyTitle}`, text, html };
};

const buildBookingStatusEmail = (booking, user = {}, status = 'Confirmed', rejectionReason = '') => {
    const guestName = booking.guestDetails?.name || user.name || 'Guest';
    const propertyTitle = booking.propertyTitle || booking.property?.title || 'Brown Cows Farm Stay';
    const dates = `${formatDate(booking.startDate)} to ${formatDate(booking.endDate)}`;
    const guests = getGuestCount(booking.guests);
    const amount = getBookingTotal(booking);
    const payment = getPaymentLabel(booking);
    const bookingId = getBookingNumber(booking);
    const supportNote = getBookingSupportNote(booking);
    const supportWhatsAppUrl = getBookingSupportWhatsAppUrl(booking, propertyTitle, dates);
    const isRejected = status === 'Rejected';
    const heading = isRejected ? 'Booking Not Approved' : 'Booking Confirmed';
    const message = isRejected
        ? `Your booking request for ${propertyTitle} was not approved.`
        : `Your booking for ${propertyTitle} has been confirmed.`;
    const statusLabel = isRejected ? 'Rejected' : 'Confirmed';
    const accent = isRejected ? '#9f3f2f' : '#4a7c59';
    const showPaymentNotice = isRejected;
    const paymentNoticeHeading = isOnlinePaidBooking(booking) ? 'Refund notice' : 'Payment notice';
    const refundNotice = 'If any amount has been debited for this booking, it will be refunded to the original bank account or payment method within 7 working days as per payment gateway timelines.';
    const codNotice = 'This was a COD / Pay at Farm booking, so no online amount was collected and no refund action is required.';
    const paymentNotice = isOnlinePaidBooking(booking) ? refundNotice : codNotice;
    const rows = [
        ['Booking Number', bookingId],
        ['Stay', propertyTitle],
        ['Dates', dates],
        ['Guests', guests],
        ['Amount', `Rs ${amount}`],
        ['Payment', payment],
        ['Status', statusLabel],
        ...(isRejected && rejectionReason ? [['Reason', rejectionReason]] : [])
    ];

    const text = [
        `Hi ${guestName},`,
        '',
        message,
        rejectionReason ? `Reason: ${rejectionReason}` : '',
        showPaymentNotice ? paymentNotice : '',
        '',
        `Booking Number: ${bookingId}`,
        `Stay: ${propertyTitle}`,
        `Dates: ${dates}`,
        `Guests: ${guests}`,
        `Amount: Rs ${amount}`,
        `Payment: ${payment}`,
        `Status: ${statusLabel}`,
        '',
        supportNote,
        '',
        'You can view the latest status in My Bookings.',
        '',
        'Brown Cows Organic Dairy'
    ].filter(Boolean).join('\n');

    const html = `
        <div style="margin:0;padding:24px;background:#f7efe2;font-family:Arial,sans-serif;color:#211b14;">
            <div style="max-width:620px;margin:0 auto;background:#fffaf1;border:1px solid #ead7b8;border-radius:18px;overflow:hidden;">
                <div style="padding:24px;background:${accent};color:#fff;">
                    <div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">Brown Cows Dairy</div>
                    <h1 style="margin:10px 0 0;font-size:26px;line-height:1.2;">${heading}</h1>
                </div>
                <div style="padding:24px;">
                    <p style="margin:0 0 14px;">Hi <strong>${guestName}</strong>,</p>
                    <p style="margin:0 0 20px;color:#645747;">${message}</p>
                    ${showPaymentNotice ? `
                        <div style="margin:0 0 20px;padding:14px 16px;border:1px solid #f0c9bd;background:#fff3ee;border-radius:14px;color:#6d3328;font-size:14px;line-height:1.5;">
                            <strong>${paymentNoticeHeading}:</strong> ${paymentNotice}
                        </div>
                    ` : ''}
                    <table style="width:100%;border-collapse:collapse;background:#f8efdf;border:1px solid #ead7b8;border-radius:14px;overflow:hidden;">
                        <tbody>
                            ${rows.map(([label, value]) => `
                                <tr>
                                    <td style="padding:12px 14px;border-bottom:1px solid #ead7b8;color:#645747;font-size:14px;">${label}</td>
                                    <td style="padding:12px 14px;border-bottom:1px solid #ead7b8;text-align:right;font-weight:700;">${value}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div style="margin:20px 0 0;padding:14px 16px;border:1px solid #ead7b8;background:#fff7e8;border-radius:14px;color:#645747;font-size:14px;line-height:1.5;">
                        <strong>Edit, reschedule, or cancel:</strong> ${supportNote}
                        <div style="margin-top:14px;">
                            <a href="${supportWhatsAppUrl}" style="display:inline-block;background:#25D366;color:#ffffff;text-decoration:none;font-weight:700;border-radius:999px;padding:10px 16px;">Contact on WhatsApp</a>
                        </div>
                    </div>
                    <p style="margin:20px 0 0;color:#645747;font-size:14px;">You can view the latest status in My Bookings.</p>
                    <p style="margin:20px 0 0;font-size:14px;">Brown Cows Organic Dairy</p>
                </div>
            </div>
        </div>
    `;

    return {
        subject: isRejected
            ? `Your Brown Cows booking was not approved - ${propertyTitle}`
            : `Your Brown Cows booking is confirmed - ${propertyTitle}`,
        text,
        html
    };
};

const buildOwnerBookingNotificationEmail = (booking, user = {}) => {
    const bookingId = getBookingNumber(booking);
    const guestName = booking.guestDetails?.name || user?.name || 'Guest';
    const guestEmail = booking.guestDetails?.email || user?.email || '-';
    const guestPhone = booking.guestDetails?.phone || user?.phone || '-';
    const propertyTitle = booking.propertyTitle || booking.property?.title || 'Brown Cows Farm Stay';
    const propertyLocation = booking.propertyLocation || booking.property?.location || '-';
    const dates = `${formatDate(booking.startDate)} to ${formatDate(booking.endDate)}`;
    const guests = getGuestCount(booking.guests);
    const grossTotal = getBookingGrossTotal(booking);
    const discountAmount = Number(booking.discountAmount || 0);
    const payableAmount = getBookingTotal(booking);
    const payment = getPaymentLabel(booking);
    const bookingStatus = booking.status || 'Pending';
    const paymentStatus = booking.paymentStatus || 'Pending';
    const specialRequests = booking.guestDetails?.specialRequests || '-';
    const couponCode = booking.couponCode || '-';
    const variationLabel = booking.variation?.label || booking.variation?.type || booking.variation?.cottage || '-';
    const adminUrl = `${(process.env.ADMIN_BOOKINGS_URL || `${process.env.CLIENT_URL || ''}/admin`).replace(/\/$/, '')}`;
    const rows = [
        ['Booking Number', bookingId],
        ['Customer Name', guestName],
        ['Customer Email', guestEmail],
        ['Customer Phone', guestPhone],
        ['Stay', propertyTitle],
        ['Location', propertyLocation],
        ['Room / Stay Type', variationLabel],
        ['Dates', dates],
        ['Guests', guests],
        ['Subtotal + Tax', `Rs ${grossTotal.toLocaleString('en-IN')}`],
        ['Coupon Code', couponCode],
        ['Discount', `Rs ${discountAmount.toLocaleString('en-IN')}`],
        ['Amount Payable', `Rs ${payableAmount.toLocaleString('en-IN')}`],
        ['Payment Method', payment],
        ['Payment Status', paymentStatus],
        ['Booking Status', bookingStatus],
        ['Special Requests', specialRequests]
    ];

    const text = [
        'New Brown Cows booking received.',
        '',
        ...rows.map(([label, value]) => `${label}: ${value}`),
        '',
        adminUrl ? `View in admin: ${adminUrl}` : 'Open the admin dashboard to review this booking.'
    ].join('\n');

    const htmlRows = rows.map(([label, value]) => `
        <tr>
            <td style="padding:12px 14px;border-bottom:1px solid #ead7b8;color:#645747;font-size:14px;">${escapeHtml(label)}</td>
            <td style="padding:12px 14px;border-bottom:1px solid #ead7b8;text-align:right;font-weight:700;color:#211b14;">${escapeHtml(value)}</td>
        </tr>
    `).join('');

    const html = `
        <div style="margin:0;padding:24px;background:#f7efe2;font-family:Arial,sans-serif;color:#211b14;">
            <div style="max-width:680px;margin:0 auto;background:#fffaf1;border:1px solid #ead7b8;border-radius:18px;overflow:hidden;">
                <div style="padding:24px;background:#4a7c59;color:#fff;">
                    <div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">Brown Cows Admin Alert</div>
                    <h1 style="margin:10px 0 0;font-size:26px;line-height:1.2;">New Booking Received</h1>
                </div>
                <div style="padding:24px;">
                    <div style="margin:0 0 20px;padding:16px;border:1px solid #e4c58f;background:#f8efdf;border-radius:14px;">
                        <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#8b5e34;font-weight:700;">Booking Number</div>
                        <div style="margin-top:6px;font-size:24px;line-height:1.2;font-weight:800;color:#211b14;">${escapeHtml(bookingId)}</div>
                    </div>
                    <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #ead7b8;border-radius:14px;overflow:hidden;">
                        <tbody>${htmlRows}</tbody>
                    </table>
                    ${adminUrl ? `
                        <div style="margin-top:20px;">
                            <a href="${escapeHtml(adminUrl)}" style="display:inline-block;background:#7a5527;color:#ffffff;text-decoration:none;font-weight:700;border-radius:999px;padding:12px 18px;">Open Admin Dashboard</a>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    return {
        subject: `New booking received - ${propertyTitle} - ${bookingId}`,
        text,
        html
    };
};

const sendBookingConfirmationEmail = async (booking, user = {}) => {
    const guestEmail = String(booking.guestDetails?.email || '').trim().toLowerCase();
    const userEmail = String(user?.email || '').trim().toLowerCase();
    const to = guestEmail || userEmail;

    console.log('BOOKING EMAIL DEBUG:', {
        bookingId: String(booking._id || booking.id),
        bookingCode: booking.bookingCode || undefined,
        guestDetailsEmail: guestEmail || undefined,
        userEmail: userEmail || undefined,
        selectedRecipient: to || undefined,
        resendConfigured: Boolean(process.env.RESEND_API_KEY),
        resendFrom: process.env.RESEND_FROM?.trim() || 'Brown Cows Dairy <bookings@browncowsorganicfarms.com>'
    });

    if (!to) {
        console.log('Booking confirmation email skipped:', {
            bookingId: String(booking._id || booking.id),
            bookingCode: booking.bookingCode || undefined,
            to: undefined,
            emailConfigured: Boolean(process.env.RESEND_API_KEY)
        });
        return { skipped: true };
    }

    const email = buildBookingEmail(booking, user);

    try {
        const success = await sendResendEmail({
            to,
            subject: email.subject,
            text: email.text,
            html: email.html,
            replyTo: process.env.OWNER_EMAIL || process.env.EMAIL_FROM || undefined
        });

        if (!success) {
            console.error('Booking confirmation email provider returned failure:', {
                bookingId: String(booking._id || booking.id),
                bookingCode: booking.bookingCode || undefined,
                to
            });
            return { success: false };
        }

        console.log('Booking confirmation email sent:', {
            bookingId: String(booking._id || booking.id),
            bookingCode: booking.bookingCode || undefined,
            to
        });
        return { success: true };
    } catch (error) {
        console.error('Booking confirmation email failed:', {
            bookingId: String(booking._id || booking.id),
            bookingCode: booking.bookingCode || undefined,
            to,
            message: error.message
        });
        return { success: false, error };
    }
};

const sendOwnerBookingNotificationEmail = async (booking, user = {}) => {
    const to = getOwnerEmail();

    if (!to) {
        console.log('Owner booking notification skipped:', {
            bookingId: String(booking._id || booking.id),
            bookingCode: booking.bookingCode || undefined
        });
        return { skipped: true };
    }

    const guestEmail = String(booking.guestDetails?.email || user?.email || '').trim().toLowerCase();
    const email = buildOwnerBookingNotificationEmail(booking, user);

    try {
        const success = await sendResendEmail({
            to,
            subject: email.subject,
            text: email.text,
            html: email.html,
            replyTo: guestEmail || undefined
        });

        if (!success) {
            console.error('Owner booking notification provider returned failure:', {
                bookingId: String(booking._id || booking.id),
                bookingCode: booking.bookingCode || undefined,
                to
            });
            return { success: false };
        }

        console.log('Owner booking notification sent:', {
            bookingId: String(booking._id || booking.id),
            bookingCode: booking.bookingCode || undefined,
            to
        });
        return { success: true };
    } catch (error) {
        console.error('Owner booking notification failed:', {
            bookingId: String(booking._id || booking.id),
            bookingCode: booking.bookingCode || undefined,
            to,
            message: error.message
        });
        return { success: false, error };
    }
};

module.exports = {
    sendBookingConfirmationEmail,
    sendOwnerBookingNotificationEmail,
    buildBookingStatusEmail,
    buildOwnerBookingNotificationEmail
};
