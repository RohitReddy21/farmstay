const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const { verifyAdmin } = require('../middleware/authMiddleware');

// @route   GET /api/admin/users
// @desc    Get all users
router.get('/users', verifyAdmin, async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/admin/bookings
// @desc    Get all bookings
router.get('/bookings', verifyAdmin, async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate('user', 'name email')
            .populate('farm', 'title');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
