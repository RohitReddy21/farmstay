const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const bcrypt = require('bcryptjs');
const { verifyToken } = require('../middleware/authMiddleware');

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { name, email, phone } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if email is already taken by another user
        if (email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;

        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/users/password
// @desc    Change password
// @access  Private
router.put('/password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide both current and new password' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/users/bookings
// @desc    Get user's bookings
// @access  Private
router.get('/bookings', verifyToken, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('farm', 'title location price images')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/users/bookings/:id
// @desc    Cancel a booking
// @access  Private
router.delete('/bookings/:id', verifyToken, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if booking belongs to user (convert both to strings for comparison)
        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to cancel this booking' });
        }

        // Check if booking can be cancelled (only pending or confirmed)
        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: 'Booking is already cancelled' });
        }

        if (booking.status === 'completed') {
            return res.status(400).json({ message: 'Cannot cancel completed booking' });
        }

        // Check if booking is in the future
        const now = new Date();
        if (new Date(booking.startDate) < now) {
            return res.status(400).json({ message: 'Cannot cancel past bookings' });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json({ message: 'Booking cancelled successfully', booking });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
