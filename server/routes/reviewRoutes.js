const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { verifyToken } = require('../middleware/authMiddleware');

// @route   POST /api/reviews
// @desc    Add a review
// @access  Private
router.post('/', verifyToken, async (req, res) => {
    try {
        const { farmId, bookingId, rating, comment } = req.body;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Check if booking exists and belongs to user
        if (bookingId) {
            const booking = await Booking.findById(bookingId);
            if (!booking) {
                return res.status(404).json({ message: 'Booking not found' });
            }
            if (booking.user.toString() !== req.user._id) {
                return res.status(403).json({ message: 'Not authorized' });
            }
            if (booking.status !== 'completed') {
                return res.status(400).json({ message: 'Can only review completed bookings' });
            }
        }

        // Check if user already reviewed this farm for this booking
        const existingReview = await Review.findOne({
            user: req.user._id,
            farm: farmId,
            booking: bookingId
        });

        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this booking' });
        }

        const review = await Review.create({
            user: req.user._id,
            farm: farmId,
            booking: bookingId,
            rating,
            comment
        });

        const populatedReview = await Review.findById(review._id)
            .populate('user', 'name');

        res.status(201).json(populatedReview);
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/reviews/farm/:id
// @desc    Get reviews for a farm
// @access  Public
router.get('/farm/:id', async (req, res) => {
    try {
        const reviews = await Review.find({ farm: req.params.id })
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        // Calculate average rating
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : 0;

        res.json({
            reviews,
            averageRating: Math.round(avgRating * 10) / 10,
            totalReviews: reviews.length
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { rating, comment } = req.body;

        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if review belongs to user
        if (review.user.toString() !== req.user._id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        review.rating = rating || review.rating;
        review.comment = comment || review.comment;

        await review.save();

        const updatedReview = await Review.findById(review._id)
            .populate('user', 'name');

        res.json(updatedReview);
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if review belongs to user
        if (review.user.toString() !== req.user._id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await review.deleteOne();

        res.json({ message: 'Review deleted' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
