const express = require('express');
const Blog = require('../models/Blog');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find({ published: true })
            .sort({ publishedAt: -1, createdAt: -1 })
            .select('-content');
        res.json(blogs);
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/:slug', async (req, res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug, published: true });
        if (!blog) return res.status(404).json({ message: 'Blog not found' });
        res.json(blog);
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
