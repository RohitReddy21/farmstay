const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const { verifyToken } = require('../middleware/authMiddleware');

// @route   POST /api/favorites/:farmId
// @desc    Add farm to favorites
// @access  Private
router.post('/:farmId', verifyToken, async (req, res) => {
    try {
        // Check if already favorited
        const existingFavorite = await Favorite.findOne({
            user: req.user.id,
            farm: req.params.farmId
        });

        if (existingFavorite) {
            return res.status(400).json({ message: 'Farm already in favorites' });
        }

        const favorite = await Favorite.create({
            user: req.user.id,
            farm: req.params.farmId
        });

        res.status(201).json({ message: 'Added to favorites', favorite });
    } catch (error) {
        console.error('Error adding favorite:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/favorites/:farmId
// @desc    Remove farm from favorites
// @access  Private
router.delete('/:farmId', verifyToken, async (req, res) => {
    try {
        const favorite = await Favorite.findOneAndDelete({
            user: req.user.id,
            farm: req.params.farmId
        });

        if (!favorite) {
            return res.status(404).json({ message: 'Favorite not found' });
        }

        res.json({ message: 'Removed from favorites' });
    } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/favorites
// @desc    Get user's favorites
// @access  Private
router.get('/', verifyToken, async (req, res) => {
    try {
        const favorites = await Favorite.find({ user: req.user.id })
            .populate('farm')
            .sort({ createdAt: -1 });

        res.json(favorites);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/favorites/check/:farmId
// @desc    Check if farm is favorited
// @access  Private
router.get('/check/:farmId', verifyToken, async (req, res) => {
    try {
        const favorite = await Favorite.findOne({
            user: req.user.id,
            farm: req.params.farmId
        });

        res.json({ isFavorite: !!favorite });
    } catch (error) {
        console.error('Error checking favorite:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
