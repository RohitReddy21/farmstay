const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    guests: { type: Number, default: 1 },
    source: { type: String, default: 'website', trim: true },
    retreatName: { type: String, trim: true },
    status: {
        type: String,
        enum: ['New', 'Contacted', 'Converted', 'Closed'],
        default: 'New'
    }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
