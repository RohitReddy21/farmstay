const express = require('express');
const router = express.Router();
const Farm = require('../models/Farm');

// @route   GET /api/farms
// @desc    Get all farms with filters
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { location, minPrice, maxPrice, capacity } = req.query;
        let query = {};

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (capacity) {
            query.capacity = { $gte: Number(capacity) };
        }

        const farms = await Farm.find(query);
        res.json(farms);
    } catch (error) {
        console.error('Error fetching farms:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/farms/:id
// @desc    Get single farm
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const farm = await Farm.findById(req.params.id);
        if (farm) {
            res.json(farm);
        } else {
            res.status(404).json({ message: 'Farm not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/farms (Seeding/Admin)
// @desc    Create a farm
// @access  Public (for now)
router.post('/', async (req, res) => {
    try {
        const farm = await Farm.create(req.body);
        res.status(201).json(farm);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
