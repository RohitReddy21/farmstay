const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Booking = require('../models/Booking');
const Farm = require('../models/Farm');
const Payment = require('../models/Payment');
const { verifyToken } = require('../middleware/authMiddleware');
const { sendBookingNotification } = require('../utils/notifications');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder'
});

// Helper function to check for date overlaps
async function hasOverlap(propertyId, roomId, startDate, endDate) {
    const overlap = await Booking.findOne({
        property: propertyId,
        ...(roomId && { room: roomId }),
        status: { $in: ['Confirmed', 'Pending', 'Approved'] },
        $or: [
            { startDate: { $lte: startDate }, endDate: { $gte: startDate } },
            { startDate: { $lte: endDate }, endDate: { $gte: endDate } },
            { startDate: { $gte: startDate }, endDate: { $lte: endDate } }
        ]
    });
    return !!overlap;
}

// @route   POST /api/bookings/create-order
// @desc    Create a Razorpay order and save a pending booking
// @access  Private
router.post('/create-order', verifyToken, async (req, res) => {
    const { propertyId, roomId, startDate, endDate, guests, guestDetails, totalPrice, tax, variation, retreatMeta } = req.body;

    try {
        const property = await Farm.findById(propertyId);
        if (!property) return res.status(404).json({ message: 'Property not found in DB' });

        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Check availability
        const overlap = await hasOverlap(propertyId, roomId, start, end);
        if (overlap) {
            return res.status(409).json({ message: 'Selected dates are not available.' });
        }

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

        // Create a 'Pending' Booking
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
            paymentId: order.id,
            paymentStatus: 'Pending'
        });

        // Create Payment Record
        await Payment.create({
            booking: booking._id,
            user: req.user.id,
            razorpayOrderId: order.id,
            amount: amountInPaise / 100
        });

        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            bookingId: booking._id
        });

    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    try {
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder')
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature === expectedSign) {
            // Payment is verified
            await Booking.findByIdAndUpdate(bookingId, {
                paymentStatus: 'Authorized',
                status: 'Pending' // Explicitly remains pending for admin approval
            });

            await Payment.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                { 
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature,
                    status: 'Authorized'
                }
            );

            // Notify Admin
            // sendAdminNotification(bookingId);

            return res.json({ success: true, message: 'Payment verified. Booking pending admin approval.' });
        } else {
            // Invalid signature
            await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'Failed', status: 'Cancelled' });
            return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (error) {
        console.error('Verify Payment Error:', error);
        res.status(500).json({ message: 'Server Error' });
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

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Check availability
        const overlap = await hasOverlap(propertyId, roomId, start, end);
        if (overlap) {
            return res.status(409).json({ message: 'Selected dates are not available.' });
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
        res.status(500).json({ message: 'Server Error: ' + error.message });
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
        }).select('startDate endDate room');
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching availability:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
