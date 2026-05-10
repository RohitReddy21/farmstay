const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Booking = require('../models/Booking');
const Farm = require('../models/Farm');
const Payment = require('../models/Payment');
const BlockedDate = require('../models/BlockedDate');
const mongoose = require('mongoose');
const { optionalAuth } = require('../middleware/authMiddleware');
const { sendBookingNotification } = require('../utils/notifications');
const { sendBookingWhatsAppConfirmation } = require('../utils/whatsapp');
const { sendBookingConfirmationEmail } = require('../utils/bookingEmail');
const { sendBookingSMSConfirmation } = require('../utils/sms');

const ACTIVE_BOOKING_STATUSES = ['Confirmed', 'Pending', 'Approved'];
const RETREAT_STAY_SLOT_LIMITS = {
    shared: 4,
    single: 4,
    couple: 2,
    group: 8
};
const RETREAT_DAY_EXPERIENCE_LIMIT = Number(process.env.RETREAT_DAY_EXPERIENCE_LIMIT || 25);
const BOOKING_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder'
});

// Helper function to check for date overlaps
async function hasOverlap(propertyId, roomId, startDate, endDate, variation, excludeBookingId) {
    const selectedCottages = Array.isArray(variation?.cottages) && variation.cottages.length
        ? variation.cottages
        : (variation?.cottage ? [variation.cottage] : []);
    const resourceFilter = selectedCottages.length
        ? {
            $or: [
                { 'variation.cottage': { $in: selectedCottages } },
                { 'variation.cottages': { $in: selectedCottages } },
                { 'variation.cottage': { $exists: false } },
                { 'variation.cottage': null }
            ]
        }
        : (roomId && { room: roomId });
    const overlap = await Booking.findOne({
        ...(excludeBookingId ? { _id: { $ne: excludeBookingId } } : {}),
        property: propertyId,
        ...(resourceFilter || {}),
        status: { $in: ['Confirmed', 'Pending', 'Approved'] },
        startDate: { $lt: endDate },
        endDate: { $gt: startDate }
    });
    return !!overlap;
}

async function hasManualDateBlock(propertyId, startDate, endDate) {
    const blockedDate = await BlockedDate.findOne({
        farm: propertyId,
        startDate: { $lt: endDate },
        endDate: { $gt: startDate }
    });

    return !!blockedDate;
}

function rangeIncludesWeekend(startDate, endDate) {
    const cursor = new Date(startDate);
    cursor.setHours(0, 0, 0, 0);
    const last = new Date(endDate);
    last.setHours(0, 0, 0, 0);

    while (cursor < last) {
        const day = cursor.getDay();
        if (day === 0 || day === 6) return true;
        cursor.setDate(cursor.getDate() + 1);
    }

    return false;
}

function isWeekendBlockedForProperty(property, startDate, endDate, isRetreatBooking = false) {
    // If this is a retreat booking, don't apply the weekend block (retreat IS for weekends)
    if (isRetreatBooking) return false;
    return property?.availability === 'Monday to Friday' && rangeIncludesWeekend(startDate, endDate);
}

function toDateValue(date) {
    const value = new Date(date);
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function startOfDay(date) {
    const value = new Date(date);
    value.setHours(0, 0, 0, 0);
    return value;
}

function normalizeBookingDate(date) {
    if (typeof date === 'string') {
        const dateOnly = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (dateOnly) {
            return new Date(Date.UTC(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3])));
        }
    }

    return startOfDay(date);
}

function normalizeRetreatStayType(value = '') {
    const text = String(value).toLowerCase();
    if (text.includes('couple')) return 'couple';
    if (text.includes('group') || text.includes('villa')) return 'group';
    if (text.includes('single') || text.includes('solo') || text.includes('shared')) return 'shared';
    return text.trim();
}

function getBookingGuestCount(guests = {}) {
    if (typeof guests === 'number') return Math.max(1, guests);
    const adults = Number(guests.adults || 0);
    const children = Number(guests.children || 0);
    return Math.max(1, adults + children);
}

function getRetreatWeekendStart(date) {
    const value = startOfDay(date);
    if (value.getDay() === 0) {
        value.setDate(value.getDate() - 1);
    }
    return value;
}

