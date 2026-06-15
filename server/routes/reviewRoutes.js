const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const fileToPublicUrl = (req, file) => {
    const pathOrUrl = file?.path ? String(file.path) : '';
    if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl;

    const filename = file?.filename ? String(file.filename) : '';
    if (!filename) return pathOrUrl;

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return `${baseUrl}/uploads/${filename}`;
};

const reviewPhotoUpload = (req, res, next) => {
    const handler = upload.array('photos', 4);
    handler(req, res, (err) => {
        if (!err) return next();
        console.error('Review photo upload error:', err);
        return res.status(400).json({
            message: 'Review photo upload failed',
            error: err.message
        });
    });
};

// @route   POST /api/reviews
// @desc    Add a review
// @access  Private
router.post('/', verifyToken, reviewPhotoUpload, async (req, res) => {
    try {
        const { farmId, bookingId, rating, comment } = req.body;
        const numericRating = Number(rating);
        const photos = (req.files || []).map((file) => fileToPublicUrl(req, file)).filter(Boolean);

        // Validate rating
        if (!numericRating || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Check if booking exists and belongs to user
        if (bookingId) {
            const booking = await Booking.findById(bookingId);
            if (!booking) {
                return res.status(404).json({ message: 'Booking not found' });
            }
            if (String(booking.user) !== String(req.user._id)) {
                return res.status(403).json({ message: 'Not authorized' });
            }
            if (String(booking.status || '').toLowerCase() !== 'completed') {
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
            rating: numericRating,
            comment,
            photos
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
        if (String(review.user) !== String(req.user._id)) {
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
        if (String(review.user) !== String(req.user._id)) {
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
