const express = require('express');
const Blog = require('../models/Blog');
const { verifyAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

const fileToPublicUrl = (req, file) => {
    if (!file) return '';
    const pathOrUrl = file.path ? String(file.path) : '';
    if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl;
    return file.filename ? `${req.protocol}://${req.get('host')}/uploads/${file.filename}` : pathOrUrl;
};

const slugify = (value) => String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const uniqueSlug = async (title, currentId = null) => {
    const base = slugify(title) || `blog-${Date.now()}`;
    let slug = base;
    let counter = 2;
    while (await Blog.exists({ slug, ...(currentId ? { _id: { $ne: currentId } } : {}) })) {
        slug = `${base}-${counter}`;
        counter += 1;
    }
    return slug;
};

const parsePublished = (value) => value === true || value === 'true' || value === 'on';

router.use(verifyAdmin);

router.get('/', async (req, res) => {
    try {
        res.json(await Blog.find().sort({ createdAt: -1 }));
    } catch (error) {
        console.error('Error fetching admin blogs:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/', upload.single('coverImage'), async (req, res) => {
    try {
        const { title, excerpt, content, author } = req.body;
        if (!title?.trim() || !excerpt?.trim() || !content?.trim()) {
            return res.status(400).json({ message: 'Title, excerpt, and content are required.' });
        }
        const published = parsePublished(req.body.published);
        const blog = await Blog.create({
            title: title.trim(),
            slug: await uniqueSlug(title),
            excerpt: excerpt.trim(),
            content: content.trim(),
            author: author?.trim() || 'Brown Cows Organic Dairy',
            coverImage: fileToPublicUrl(req, req.file),
            published,
            publishedAt: published ? new Date() : null
        });
        res.status(201).json(blog);
    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.put('/:id', upload.single('coverImage'), async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });
        const { title, excerpt, content, author } = req.body;
        if (!title?.trim() || !excerpt?.trim() || !content?.trim()) {
            return res.status(400).json({ message: 'Title, excerpt, and content are required.' });
        }
        const published = parsePublished(req.body.published);
        blog.title = title.trim();
        blog.slug = await uniqueSlug(title, blog._id);
        blog.excerpt = excerpt.trim();
        blog.content = content.trim();
        blog.author = author?.trim() || 'Brown Cows Organic Dairy';
        blog.published = published;
        blog.publishedAt = published ? (blog.publishedAt || new Date()) : null;
        if (req.file) blog.coverImage = fileToPublicUrl(req, req.file);
        await blog.save();
        res.json(blog);
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });
        res.json({ message: 'Blog deleted' });
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
