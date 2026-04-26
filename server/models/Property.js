const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: {
        address: { type: String, required: true },
        city: { type: String },
        state: { type: String },
        zipCode: { type: String },
        coordinates: {
            lat: { type: Number },
            lng: { type: Number }
        }
    },
    images: [{ type: String }], // Cloudinary URLs
    amenities: [{ type: String }],
    category: { type: String, enum: ['Farm', 'Vineyard', 'Villa', 'Cottage'], default: 'Farm' },
    subCategory: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ['Active', 'Inactive', 'Draft'], default: 'Draft' },
    policies: {
        checkInTime: { type: String, default: '14:00' },
        checkOutTime: { type: String, default: '11:00' },
        cancellationPolicy: { type: String },
        houseRules: [{ type: String }]
    }
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
