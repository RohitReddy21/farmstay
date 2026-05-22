const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const Farm = require('../models/Farm');
const BlockedDate = require('../models/BlockedDate');
const OpenDate = require('../models/OpenDate');
const bcrypt = require('bcryptjs');
const { verifyToken } = require('../middleware/authMiddleware');

const getPhoneDigits = (phone = '') => String(phone).replace(/\D/g, '');
const ACTIVE_BOOKING_STATUSES = ['Pending', 'Approved', 'Confirmed'];
const CLOSED_BOOKING_STATUSES = ['Cancelled', 'Completed', 'Rejected'];

const startOfDay = (date) => {
    const value = new Date(date);
    value.setHours(0, 0, 0, 0);
    return value;
};

const getSelectedCottages = (variation = {}) => {
    if (Array.isArray(variation?.cottages) && variation.cottages.length) return variation.cottages;
    return variation?.cottage ? [variation.cottage] : [];
};

const buildResourceFilter = (roomId, variation) => {
    const selectedCottages = getSelectedCottages(variation);
    if (selectedCottages.length) {
        return {
            $or: [
                { 'variation.cottage': { $in: selectedCottages } },
                { 'variation.cottages': { $in: selectedCottages } },
                { 'variation.cottage': { $exists: false } },
                { 'variation.cottage': null }
            ]
        };
    }

    return roomId ? { room: roomId } : {};
};

const getVariationConfig = (property, bookingVariation = {}) => {
    if (!property?.variations?.length || !bookingVariation) return null;
    return property.variations.find((variation) => (
        (bookingVariation.type && variation.type === bookingVariation.type)
        || (bookingVariation.label && variation.label === bookingVariation.label)
    )) || null;
};

const calculateBookingPricing = (property, booking, nights) => {
    const variationConfig = getVariationConfig(property, booking.variation);
    const nightlyPrice = Number(variationConfig?.price || property.price || booking.totalPrice || 0);
    const totalPrice = nightlyPrice * nights;
    const tax = Math.round(totalPrice * 0.18);
    return { totalPrice, tax };
};

const checkBookingOverlap = async (booking, startDate, endDate) => {
    const resourceFilter = buildResourceFilter(booking.room, booking.variation);
    const overlap = await Booking.findOne({
        _id: { $ne: booking._id },
        property: booking.property,
        ...(resourceFilter || {}),
        status: { $in: ACTIVE_BOOKING_STATUSES },
        $and: [{
            $or: [
                { startDate: { $lte: startDate }, endDate: { $gte: startDate } },
                { startDate: { $lte: endDate }, endDate: { $gte: endDate } },
                { startDate: { $gte: startDate }, endDate: { $lte: endDate } }
            ]
        }]
    });

    return !!overlap;
};

const checkManualDateBlock = async (propertyId, startDate, endDate) => {
    const blockedDate = await BlockedDate.findOne({
        farm: propertyId,
        startDate: { $lt: endDate },
        endDate: { $gte: startDate }
    });

    return !!blockedDate;
};

const getWeekendDates = (startDate, endDate) => {
    const dates = [];
    const cursor = startOfDay(startDate);
    const last = startOfDay(endDate);

    while (cursor < last) {
        const day = cursor.getDay();
        if (day === 0 || day === 6) dates.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
    }

    return dates;
};

const isWeekendRangeOpened = async (propertyId, startDate, endDate, variation) => {
    const weekendDates = getWeekendDates(startDate, endDate);
    if (!weekendDates.length) return true;

    const selectedCottages = getSelectedCottages(variation);
    for (const date of weekendDates) {
        const openDates = await OpenDate.find({
            farm: propertyId,
            startDate: { $lte: date },
            endDate: { $gte: date }
        }).select('cottages');

        if (!openDates.length) return false;
        if (!selectedCottages.length) continue;

        const allSelectedCottagesOpened = selectedCottages.every((cottage) => openDates.some((openDate) => (
            !openDate.cottages?.length || openDate.cottages.includes(cottage)
        )));

        if (!allSelectedCottagesOpened) return false;
    }

    return true;
};

