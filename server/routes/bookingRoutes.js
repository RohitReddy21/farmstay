const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Booking = require('../models/Booking');
const Farm = require('../models/Farm');
const Payment = require('../models/Payment');
const { verifyToken } = require('../middleware/authMiddleware');
const { sendBookingNotification } = require('../utils/notifications');

const ACTIVE_BOOKING_STATUSES = ['Confirmed', 'Pending', 'Approved'];
const RETREAT_STAY_SLOT_LIMITS = {
    shared: 4,
    single: 4,
    couple: 2,
    group: 2
};

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder'
});

// Helper function to check for date overlaps
async function hasOverlap(propertyId, roomId, startDate, endDate, variation) {
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
        property: propertyId,
        ...(resourceFilter || {}),
        status: { $in: ['Confirmed', 'Pending', 'Approved'] },
        $and: [{
            $or: [
            { startDate: { $lte: startDate }, endDate: { $gte: startDate } },
            { startDate: { $lte: endDate }, endDate: { $gte: endDate } },
            { startDate: { $gte: startDate }, endDate: { $lte: endDate } }
            ]
        }]
    });
    return !!overlap;
}

function rangeIncludesWeekend(startDate, endDate) {
    const cursor = new Date(startDate);
    cursor.setHours(0, 0, 0, 0);
    const last = new Date(endDate);
    last.setHours(0, 0, 0, 0);

    while (cursor <= last) {
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

async function getRetreatStaySlotAvailability(date, stayType) {
    const slotType = normalizeRetreatStayType(stayType);
    const limit = RETREAT_STAY_SLOT_LIMITS[slotType] || 0;

    if (!limit) {
        return { slotType, limit: 0, booked: 0, available: 0 };
    }

    const { start, end } = getRetreatWeekendRange(date);
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
    }).select('retreatMeta guests');

    const booked = bookings.reduce((total, booking) => {
        if (!isStayRetreat(booking.retreatMeta)) return total;
        const bookingType = normalizeRetreatStayType(booking.retreatMeta?.stayType || booking.retreatMeta?.package);
        if (bookingType !== slotType) return total;
        return total + (slotType === 'shared' ? getBookingGuestCount(booking.guests) : 1);
    }, 0);

    return {
        slotType,
        limit,
        booked,
        available: Math.max(limit - booked, 0)
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
        cursor.setDate(cursor.getDate() + 7);
    }

    bookings.forEach((booking) => {
        if (!isStayRetreat(booking.retreatMeta)) return;
        const weekendKey = toDateValue(getRetreatWeekendStart(booking.startDate));
        const slotType = normalizeRetreatStayType(booking.retreatMeta?.stayType || booking.retreatMeta?.package);
        if (!availability[weekendKey]?.[slotType]) return;

        availability[weekendKey][slotType].booked += slotType === 'shared' ? getBookingGuestCount(booking.guests) : 1;
        availability[weekendKey][slotType].available = Math.max(
            availability[weekendKey][slotType].limit - availability[weekendKey][slotType].booked,
            0
        );
    });

    return availability;
}

const getPhoneDigits = (phone = '') => String(phone).replace(/\D/g, '');

function validateGuestPhone(guestDetails) {
    if (getPhoneDigits(guestDetails?.phone).length !== 10) {
        const error = new Error('Mobile number must be exactly 10 digits.');
        error.statusCode = 400;
        throw error;
    }
}

async function validateBookingAvailability({ propertyId, roomId, startDate, endDate, guests, guestDetails, variation, retreatMeta }) {
    const property = await Farm.findById(propertyId);
    if (!property) {
        const error = new Error('Property not found');
        error.statusCode = 404;
        throw error;
    }

    validateGuestPhone(guestDetails);

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isWeekendBlockedForProperty(property, start, end, !!retreatMeta)) {
        const error = new Error('This farm stay is available Monday to Friday only. Saturdays and Sundays are reserved for the 2-day Learning Retreat.');
        error.statusCode = 400;
        throw error;
    }

    if (retreatMeta) {
        if (isStayRetreat(retreatMeta)) {
            const slotAvailability = await getRetreatStaySlotAvailability(start, retreatMeta.stayType || retreatMeta.package);
            const requestedSlots = slotAvailability.slotType === 'shared' ? getBookingGuestCount(guests) : 1;
            if (slotAvailability.available < requestedSlots) {
                const error = new Error('Selected retreat stay slots are not available.');
                error.statusCode = 409;
                throw error;
            }
        }
    } else {
        const overlap = await hasOverlap(propertyId, roomId, start, end, variation);
        if (overlap) {
            const error = new Error('Selected dates are not available.');
            error.statusCode = 409;
            throw error;
        }
    }

    return { property, start, end };
}

