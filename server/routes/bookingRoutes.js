const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Farm = require('../models/Farm');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { sendBookingNotification } = require('../utils/notifications');

// @route   POST /api/bookings
// @desc    Create a booking and get Stripe Session
// @access  Private
router.post('/', async (req, res) => {
    const { farmId, startDate, endDate, guests, userId } = req.body;

    try {
        const farm = await Farm.findById(farmId);
        if (!farm) return res.status(404).json({ message: 'Farm not found' });

        // Calculate total price
        const start = new Date(startDate);
        const end = new Date(endDate);
        const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const totalPrice = nights * farm.price;

        // Check if using placeholder keys or dev mode - Mock Payment
        const isDevOrInvalidKey = !process.env.STRIPE_SECRET_KEY ||
            process.env.STRIPE_SECRET_KEY.includes('your_stripe_secret_key') ||
            process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');

        console.log('Payment Check:', { isDevOrInvalidKey, key: process.env.STRIPE_SECRET_KEY ? 'Present' : 'Missing' });

        if (isDevOrInvalidKey) {
            console.log('Using Mock Payment Flow');

            const booking = await Booking.create({
                user: userId,
                farm: farmId,
                startDate,
                endDate,
                guests,
                totalPrice,
                status: 'confirmed',
                paymentId: 'mock_payment_' + Date.now()
            });

            // Send Notifications (Mock)
            try {
                await sendBookingNotification(booking);
            } catch (err) {
                console.log('Notification failed (expected without keys):', err.message);
            }

            return res.json({ success: true, bookingId: booking._id });
        }

        // Real Stripe Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: farm.title,
                        description: `Booking for ${nights} nights`,
                    },
                    unit_amount: farm.price * 100, // Stripe expects paise
                },
                quantity: nights,
            }],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/farm/${farmId}`,
            metadata: {
                farmId,
                userId,
                startDate,
                endDate,
                guests,
                totalPrice
            }
        });

        res.json({ id: session.id });

    } catch (error) {
        console.error('Booking Error:', error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
});

// @route   POST /api/bookings/webhook
// @desc    Stripe Webhook to confirm booking
// @access  Public
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { farmId, userId, startDate, endDate, guests, totalPrice } = session.metadata;

        try {
            // Create Booking in DB
            const booking = await Booking.create({
                user: userId,
                farm: farmId,
                startDate,
                endDate,
                guests,
                totalPrice,
                status: 'confirmed',
                paymentId: session.payment_intent
            });

            // Send Notifications
            await sendBookingNotification(booking);

            console.log('Booking confirmed:', booking._id);
        } catch (error) {
            console.error('Error creating booking from webhook:', error);
        }
    }

    res.json({ received: true });
});

module.exports = router;