function getRetreatWeekendRange(date) {
    const start = getRetreatWeekendStart(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
}

function isDayRetreat(retreatMeta = {}) {
    return retreatMeta?.experience === 'day' || retreatMeta?.package === 'Day Experience';
}

function isStayRetreat(retreatMeta = {}) {
    if (!retreatMeta || isDayRetreat(retreatMeta)) return false;
    return retreatMeta.experience === 'stay' || !!retreatMeta.stayType || /farm stay|retreat/i.test(retreatMeta.package || '');
}

async function getRetreatStaySlotAvailability(date, stayType, excludeBookingId) {
    const slotType = normalizeRetreatStayType(stayType);
    const limit = RETREAT_STAY_SLOT_LIMITS[slotType] || 0;

    if (!limit) {
        return { slotType, limit: 0, booked: 0, available: 0 };
    }

    const { start, end } = getRetreatWeekendRange(date);
    const bookings = await Booking.find({
        ...(excludeBookingId ? { _id: { $ne: excludeBookingId } } : {}),
        status: { $in: ACTIVE_BOOKING_STATUSES },
        retreatMeta: { $exists: true },
        $and: [{
            $or: [
                { startDate: { $lte: start }, endDate: { $gte: start } },
                { startDate: { $lte: end }, endDate: { $gte: end } },
                { startDate: { $gte: start }, endDate: { $lte: end } }
            ]
        }]
    }).select('retreatMeta guests');

    const booked = bookings.reduce((total, booking) => {
        if (!isStayRetreat(booking.retreatMeta)) return total;
        const bookingType = normalizeRetreatStayType(booking.retreatMeta?.stayType || booking.retreatMeta?.package);
        if (bookingType !== slotType) return total;
        return total + (slotType === 'couple' ? 1 : getBookingGuestCount(booking.guests));
    }, 0);

    return {
        slotType,
        limit,
        booked,
        available: Math.max(limit - booked, 0)
    };
}

async function getRetreatDayAvailability(date, excludeBookingId) {
    const start = startOfDay(date);
    const bookings = await Booking.find({
        ...(excludeBookingId ? { _id: { $ne: excludeBookingId } } : {}),
        status: { $in: ACTIVE_BOOKING_STATUSES },
        retreatMeta: { $exists: true },
        startDate: start
    }).select('retreatMeta guests');

    const booked = bookings.reduce((total, booking) => {
        if (!isDayRetreat(booking.retreatMeta)) return total;
        return total + getBookingGuestCount(booking.guests);
    }, 0);

    return {
        booked,
        limit: RETREAT_DAY_EXPERIENCE_LIMIT,
        available: Math.max(RETREAT_DAY_EXPERIENCE_LIMIT - booked, 0)
    };
}

async function buildRetreatAvailability(startDate, endDate) {
    const start = startOfDay(startDate);
    const end = startOfDay(endDate);
    const bookings = await Booking.find({
        status: { $in: ACTIVE_BOOKING_STATUSES },
        retreatMeta: { $exists: true },
        $and: [{
            $or: [
                { startDate: { $lte: start }, endDate: { $gte: start } },
                { startDate: { $lte: end }, endDate: { $gte: end } },
                { startDate: { $gte: start }, endDate: { $lte: end } }
            ]
        }]
    }).select('startDate retreatMeta guests');

    const availability = {};
    const cursor = getRetreatWeekendStart(start);

    while (cursor <= end) {
        const weekendKey = toDateValue(cursor);
        availability[weekendKey] = Object.fromEntries(
            Object.entries(RETREAT_STAY_SLOT_LIMITS)
                .filter(([type]) => type !== 'single')
                .map(([type, limit]) => [type, { booked: 0, limit, available: limit }])
        );
        availability[weekendKey].day = {
            booked: 0,
            limit: RETREAT_DAY_EXPERIENCE_LIMIT,
            available: RETREAT_DAY_EXPERIENCE_LIMIT
        };
        cursor.setDate(cursor.getDate() + 7);
    }

    bookings.forEach((booking) => {
        if (isDayRetreat(booking.retreatMeta)) {
            const dayKey = toDateValue(startOfDay(booking.startDate));
            if (!availability[dayKey]?.day) return;

            availability[dayKey].day.booked += getBookingGuestCount(booking.guests);
            availability[dayKey].day.available = Math.max(
                availability[dayKey].day.limit - availability[dayKey].day.booked,
                0
            );
            return;
        }

        if (!isStayRetreat(booking.retreatMeta)) return;
        const weekendKey = toDateValue(getRetreatWeekendStart(booking.startDate));
        const slotType = normalizeRetreatStayType(booking.retreatMeta?.stayType || booking.retreatMeta?.package);
        if (!availability[weekendKey]?.[slotType]) return;

        availability[weekendKey][slotType].booked += slotType === 'couple' ? 1 : getBookingGuestCount(booking.guests);
        availability[weekendKey][slotType].available = Math.max(
            availability[weekendKey][slotType].limit - availability[weekendKey][slotType].booked,
            0
        );
    });

    return availability;
}

const getPhoneDigits = (phone = '') => String(phone).replace(/\D/g, '');
const isValidEmail = (email = '') => /\S+@\S+\.\S+/.test(String(email).trim());
const CLOSED_BOOKING_STATUSES = ['Cancelled', 'Completed', 'Rejected'];

function contactMatchesBooking(booking, contact = '') {
    const normalizedContact = String(contact || '').trim().toLowerCase();
    const contactDigits = getPhoneDigits(normalizedContact);
    const guestEmail = String(booking.guestDetails?.email || '').trim().toLowerCase();
    const userEmail = String(booking.user?.email || '').trim().toLowerCase();
    const guestPhone = getPhoneDigits(booking.guestDetails?.phone);
    const userPhone = getPhoneDigits(booking.user?.phone);
    const phoneMatches = contactDigits.length >= 10 && (
        (guestPhone && contactDigits.endsWith(guestPhone))
        || (userPhone && contactDigits.endsWith(userPhone))
    );
    const emailMatches = normalizedContact.includes('@') && (
        (guestEmail && normalizedContact === guestEmail)
        || (userEmail && normalizedContact === userEmail)
    );

    return emailMatches || phoneMatches;
}

function getVariationConfig(property, bookingVariation = {}) {
    if (!property?.variations?.length || !bookingVariation) return null;
    return property.variations.find((variation) => (
        (bookingVariation.type && variation.type === bookingVariation.type)
        || (bookingVariation.label && variation.label === bookingVariation.label)
    )) || null;
}

function calculateBookingPricing(property, booking, nights) {
    const variationConfig = getVariationConfig(property, booking.variation);
    const nightlyPrice = Number(variationConfig?.price || property.price || booking.totalPrice || 0);
    const totalPrice = nightlyPrice * nights;
    const tax = Math.round(totalPrice * 0.18);
    return { totalPrice, tax };
}

function validateGuestPhone(guestDetails) {
    if (getPhoneDigits(guestDetails?.phone).length !== 10) {
        const error = new Error('Mobile number must be exactly 10 digits.');
        error.statusCode = 400;
        throw error;
    }
}

function validateGuestEmail(guestDetails) {
    if (!isValidEmail(guestDetails?.email)) {
        const error = new Error('Guest email is required for booking confirmation.');
        error.statusCode = 400;
        throw error;
    }
}

async function validateBookingAvailability({ propertyId, roomId, startDate, endDate, guests, guestDetails, variation, retreatMeta, excludeBookingId }) {
    const property = await Farm.findById(propertyId);
    if (!property) {
        const error = new Error('Property not found');
        error.statusCode = 404;
        throw error;
    }

    validateGuestPhone(guestDetails);
    validateGuestEmail(guestDetails);

    const start = normalizeBookingDate(startDate);
    const end = normalizeBookingDate(endDate);

    if (!(start < end) && !isDayRetreat(retreatMeta)) {
        const error = new Error('Please select a valid date range with at least 1 night.');
        error.statusCode = 400;
        throw error;
    }

    if (isWeekendBlockedForProperty(property, start, end, !!retreatMeta)) {
        const error = new Error('This farm stay is available Monday to Friday only. Saturdays and Sundays are reserved for the 2-day Learning Retreat.');
        error.statusCode = 400;
        throw error;
    }

    const manuallyBlocked = await hasManualDateBlock(propertyId, start, end);
    if (manuallyBlocked) {
        const error = new Error('Selected dates are blocked by the host. Please choose different dates.');
        error.statusCode = 409;
        throw error;
    }

    if (retreatMeta) {
        if (isDayRetreat(retreatMeta)) {
            const dayAvailability = await getRetreatDayAvailability(start, excludeBookingId);
            const requestedGuests = getBookingGuestCount(guests);
            if (dayAvailability.available < requestedGuests) {
                const error = new Error(`Only ${dayAvailability.available} day experience seats are available for this date.`);
                error.statusCode = 409;
                throw error;
            }
        } else if (isStayRetreat(retreatMeta)) {
            const slotAvailability = await getRetreatStaySlotAvailability(start, retreatMeta.stayType || retreatMeta.package, excludeBookingId);
            const requestedSlots = slotAvailability.slotType === 'couple' ? 1 : getBookingGuestCount(guests);
            if (slotAvailability.available < requestedSlots) {
                const error = new Error('Selected retreat stay slots are not available.');
                error.statusCode = 409;
                throw error;
            }
        }
    } else {
        const overlap = await hasOverlap(propertyId, roomId, start, end, variation, excludeBookingId);
        if (overlap) {
            const error = new Error('Selected dates are not available.');
            error.statusCode = 409;
            throw error;
        }
    }

    return { property, start, end };
}

function getBookingPayloads(body = {}) {
    return Array.isArray(body.items) && body.items.length ? body.items : [body];
}

function getBookingAmount(payload = {}) {
    return Number(payload.totalPrice || 0) + Number(payload.tax || 0);
}

function generateBookingCode() {
    let code = '';
    for (let index = 0; index < 6; index += 1) {
        code += BOOKING_CODE_CHARS[crypto.randomInt(BOOKING_CODE_CHARS.length)];
    }
    return code;
}

async function createUniqueBookingCode() {
    for (let attempt = 0; attempt < 8; attempt += 1) {
        const bookingCode = generateBookingCode();
        const exists = await Booking.exists({ bookingCode });
        if (!exists) return bookingCode;
    }

    return generateBookingCode();
}

function getPublicBookingNumber(booking = {}) {
    return String(booking.bookingCode || booking._id || booking.id || '');
}

function getBookingResponsePayload(bookings = []) {
    return {
        bookingId: bookings[0]?._id,
        bookingIds: bookings.map((booking) => booking._id),
        bookingCode: getPublicBookingNumber(bookings[0]),
        bookingCodes: bookings.map(getPublicBookingNumber)
    };
}

function getBookingFindFilter(id = '') {
    const value = String(id || '').trim();
    if (mongoose.Types.ObjectId.isValid(value)) {
        return { _id: value };
    }
    return { bookingCode: value.toUpperCase() };
}

async function createBookingFromPayload(payload, req, paymentInfo = {}) {
    const {
        propertyId,
        roomId,
        startDate,
        endDate,
        guests,
        guestDetails,
        totalPrice,
        tax,
        variation,
        retreatMeta
    } = payload;
    const bookingGuestDetails = {
        ...guestDetails,
        email: String(guestDetails?.email || '').trim().toLowerCase()
    };

    const { property, start, end } = await validateBookingAvailability({
        propertyId,
        roomId,
        startDate,
        endDate,
        guests,
        guestDetails: bookingGuestDetails,
        variation,
        retreatMeta
    });

    const booking = await Booking.create({
        bookingCode: await createUniqueBookingCode(),
        ...(req.user?._id ? { user: req.user._id } : {}),
        property: propertyId,
        propertyTitle: property.title || '',
        propertyLocation: property.location || '',
        room: roomId,
        startDate: start,
        endDate: end,
        guests,
        guestDetails: bookingGuestDetails,
        variation,
        retreatMeta,
        totalPrice,
        tax,
        status: 'Pending',
        paymentId: paymentInfo.paymentId,
        paymentStatus: paymentInfo.paymentStatus,
        paymentMethod: paymentInfo.paymentMethod
    });

    await Payment.create({
        booking: booking._id,
        ...(req.user?._id ? { user: req.user._id } : {}),
        razorpayOrderId: paymentInfo.razorpayOrderId,
        razorpayPaymentId: paymentInfo.razorpayPaymentId,
        razorpaySignature: paymentInfo.razorpaySignature,
        amount: getBookingAmount(payload),
        status: paymentInfo.paymentStatus,
        paymentMethod: paymentInfo.paymentMethod
    });

    sendBookingWhatsAppConfirmation(booking).catch((whatsappError) => {
        console.error('WhatsApp notification error:', whatsappError);
    });
    await sendBookingConfirmationEmail(booking, req.user || null);
    sendBookingSMSConfirmation(booking).catch((smsError) => {
        console.error('Booking confirmation SMS error:', smsError);
    });

    return booking;
}

// @route   POST /api/bookings/create-order
// @desc    Create a Razorpay order after pre-checking availability
// @access  Public, attaches user when logged in
router.post('/create-order', optionalAuth, async (req, res) => {
    try {
        const payloads = getBookingPayloads(req.body);
        for (const payload of payloads) {
            await validateBookingAvailability({
                propertyId: payload.propertyId,
                roomId: payload.roomId,
                startDate: payload.startDate,
                endDate: payload.endDate,
                guests: payload.guests,
                guestDetails: payload.guestDetails,
                variation: payload.variation,
                retreatMeta: payload.retreatMeta
            });
        }

        const amountInPaise = Math.round(payloads.reduce((sum, payload) => sum + getBookingAmount(payload), 0) * 100);

        // Create Razorpay Order
        const options = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: `receipt_order_${Date.now()}`
        };

        let order;
        try {
            order = await razorpay.orders.create(options);
        } catch (rzpError) {
            console.error('Razorpay Error:', rzpError);
            return res.status(500).json({ 
                success: false, 
                message: 'Razorpay Secret Key is missing or invalid. Please check the backend .env configuration.' 
            });
        }

        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount
        });

    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(error.statusCode || 500).json({ message: error.statusCode ? error.message : 'Server Error: ' + error.message });
    }
});

