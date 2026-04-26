const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: String }, // e.g., "2 Hours", "Half Day"
    images: [{ type: String }],
    maxParticipants: { type: Number },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Experience', experienceSchema);
