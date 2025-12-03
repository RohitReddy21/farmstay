const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    capacity: { type: Number, required: true },
    images: [{ type: String }], // Array of image URLs
    amenities: [{ type: String }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Optional: if we want to link to an owner
}, { timestamps: true });

module.exports = mongoose.model('Farm', farmSchema);