// @route   POST /api/bookings/create-order
// @desc    Create a Razorpay order after pre-checking availability
// @access  Private
router.post('/create-order', verifyToken, async (req, res) => {
    const { propertyId, roomId, startDate, endDate, guests, guestDetails, totalPrice, tax, variation, retreatMeta } = req.body;

    try {
        await validateBookingAvailability({ propertyId, roomId, startDate, endDate, guests, guestDetails, variation, retreatMeta });

        const amountInPaise = Math.round((totalPrice + tax) * 100);

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
// @access  Private
router.post('/verify-payment', verifyToken, async (req, res) => {
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
                return res.json({
                    success: true,
                    message: 'Payment already verified. Booking pending admin approval.',
                    bookingId: existingPayment.booking
                });
            }

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
            } = bookingDetails;

            const { property, start, end } = await validateBookingAvailability({
                propertyId,
                roomId,
                startDate,
                endDate,
                guests,
                guestDetails,
                variation,
                retreatMeta
            });

            const booking = await Booking.create({
                user: req.user.id,
                property: propertyId,
                propertyTitle: property.title || '',
                propertyLocation: property.location || '',
                room: roomId,
                startDate: start,
                endDate: end,
                guests,
                guestDetails,
                variation,
                retreatMeta,
                totalPrice,
                tax,
                status: 'Pending',
                paymentId: razorpay_order_id,
                paymentStatus: 'Authorized',
                paymentMethod: 'Razorpay'
            });

            await Payment.create({
                booking: booking._id,
                user: req.user.id,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                amount: Number(totalPrice || 0) + Number(tax || 0),
                status: 'Authorized',
                paymentMethod: 'Razorpay'
            });

            // Notify Admin
            // sendAdminNotification(booking._id);

            return res.json({
                success: true,
                message: 'Payment verified. Booking pending admin approval.',
                bookingId: booking._id
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
// @access  Private
router.post('/cod', verifyToken, async (req, res) => {
    const { propertyId, roomId, startDate, endDate, guests, guestDetails, totalPrice, tax, variation, retreatMeta } = req.body;

    try {
        const property = await Farm.findById(propertyId);
        if (!property) return res.status(404).json({ message: 'Property not found' });
        validateGuestPhone(guestDetails);

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isWeekendBlockedForProperty(property, start, end, !!retreatMeta)) {
            return res.status(400).json({
                message: 'This farm stay is available Monday to Friday only. Saturdays and Sundays are reserved for the 2-day Learning Retreat.'
            });
        }

        if (retreatMeta) {
            if (isStayRetreat(retreatMeta)) {
                const slotAvailability = await getRetreatStaySlotAvailability(start, retreatMeta.stayType || retreatMeta.package);
                const requestedSlots = slotAvailability.slotType === 'shared' ? getBookingGuestCount(guests) : 1;
                if (slotAvailability.available < requestedSlots) {
                    return res.status(409).json({ message: 'Selected retreat stay slots are not available.' });
                }
            }
        } else {
            // Check availability
            const overlap = await hasOverlap(propertyId, roomId, start, end, variation);
            if (overlap) {
                return res.status(409).json({ message: 'Selected dates are not available.' });
            }
        }

        // Create a 'Pending' Booking with COD
        const booking = await Booking.create({
            user: req.user.id,
            property: propertyId,
            propertyTitle: property.title || '',
            propertyLocation: property.location || '',
            room: roomId,
            startDate: start,
            endDate: end,
            guests,
            guestDetails,
            variation,
            retreatMeta,
            totalPrice,
            tax,
            status: 'Pending',
            paymentStatus: 'COD',
            paymentMethod: 'COD'
        });

        // Create Payment Record
        await Payment.create({
            booking: booking._id,
            user: req.user.id,
            amount: totalPrice + tax,
            status: 'COD',
            paymentMethod: 'COD'
        });

        res.json({
            success: true,
            message: 'COD booking placed successfully.',
            bookingId: booking._id
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

// @route   GET /api/bookings/property/:id/availability
// @desc    Get unavailable dates for a property
// @access  Public
router.get('/property/:id/availability', async (req, res) => {
    try {
        const bookings = await Booking.find({
            property: req.params.id,
            status: { $in: ['Confirmed', 'Pending', 'Approved'] }
        }).select('startDate endDate room variation');
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching availability:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
