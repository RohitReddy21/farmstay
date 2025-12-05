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


// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
router.put('/users/:id/role', verifyAdmin, async (req, res) => {
    try {
        const { role } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
router.delete('/users/:id', verifyAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/admin/bookings/:id
// @desc    Delete a booking
router.delete('/bookings/:id', verifyAdmin, async (req, res) => {
    try {
        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: 'Booking removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/admin/farms/:id
// @desc    Delete a farm
router.delete('/farms/:id', verifyAdmin, async (req, res) => {
    try {
        const Farm = require('../models/Farm');
        await Farm.findByIdAndDelete(req.params.id);
        res.json({ message: 'Farm removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
