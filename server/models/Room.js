const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    name: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['Mud Cottage', 'Limestone Villa', 'Standard', 'Deluxe', 'Suite'], default: 'Standard' },
    capacity: {
        adults: { type: Number, required: true },
        children: { type: Number, default: 0 }
    },
    beds: [{
        type: { type: String, enum: ['King', 'Queen', 'Single', 'Sofa Bed'] },
        count: { type: Number, default: 1 }
    }],
    pricing: {
        basePrice: { type: Number, required: true },
        weekendPrice: { type: Number },
        seasonalPricing: [{
            name: { type: String },
            startDate: { type: Date },
            endDate: { type: Date },
            price: { type: Number }
        }]
    },
    images: [{ type: String }],
    amenities: [{ type: String }],
    status: { type: String, enum: ['Available', 'Maintenance', 'Inactive'], default: 'Available' },
    quantity: { type: Number, default: 1 } // Number of identical rooms
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
