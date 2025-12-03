const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Farm = require('../models/Farm');
const Booking = require('../models/Booking');
const { verifyAdmin } = require('../middleware/authMiddleware');

// @route   GET /api/db/view
// @desc    View all database contents
router.get('/view', verifyAdmin, async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        const farms = await Farm.find({});
        const bookings = await Booking.find({})
            .populate('user', 'name email')
            .populate('farm', 'title');

        res.json({
            database: 'In-Memory MongoDB',
            collections: {
                users: {
                    count: users.length,
                    data: users
                },
                farms: {
                    count: farms.length,
                    data: farms
                },
                bookings: {
                    count: bookings.length,
                    data: bookings
                }
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