// @route   GET /api/bookings/razorpay-key
// @desc    Get Razorpay Public Key
// @access  Public
router.get('/razorpay-key', (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder' });
});

// @route   POST /api/bookings/verify-payment
// @desc    Verify Razorpay payment signature
// @access  Public, attaches user when logged in
router.post('/verify-payment', optionalAuth, async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingDetails } = req.body;

    try {
        if (!bookingDetails) {
            return res.status(400).json({ success: false, message: 'Booking details are required after payment.' });
        }

        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder')
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature === expectedSign) {
            const existingPayment = await Payment.findOne({ razorpayPaymentId: razorpay_payment_id });
            if (existingPayment) {
                const existingBooking = await Booking.findById(existingPayment.booking).select('_id bookingCode');
                return res.json({
                    success: true,
                    message: 'Payment already verified. Booking pending approval.',
                    ...getBookingResponsePayload(existingBooking ? [existingBooking] : [{ _id: existingPayment.booking }])
                });
            }

            const payloads = getBookingPayloads(bookingDetails);
            const bookings = [];
            for (const payload of payloads) {
                const booking = await createBookingFromPayload(payload, req, {
                    paymentId: razorpay_order_id,
                    razorpayOrderId: razorpay_order_id,
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature,
                    paymentStatus: 'Authorized',
                    paymentMethod: 'Razorpay'
                });
                bookings.push(booking);
            }

            return res.json({
                success: true,
                message: 'Payment verified. Booking pending approval.',
                ...getBookingResponsePayload(bookings)
            });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (error) {
        console.error('Verify Payment Error:', error);
        res.status(error.statusCode || 500).json({ message: error.statusCode ? error.message : 'Server Error' });
    }
});