const isWeekendBlockedForProperty = async (property, startDate, endDate, variation) => {
    if (property?.availability !== 'Monday to Friday' || !getWeekendDates(startDate, endDate).length) return false;
    return !(await isWeekendRangeOpened(property._id, startDate, endDate, variation));
};

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
        const phoneDigits = getPhoneDigits(phone);

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (phoneDigits.length !== 10) {
            return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });
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
        user.phone = phoneDigits || user.phone;

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
            .populate('property', 'title location price capacity images variations')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/users/bookings/:id
// @desc    Edit a customer booking
// @access  Private
router.put('/bookings/:id', verifyToken, async (req, res) => {
    try {
        const { startDate, endDate, guests, guestDetails = {} } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this booking' });
        }

        if (CLOSED_BOOKING_STATUSES.includes(booking.status)) {
            return res.status(400).json({ message: 'This booking can no longer be edited.' });
        }

        const today = startOfDay(new Date());
        const currentStart = startOfDay(booking.startDate);
        if (currentStart < today) {
            return res.status(400).json({ message: 'Past bookings cannot be edited.' });
        }

        const nextStart = startOfDay(startDate);
        const nextEnd = startOfDay(endDate);
        if (Number.isNaN(nextStart.getTime()) || Number.isNaN(nextEnd.getTime())) {
            return res.status(400).json({ message: 'Please select valid check-in and check-out dates.' });
        }

        if (nextStart < today) {
            return res.status(400).json({ message: 'Check-in date cannot be in the past.' });
        }

        if (nextEnd <= nextStart) {
            return res.status(400).json({ message: 'Check-out date must be after check-in date.' });
        }

        const guestCount = Number(guests);
        if (!Number.isInteger(guestCount) || guestCount < 1) {
            return res.status(400).json({ message: 'Please enter a valid number of guests.' });
        }

        const guestName = String(guestDetails.name || booking.guestDetails?.name || '').trim();
        if (!guestName) {
            return res.status(400).json({ message: 'Guest name is required.' });
        }

        const phoneDigits = getPhoneDigits(guestDetails.phone || booking.guestDetails?.phone);
        if (phoneDigits.length !== 10) {
            return res.status(400).json({ message: 'Mobile number must be exactly 10 digits.' });
        }

        const property = await Farm.findById(booking.property);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        const variationConfig = getVariationConfig(property, booking.variation);
        const guestLimit = Number(variationConfig?.capacity || property.capacity || 1);
        if (guestCount > guestLimit) {
            return res.status(400).json({ message: `Maximum ${guestLimit} guests allowed for this stay.` });
        }

        const hasWeekendBlock = await isWeekendBlockedForProperty(property, nextStart, nextEnd, booking.variation);
        if (hasWeekendBlock) {
            return res.status(400).json({ message: 'This farm stay is available Monday to Friday only unless admin opens the selected weekend dates.' });
        }

        const hasConflict = await checkBookingOverlap(booking, nextStart, nextEnd);
        if (hasConflict) {
            return res.status(409).json({ message: 'Selected dates are not available.' });
        }

        const hasManualBlock = await checkManualDateBlock(booking.property, nextStart, nextEnd);
        if (hasManualBlock) {
            return res.status(409).json({ message: 'Selected dates are blocked by the host. Please choose different dates.' });
        }

        const nights = Math.ceil((nextEnd - nextStart) / (1000 * 60 * 60 * 24));
        const pricing = calculateBookingPricing(property, booking, nights);

        booking.startDate = nextStart;
        booking.endDate = nextEnd;
        booking.guests = { adults: guestCount, children: 0 };
        booking.guestDetails.name = guestName;
        booking.guestDetails.phone = phoneDigits;
        booking.totalPrice = pricing.totalPrice;
        booking.tax = pricing.tax;

        await booking.save();

        const updatedBooking = await Booking.findById(booking._id)
            .populate('property', 'title location price capacity images variations');

        res.json({ message: 'Booking updated successfully', booking: updatedBooking });
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/users/bookings/:id
// @desc    Customer cancellations are handled by support
// @access  Private
router.delete('/bookings/:id', verifyToken, (req, res) => {
    res.status(405).json({
        message: 'Please contact Brown Cows Dairy on WhatsApp or email to cancel your booking.'
    });
});

module.exports = router;
