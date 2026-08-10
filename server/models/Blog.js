const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    coverImage: { type: String, default: '' },
    author: { type: String, default: 'Brown Cows Organic Dairy', trim: true },
    published: { type: Boolean, default: true },
    publishedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