// @route   POST /api/bookings/cod
// @desc    Create a COD booking
// @access  Public, attaches user when logged in
router.post('/cod', optionalAuth, async (req, res) => {
    try {
        const payloads = getBookingPayloads(req.body);
        const bookings = [];
        for (const payload of payloads) {
            const booking = await createBookingFromPayload(payload, req, {
                paymentStatus: 'COD',
                paymentMethod: 'COD'
            });
            bookings.push(booking);
        }

        res.json({
            success: true,
            message: 'COD booking placed successfully.',
            ...getBookingResponsePayload(bookings)
        });

    } catch (error) {
        console.error('COD Booking Error:', error);
        res.status(error.statusCode || 500).json({ message: error.statusCode ? error.message : 'Server Error: ' + error.message });
    }
});

// @route   GET /api/bookings/retreat/availability
// @desc    Get retreat stay slot availability by weekend
// @access  Public
router.get('/retreat/availability', async (req, res) => {
    try {
        const start = req.query.start ? new Date(req.query.start) : new Date();
        const end = req.query.end ? new Date(req.query.end) : new Date(start);
        if (!req.query.end) {
            end.setMonth(end.getMonth() + 3);
        }

        res.json(await buildRetreatAvailability(start, end));
    } catch (error) {
        console.error('Error fetching retreat availability:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/bookings/guest/:id
// @desc    Let guest checkout customers view a booking with booking number + phone/email
// @access  Public
router.get('/guest/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const contact = String(req.query.contact || '').trim().toLowerCase();

        if (!contact) {
            return res.status(400).json({ message: 'Phone number or email is required.' });
        }

        const booking = await Booking.findOne(getBookingFindFilter(id))
            .populate('property', 'title location images price capacity variations')
            .populate('user', 'name email phone')
            .lean();

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        if (!contactMatchesBooking(booking, contact)) {
            return res.status(403).json({ message: 'Booking details do not match this phone/email.' });
        }

        res.json(booking);
    } catch (error) {
        console.error('Guest booking lookup error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/bookings/guest/:id
// @desc    Let guest checkout customers edit an eligible booking from the same saved contact
// @access  Public with booking contact match
router.put('/guest/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { contact, startDate, endDate, guests, guestDetails = {} } = req.body;

        if (!contact) {
            return res.status(400).json({ message: 'Phone number or email is required.' });
        }

        const booking = await Booking.findOne(getBookingFindFilter(id))
            .populate('property', 'title location images price capacity variations')
            .populate('user', 'name email phone');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        if (!contactMatchesBooking(booking, contact)) {
            return res.status(403).json({ message: 'Booking details do not match this phone/email.' });
        }

        if (CLOSED_BOOKING_STATUSES.includes(booking.status)) {
            return res.status(400).json({ message: 'This booking can no longer be edited.' });
        }

        const today = startOfDay(new Date());
        const currentStart = startOfDay(booking.startDate);
        if (currentStart < today) {
            return res.status(400).json({ message: 'Past bookings cannot be edited.' });
        }

        const guestCount = Number(guests);
        if (!Number.isInteger(guestCount) || guestCount < 1) {
            return res.status(400).json({ message: 'Please enter a valid number of guests.' });
        }

        const nextGuestDetails = {
            ...booking.guestDetails,
            ...guestDetails,
            name: String(guestDetails.name || booking.guestDetails?.name || '').trim(),
            phone: getPhoneDigits(guestDetails.phone || booking.guestDetails?.phone),
            email: String(guestDetails.email || booking.guestDetails?.email || '').trim().toLowerCase()
        };

        if (!nextGuestDetails.name) {
            return res.status(400).json({ message: 'Guest name is required.' });
        }

        const property = booking.property;
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        const variationConfig = getVariationConfig(property, booking.variation);
        const guestLimit = Number(variationConfig?.capacity || property.capacity || 1);
        if (guestCount > guestLimit) {
            return res.status(400).json({ message: `Maximum ${guestLimit} guests allowed for this stay.` });
        }

        const { start, end } = await validateBookingAvailability({
            propertyId: property._id,
            roomId: booking.room,
            startDate,
            endDate,
            guests: { adults: guestCount, children: 0 },
            guestDetails: nextGuestDetails,
            variation: booking.variation,
            retreatMeta: booking.retreatMeta,
            excludeBookingId: booking._id
        });

        if (start < today) {
            return res.status(400).json({ message: 'Check-in date cannot be in the past.' });
        }

        const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
        const pricing = calculateBookingPricing(property, booking, nights);

        booking.startDate = start;
        booking.endDate = end;
        booking.guests = { adults: guestCount, children: 0 };
        booking.guestDetails = nextGuestDetails;
        booking.totalPrice = pricing.totalPrice;
        booking.tax = pricing.tax;

        await booking.save();

        const updatedBooking = await Booking.findById(booking._id)
            .populate('property', 'title location images price capacity variations')
            .populate('user', 'name email phone')
            .lean();

        res.json({ message: 'Booking updated successfully', booking: updatedBooking });
    } catch (error) {
        console.error('Guest booking update error:', error);
        res.status(error.statusCode || 500).json({ message: error.statusCode ? error.message : 'Server Error' });
    }
});

// @route   GET /api/bookings/property/:id/availability
// @desc    Get unavailable dates for a property
// @access  Public
router.get('/property/:id/availability', async (req, res) => {
    try {
        const bookings = await Booking.find({
            property: req.params.id,
            status: { $in: ['Confirmed', 'Pending', 'Approved'] }
        }).select('startDate endDate room variation status');
        const blockedDates = await BlockedDate.find({ farm: req.params.id }).select('startDate endDate reason');
        res.json([
            ...bookings.map((booking) => booking.toObject()),
            ...blockedDates.map((block) => ({
                _id: block._id,
                startDate: block.startDate,
                endDate: block.endDate,
                reason: block.reason,
                source: 'manual-block',
                variation: null
            }))
        ]);
    } catch (error) {
        console.error('Error fetching availability:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
